import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase with auto-provisioned configuration
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
