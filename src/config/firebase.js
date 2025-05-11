// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";

// import { getAuth } from "firebase/auth"; //for Auh by Aniruddah
// import { getDatabase } from "firebase/database"; //for database by Aniruddah



// const firebaseConfig = {
//   apiKey: "AIzaSyDO487WJ7K3drZhvULWtt6Q8buAIPXhbPw",
//   authDomain: "ai-assisted-study-companion.firebaseapp.com",
//   projectId: "ai-assisted-study-companion",
//   databaseURL:"https://ai-assisted-study-companion-default-rtdb.firebaseio.com",
//   storageBucket: "ai-assisted-study-companion.firebasestorage.app",
//   messagingSenderId: "460164372498",
//   appId: "1:460164372498:web:61acebcfb76ef4e086a0cb",
//   measurementId: "G-EZSY57CGTP"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// export const auth = getAuth(app);
// export const database = getDatabase(app); //for databse by Aniruddah






import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage"; // Import storage


//your firebase config
// Import the functions you need from the SDKs you need

const firebaseConfig = {
  apiKey: "Your openai api key",
  // Replace with your actual API key
  authDomain: "",
  projectId: "",
  databaseURL:"Your database url",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app); // Initialize storage

export { auth, database, storage }; // Export storage

// This file should contain your Firebase config
// Let me see this file to confirm it's the same project
