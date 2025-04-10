import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Log environment variables for debugging
console.log("API Key:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log("Auth Domain:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log("Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log("Storage Bucket:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
console.log("Messaging Sender ID:", process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
console.log("App ID:", process.env.NEXT_PUBLIC_FIREBASE_APP_ID);
console.log("Measurement ID:", process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Check if required environment variables are present (measurementId is optional)
const hasFirebaseConfig =
  !!firebaseConfig.apiKey &&
  !!firebaseConfig.authDomain &&
  !!firebaseConfig.projectId &&
  !!firebaseConfig.storageBucket &&
  !!firebaseConfig.messagingSenderId &&
  !!firebaseConfig.appId;

let firebaseApp = null;
let analytics = null;
export let auth: Auth | null = null;
export let db: Firestore | null = null;

if (hasFirebaseConfig) {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    if (firebaseConfig.measurementId) {
      analytics = getAnalytics(firebaseApp); // Only initialize if measurementId exists
    }
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    console.log("Firebase initialized successfully");
  } catch (e) {
    console.error("Error initializing Firebase:", e);
  }
} else {
  console.error("Firebase configuration is incomplete. Check your environment variables.");
}

export { firebaseApp, analytics };