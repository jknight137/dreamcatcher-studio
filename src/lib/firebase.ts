import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, FirebaseFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Check if all required environment variables are present
const hasFirebaseConfig =
  !!firebaseConfig.apiKey &&
  !!firebaseConfig.authDomain &&
  !!firebaseConfig.projectId &&
  !!firebaseConfig.storageBucket &&
  !!firebaseConfig.messagingSenderId &&
  !!firebaseConfig.appId &&
  !!firebaseConfig.measurementId;

// Initialize Firebase
let firebaseApp = null;
let analytics = null;
let auth: Auth = null;
let db: FirebaseFirestore = null;

try {
  if (hasFirebaseConfig) {
    firebaseApp = initializeApp(firebaseConfig);
    analytics = getAnalytics(firebaseApp);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
  } else {
    const errorMessage = "Firebase configuration is incomplete. Check your environment variables.";
    console.error(errorMessage);
    // Removed throwing an error, which was crashing the app.
    // Instead, the app will now run, but Firebase features will be unavailable.
  }
} catch (e) {
  console.error("Error initializing Firebase:", e);
}

export { firebaseApp, analytics, auth, db };
