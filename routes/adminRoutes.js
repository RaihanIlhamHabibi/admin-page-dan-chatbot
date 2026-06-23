const express = require('express');
const router = express.Router();

const { allQuery, getQuery, runQuery } = require('../config/database');

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value);
}

function createInvoiceNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const time = now.toTimeString().slice(0, 8).replace(/:/g, '');
  const random = Math.floor(Math.random() * 900 + 100);
  return `INV-${date}-${time}-${random}`;
}

router.get('/', async (req, res) => {
  try {
    const totalProducts = await getQuery('SELECT COUNT(*) AS total FROM products');
    const totalStock = await getQuery('SELECT SUM(quantity) AS total FROM product_stocks');
    const totalPurchases = await getQuery('SELECT COUNT(*) AS total FROM purchases');
    const completedPurchases = await getQuery("SELECT COUNT(*) AS total FROM purchases WHERE status = 'COMPLETED'");
    const cancelledPurchases = await getQuery("SELECT COUNT(*) AS total FROM purchases WHERE status = 'CANCELLED'");

    res.render('admin/dashboard', {
      title: 'Dashboard Admin',
      stats: {
        totalProducts: totalProducts.total || 0,
        totalStock: totalStock.total || 0,
        totalPurchases: totalPurchases.total || 0,
        completedPurchases: completedPurchases.total || 0,
        cancelledPurchases: cancelledPurchases.total || 0
      }
    });
  } catch (error) {
    res.status(500).render('error', {
      title: 'Error',
      message: error.message
    });
  }
});

router.get('/products', async (req, res) => {
  try {
    const products = await allQuery(`
      SELECT
        products.id,
        products.product_code,
        products.product_name,
        products.category,
        products.price,
        products.description,
        product_stocks.quantity
      FROM products
      JOIN product_stocks ON product_stocks.product_id = products.id
      ORDER BY products.id ASC
    `);

    res.render('admin/products', {
      title: 'Data Produk & Stok',
      products,
      formatCurrency,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    res.status(500).render('error', {
      title: 'Error',
      message: error.message
    });
  }
});

router.get('/products/edit/:id', async (req, res) => {
  const productId = Number(req.params.id);

  try {
    const product = await getQuery(`
      SELECT
        products.id,
        products.product_code,
        products.product_name,
        products.category,
        products.price,
        products.description,
        product_stocks.quantity
      FROM products
      JOIN product_stocks ON product_stocks.product_id = products.id
      WHERE products.id = ?
    `, [productId]);

    if (!product) {
      res.redirect('/admin/products?error=Produk tidak ditemukan');
      return;
    }

    res.render('admin/edit-product', {
      title: 'Edit Produk',
      product,
      formatCurrency,
      error: req.query.error,
      success: req.query.success
    });
  } catch (error) {
    res.status(500).render('error', {
      title: 'Error',
      message: error.message
    });
  }
});

router.post('/products/:id/update', async (req, res) => {
  const productId = Number(req.params.id);
  const productName = String(req.body.product_name || '').trim();
  const category = String(req.body.category || '').trim();
  const description = String(req.body.description || '').trim();
  const price = Number(req.body.price);
  const quantity = Number(req.body.quantity);

  if (!productName || !category || !price || price <= 0 || !Number.isFinite(quantity) || quantity < 0) {
    res.redirect(`/admin/products/edit/${productId}?error=Data produk tidak lengkap atau nilai tidak valid`);
    return;
  }

  try {
    await runQuery('BEGIN TRANSACTION');

    await runQuery(
      `UPDATE products
       SET product_name = ?, category = ?, description = ?, price = ?
       WHERE id = ?`,
      [productName, category, description, price, productId]
    );

    await runQuery(
      `UPDATE product_stocks
       SET quantity = ?, updated_at = CURRENT_TIMESTAMP
       WHERE product_id = ?`,
      [quantity, productId]
    );

    await runQuery('COMMIT');
    res.redirect(`/admin/products/edit/${productId}?success=Produk berhasil diperbarui`);
  } catch (error) {
    await runQuery('ROLLBACK').catch(() => {});
    res.redirect(`/admin/products/edit/${productId}?error=${encodeURIComponent(error.message)}`);
  }
});

router.get('/products/create', async (req, res) => {
  try {
    res.render('admin/create-product', {
      title: 'Tambah Produk',
      error: req.query.error,
      success: req.query.success
    });
  } catch (error) {
    res.status(500).render('error', {
      title: 'Error',
      message: error.message
    });
  }
});

router.post('/products', async (req, res) => {
  const productCode = String(req.body.product_code || '').trim();
  const productName = String(req.body.product_name || '').trim();
  const category = String(req.body.category || '').trim();
  const description = String(req.body.description || '').trim();
  const price = Number(req.body.price);
  const quantity = Number(req.body.quantity);

  if (!productCode || !productName || !category || !price || price <= 0 || !Number.isFinite(quantity) || quantity < 0) {
    res.redirect('/admin/products/create?error=Data produk tidak lengkap atau nilai tidak valid');
    return;
  }

  try {
    await runQuery('BEGIN TRANSACTION');

    const existing = await getQuery('SELECT id FROM products WHERE product_code = ?', [productCode]);
    if (existing) {
      await runQuery('ROLLBACK');
      res.redirect('/admin/products/create?error=Kode produk sudah digunakan');
      return;
    }

    const result = await runQuery(
      `INSERT INTO products (product_code, product_name, category, price, description)
       VALUES (?, ?, ?, ?, ?)`,
      [productCode, productName, category, price, description]
    );

    await runQuery(
      `INSERT INTO product_stocks (product_id, quantity)
       VALUES (?, ?)`,
      [result.id, quantity]
    );

    await runQuery('COMMIT');
    res.redirect(`/admin/products?success=Produk berhasil ditambahkan`);
  } catch (error) {
    await runQuery('ROLLBACK').catch(() => {});
    res.redirect(`/admin/products/create?error=${encodeURIComponent(error.message)}`);
  }
});

router.post('/products/:id/delete', async (req, res) => {
  const productId = Number(req.params.id);

  try {
    await runQuery('BEGIN TRANSACTION');
    await runQuery('DELETE FROM products WHERE id = ?', [productId]);
    await runQuery('COMMIT');
    res.redirect('/admin/products?success=Produk berhasil dihapus');
  } catch (error) {
    await runQuery('ROLLBACK').catch(() => {});
    res.redirect(`/admin/products?error=${encodeURIComponent(error.message)}`);
  }
});

router.get('/purchases', async (req, res) => {
  try {
    const purchases = await allQuery(`
      SELECT
        purchases.id,
        purchases.invoice_number,
        purchases.buyer_name,
        purchases.quantity,
        purchases.price,
        purchases.total_price,
        purchases.status,
        purchases.purchase_date,
        purchases.cancelled_at,
        products.product_name,
        products.product_code
      FROM purchases
      JOIN products ON products.id = purchases.product_id
      ORDER BY purchases.id DESC
    `);

    res.render('admin/purchases', {
      title: 'Data Pembelian',
      purchases,
      formatCurrency,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    res.status(500).render('error', {
      title: 'Error',
      message: error.message
    });
  }
});

router.get('/purchases/create', async (req, res) => {
  try {
    const products = await allQuery(`
      SELECT
        products.id,
        products.product_code,
        products.product_name,
        products.price,
        product_stocks.quantity
      FROM products
      JOIN product_stocks ON product_stocks.product_id = products.id
      ORDER BY products.product_name ASC
    `);

    res.render('admin/create-purchase', {
      title: 'Input Pembelian',
      products,
      formatCurrency,
      error: req.query.error
    });
  } catch (error) {
    res.status(500).render('error', {
      title: 'Error',
      message: error.message
    });
  }
});

router.post('/purchases', async (req, res) => {
  const productId = Number(req.body.product_id);
  const buyerName = String(req.body.buyer_name || '').trim();
  const quantity = Number(req.body.quantity);

  if (!productId || !buyerName || !quantity || quantity <= 0) {
    res.redirect('/admin/purchases/create?error=Data pembelian belum lengkap atau jumlah tidak valid');
    return;
  }

  try {
    const product = await getQuery(`
      SELECT
        products.id,
        products.price,
        products.product_name,
        product_stocks.quantity AS stock_quantity
      FROM products
      JOIN product_stocks ON product_stocks.product_id = products.id
      WHERE products.id = ?
    `, [productId]);

    if (!product) {
      res.redirect('/admin/purchases/create?error=Produk tidak ditemukan');
      return;
    }

    if (quantity > product.stock_quantity) {
      res.redirect('/admin/purchases/create?error=Stok produk tidak cukup');
      return;
    }

    const invoiceNumber = createInvoiceNumber();
    const totalPrice = product.price * quantity;

    await runQuery('BEGIN TRANSACTION');

    await runQuery(`
      INSERT INTO purchases
        (invoice_number, product_id, buyer_name, quantity, price, total_price, status)
      VALUES
        (?, ?, ?, ?, ?, ?, 'COMPLETED')
    `, [invoiceNumber, productId, buyerName, quantity, product.price, totalPrice]);

    await runQuery(`
      UPDATE product_stocks
      SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP
      WHERE product_id = ?
    `, [quantity, productId]);

    await runQuery('COMMIT');

    res.redirect('/admin/purchases?success=Pembelian berhasil ditambahkan');
  } catch (error) {
    await runQuery('ROLLBACK').catch(() => {});
    res.redirect(`/admin/purchases/create?error=${encodeURIComponent(error.message)}`);
  }
});

router.post('/purchases/:id/cancel', async (req, res) => {
  const purchaseId = Number(req.params.id);

  try {
    const purchase = await getQuery('SELECT * FROM purchases WHERE id = ?', [purchaseId]);

    if (!purchase) {
      res.redirect('/admin/purchases?error=Pembelian tidak ditemukan');
      return;
    }

    if (purchase.status === 'CANCELLED') {
      res.redirect('/admin/purchases?error=Pembelian sudah pernah dicancel');
      return;
    }

    await runQuery('BEGIN TRANSACTION');

    await runQuery(`
      UPDATE purchases
      SET status = 'CANCELLED', cancelled_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [purchaseId]);

    await runQuery(`
      UPDATE product_stocks
      SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP
      WHERE product_id = ?
    `, [purchase.quantity, purchase.product_id]);

    await runQuery('COMMIT');

    res.redirect('/admin/purchases?success=Pembelian berhasil dicancel dan stok dikembalikan');
  } catch (error) {
    await runQuery('ROLLBACK').catch(() => {});
    res.redirect(`/admin/purchases?error=${encodeURIComponent(error.message)}`);
  }
});

module.exports = router;
