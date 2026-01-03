const express = require("express");
const { auth } = require("./middleware_auth");
const { col, doc, db } = require("./firebase");
const {
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  serverTimestamp,
  runTransaction,
} = require("firebase/firestore");
const { MAX_AUTO_WAIT_MINUTES } = require("./config");

const router = express.Router();

async function getShop(shopId) {
  const ref = doc(col.barberShop, shopId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

async function getWaitingCount(shopId) {
  const q = query(
    col.position,
    where("barber_shop_id", "==", shopId),
    where("status", "==", "waiting")
  );
  const snap = await getDocs(q);
  return snap.size;
}

// Next sequential number without relying on composite indexes.
async function getNextNumber(shopId) {
  const shopRef = doc(col.barberShop, shopId);
  const next = await runTransaction(db, async (tx) => {
    const s = await tx.get(shopRef);
    const current = s.exists() ? Number(s.data().nextNumber || 0) : 0;
    const updated = current + 1;
    tx.update(shopRef, { nextNumber: updated });
    return updated;
  });
  return next;
}

// Client asks to enter queue
router.post("/:shopId/join", auth("client"), async (req, res) => {
  try {
    const shopId = req.params.shopId;
    const shop = await getShop(shopId);
    if (!shop) return res.status(404).json({ error: "Shop not found" });
    if (!shop.isOpen) return res.status(409).json({ error: "Shop closed" });

    const waiting = await getWaitingCount(shopId);
    const estimate = waiting * Number(shop.avgServiceTime || 0);
    const status = estimate <= MAX_AUTO_WAIT_MINUTES ? "waiting" : "pending";
    const number = await getNextNumber(shopId);

    const created = await addDoc(col.position, {
      barber_shop_id: shopId,
      createdAt: serverTimestamp(),
      number,
      status,
      user_id: req.user.id,
    });
    res
      .status(201)
      .json({ id: created.id, number, status, estimateMinutes: estimate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Barber adds anonymous visitor
router.post("/:shopId/anonymous", auth("barber"), async (req, res) => {
  try {
    const shopId = req.params.shopId;
    const number = await getNextNumber(shopId);
    const created = await addDoc(col.position, {
      barber_shop_id: shopId,
      createdAt: serverTimestamp(),
      number,
      status: "waiting",
      user_id: null,
    });
    res.status(201).json({ id: created.id, number });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Barber accepts pending request
router.post("/:shopId/accept/:positionId", auth("barber"), async (req, res) => {
  try {
    const ref = doc(col.position, req.params.positionId);
    await updateDoc(ref, { status: "waiting" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Client enters queue (poll listing)
router.get("/:shopId", async (req, res) => {
  try {
    const shopId = req.params.shopId;
    const q = query(col.position, where("barber_shop_id", "==", shopId));
    const snap = await getDocs(q);
    const list = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => Number(a.number || 0) - Number(b.number || 0));
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Barber calls next
router.post("/:shopId/next", auth("barber"), async (req, res) => {
  try {
    const shopId = req.params.shopId;
    const q = query(
      col.position,
      where("barber_shop_id", "==", shopId),
      where("status", "==", "waiting")
    );
    const snap = await getDocs(q);
    if (snap.empty) return res.status(404).json({ error: "No one waiting" });
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const nextDoc = docs.reduce((min, cur) => {
      if (!min) return cur;
      return Number(cur.number || 0) < Number(min.number || 0) ? cur : min;
    }, null);
    const d = nextDoc;
    const ref = doc(col.position, d.id);
    await updateDoc(ref, { status: "called" });
    res.json({ called: d });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
