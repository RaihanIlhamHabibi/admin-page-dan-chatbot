const express = require('express');
const router = express.Router();
const { askAI, getAIConfig } = require('../services/aiService');

let chatHistory = [];

router.get('/', (req, res) => {
  res.render('chatbot/index', {
    title: 'Chatbot AI',
    chatHistory,
    aiConfig: getAIConfig(),
    error: null
  });
});

router.post('/', async (req, res) => {
  const message = String(req.body.message || '').trim();
  const aiConfig = getAIConfig();

  if (!message) {
    res.render('chatbot/index', {
      title: 'Chatbot AI',
      chatHistory,
      aiConfig,
      error: 'Pesan tidak boleh kosong.'
    });
    return;
  }

  const previousHistory = [...chatHistory];
  chatHistory.push({ role: 'user', content: message });

  try {
    const answer = await askAI(message, previousHistory);
    chatHistory.push({ role: 'bot', content: answer });

    res.render('chatbot/index', {
      title: 'Chatbot AI',
      chatHistory,
      aiConfig: getAIConfig(),
      error: null
    });
  } catch (error) {
    const errorMessage = `Terjadi error: ${error.message}`;
    chatHistory.push({ role: 'bot', content: errorMessage });

    res.render('chatbot/index', {
      title: 'Chatbot AI',
      chatHistory,
      aiConfig: getAIConfig(),
      error: error.message
    });
  }
});

router.post('/clear', (req, res) => {
  chatHistory = [];
  res.redirect('/chatbot');
});

module.exports = router;
