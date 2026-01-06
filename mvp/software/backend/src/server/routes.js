const express = require('express');
const router = express.Router();
const { requireAuth } = require('./authMiddleware');
const { db } = require('./firestore');

router.get('/health', (req, res) => {
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

router.get('/barbershops', requireAuth, async (req, res) => {
  try {
    const snap = await db.collection('barbershops').get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch barbershops' });
  }
});

module.exports = router;
