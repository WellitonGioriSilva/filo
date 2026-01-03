const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAveBs8YgiHUxzi5Q9yBgf3DnBxNF_tHxs",
  authDomain: "filo-queue.firebaseapp.com",
  projectId: "filo-queue",
  storageBucket: "filo-queue.firebasestorage.app",
  messagingSenderId: "42410592894",
  appId: "1:42410592894:web:0199919f6b02089075662f",
  measurementId: "G-EXFGT5T4R1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection references
const col = {
  barberShop: collection(db, 'barberShop'),
  user: collection(db, 'user'),
  position: collection(db, 'position'),
};

module.exports = { db, col, doc };
