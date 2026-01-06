const admin = require('firebase-admin');

let credentials = null;
if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
  try {
    credentials = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
  } catch (e) {
    console.error('Invalid FIREBASE_ADMIN_CREDENTIALS JSON');
    throw e;
  }
}

if (!admin.apps.length) {
  if (credentials) {
    admin.initializeApp({ credential: admin.credential.cert(credentials) });
  } else {
    admin.initializeApp(); // Application Default Credentials
  }
}

module.exports = admin;
