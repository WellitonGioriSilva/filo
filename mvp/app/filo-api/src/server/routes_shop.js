const express = require("express");
const { auth } = require("./middleware_auth");
const { col, doc } = require("./firebase");
const {
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
} = require("firebase/firestore");

const router = express.Router();

// Create a barbershop (barber only)
router.post("/", auth("barber"), async (req, res) => {
  try {
    const { name, addres, avgServiceTime } = req.body; // keeping 'addres' as per requested schema
    if (!name || !addres || !avgServiceTime)
      return res.status(400).json({ error: "Missing fields" });
    const created = await addDoc(col.barberShop, {
      name,
      addres,
      avgServiceTime: Number(avgServiceTime),
      isOpen: false,
      user_id: req.user.id,
    });
    res.status(201).json({ id: created.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// List shops
router.get("/", async (req, res) => {
  try {
    const snap = await getDocs(col.barberShop);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Open/close shop (barber)
router.post("/:shopId/open", auth("barber"), async (req, res) => {
  try {
    const ref = doc(col.barberShop, req.params.shopId);
    await updateDoc(ref, { isOpen: true });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:shopId/close", auth("barber"), async (req, res) => {
  try {
    const ref = doc(col.barberShop, req.params.shopId);
    await updateDoc(ref, { isOpen: false });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
