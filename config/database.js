const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const databaseDir = path.join(__dirname, '..', 'database');
const databasePath = path.join(databaseDir, 'database.sqlite');

if (!fs.existsSync(databaseDir)) {
  fs.mkdirSync(databaseDir, { recursive: true });
}

let SQL = null;
let db = null;
let inTransaction = false;

function getDatabase() {
  if (!db) {
    throw new Error('Database belum diinisialisasi.');
  }

  return db;
}

function saveDatabase() {
  const currentDb = getDatabase();
  const data = currentDb.export();
  fs.writeFileSync(databasePath, Buffer.from(data));
}

function selectAll(sql, params = []) {
  const currentDb = getDatabase();
  const stmt = currentDb.prepare(sql);
  const rows = [];

  try {
    stmt.bind(params);

    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
  } finally {
    stmt.free();
  }

  return rows;
}

async function runQuery(sql, params = []) {
  const currentDb = getDatabase();
  const normalizedSql = sql.trim().toLowerCase();

  currentDb.run(sql, params);

  if (normalizedSql.startsWith('begin')) {
    inTransaction = true;
  }

  if (normalizedSql.startsWith('commit')) {
    inTransaction = false;
    saveDatabase();
  }

  if (normalizedSql.startsWith('rollback')) {
    inTransaction = false;
    saveDatabase();
  }

  if (
    !inTransaction &&
    !normalizedSql.startsWith('select') &&
    !normalizedSql.startsWith('pragma') &&
    !normalizedSql.startsWith('commit') &&
    !normalizedSql.startsWith('rollback')
  ) {
    saveDatabase();
  }

  let id = null;
  if (normalizedSql.startsWith('insert')) {
    const row = selectAll('SELECT last_insert_rowid() AS id')[0];
    id = row ? row.id : null;
  }

  return {
    id,
    changes: currentDb.getRowsModified()
  };
}

async function getQuery(sql, params = []) {
  const rows = selectAll(sql, params);
  return rows[0];
}

async function allQuery(sql, params = []) {
  return selectAll(sql, params);
}

async function initDatabase() {
  SQL = await initSqlJs();

  if (fs.existsSync(databasePath)) {
    const fileBuffer = fs.readFileSync(databasePath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  await runQuery('PRAGMA foreign_keys = ON');

  await runQuery(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_code TEXT NOT NULL UNIQUE,
      product_name TEXT NOT NULL,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS product_stocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL UNIQUE,
      quantity INTEGER NOT NULL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT NOT NULL UNIQUE,
      product_id INTEGER NOT NULL,
      buyer_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL,
      total_price INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'COMPLETED',
      purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      cancelled_at DATETIME,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  const productCount = await getQuery('SELECT COUNT(*) AS total FROM products');

  if (productCount.total === 0) {
    const products = [
      ['PRD001', 'Keyboard Mechanical', 'Aksesoris Komputer', 350000, 'Keyboard mechanical untuk kebutuhan kerja dan gaming.'],
      ['PRD002', 'Mouse Wireless', 'Aksesoris Komputer', 120000, 'Mouse wireless ergonomis dengan koneksi stabil.'],
      ['PRD003', 'Monitor 24 Inch', 'Perangkat Komputer', 1450000, 'Monitor 24 inch Full HD untuk produktivitas.'],
      ['PRD004', 'Flashdisk 64GB', 'Storage', 85000, 'Flashdisk kapasitas 64GB.'],
      ['PRD005', 'Harddisk External 1TB', 'Storage', 720000, 'Harddisk eksternal 1TB untuk backup data.'],
      ['PRD006', 'Webcam Full HD', 'Aksesoris Komputer', 275000, 'Webcam Full HD untuk meeting online.'],
      ['PRD007', 'Headset Gaming', 'Aksesoris Komputer', 250000, 'Headset dengan microphone dan suara jernih.'],
      ['PRD008', 'Laptop Stand', 'Aksesoris Komputer', 95000, 'Stand laptop lipat untuk meja kerja.'],
      ['PRD009', 'Kabel HDMI 2M', 'Kabel', 45000, 'Kabel HDMI panjang 2 meter.'],
      ['PRD010', 'USB Hub 4 Port', 'Aksesoris Komputer', 110000, 'USB hub dengan 4 port tambahan.']
    ];

    const stocks = [20, 35, 12, 50, 15, 18, 25, 30, 60, 22];

    await runQuery('BEGIN TRANSACTION');

    for (let index = 0; index < products.length; index += 1) {
      const result = await runQuery(
        `INSERT INTO products (product_code, product_name, category, price, description)
         VALUES (?, ?, ?, ?, ?)`,
        products[index]
      );

      await runQuery(
        `INSERT INTO product_stocks (product_id, quantity)
         VALUES (?, ?)`,
        [result.id, stocks[index]]
      );
    }

    await runQuery('COMMIT');
  }

  saveDatabase();
}

module.exports = {
  runQuery,
  getQuery,
  allQuery,
  initDatabase
};
