import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
};

function isPlaceholder(value = "") {
  const normalized = String(value).trim().toLowerCase();
  return (
    !normalized ||
    normalized.includes("your_") ||
    normalized.includes("replace_") ||
    normalized.includes("example")
  );
}

const hasFirebaseConfig =
  !isPlaceholder(firebaseConfig.apiKey) &&
  !isPlaceholder(firebaseConfig.authDomain) &&
  !isPlaceholder(firebaseConfig.projectId) &&
  !isPlaceholder(firebaseConfig.appId);

let app = null;
if (hasFirebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
  } catch {
    app = null;
  }
}

export const auth = app ? getAuth(app) : null;
export const googleProvider = app ? new GoogleAuthProvider() : null;
export const firebaseConfigured = hasFirebaseConfig;
