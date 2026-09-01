import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvzgiahcSfZxYvuv1Huyik-feQaaWSYXw",
  authDomain: "finance-gogo-f360b.firebaseapp.com",
  projectId: "finance-gogo-f360b",
  storageBucket: "finance-gogo-f360b.firebasestorage.app",
  messagingSenderId: "107919362591",
  appId: "1:107919362591:web:a6b10c6d2e7ab3f000e32a",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
