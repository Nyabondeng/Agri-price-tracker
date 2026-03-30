import admin from "firebase-admin";

import { env } from "./env.js";

let firebaseInitialized = false;

export function initFirebaseAdmin() {
  if (firebaseInitialized || !env.firebaseProjectId || !env.firebaseClientEmail || !env.firebasePrivateKey) {
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.firebaseProjectId,
      clientEmail: env.firebaseClientEmail,
      privateKey: env.firebasePrivateKey
    })
  });

  firebaseInitialized = true;
}

export async function verifyFirebaseToken(idToken) {
  initFirebaseAdmin();

  if (!firebaseInitialized) {
    const error = new Error("Firebase admin credentials are not configured");
    error.statusCode = 500;
    throw error;
  }

  return admin.auth().verifyIdToken(idToken);
}
