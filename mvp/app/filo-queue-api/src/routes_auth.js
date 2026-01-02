const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config');
const { col } = require('./firebase');
const { addDoc, getDocs, query, where, limit } = require('firebase/firestore');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, name, password, role } = req.body;
    if (!email || !name || !password || !role) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const existingQ = query(col.user, where('email', '==', email), limit(1));
    const existingSnap = await getDocs(existingQ);
    if (!existingSnap.empty) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const docRef = await addDoc(col.user, { email, name, password: hash, role });

    return res.status(201).json({ id: docRef.id, email, name, role });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
      const q = query(col.user, where('email', '==', email), limit(1));
      const snap = await getDocs(q);
    if (snap.empty) return res.status(401).json({ error: 'Invalid credentials' });
    const userDoc = snap.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
