import { getAuth } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { getFirestore, doc, getDoc } from "firebase/firestore";
// import { auth } from "@/firebase/firebase";

// Type for user data structure (you can adjust as needed)
interface User {
  uid: string;
  email: string;
  imageUrl: string;
  role: string;
  signInMethod: string;
}

// Function to get the current user's details from Firebase Authentication, Firestore, and Realtime Database
export const getCurrentUserDetails = async (): Promise<User | null> => {
  const auth = getAuth();
  const db = getDatabase();
  const firestore = getFirestore();
  
  const user = auth.currentUser;
  
  if (!user) {
    return null; // If no user is signed in, return null
  }

  try {
    // Get data from Firestore
    const userDocRef = doc(firestore, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error("User data not found in Firestore");
    }

    const userData = userDoc.data();

    // Get additional data from Realtime Database
    const userRef = ref(db, `users/${user.uid}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      throw new Error("User data not found in Realtime Database");
    }

    const realtimeData = userSnapshot.val();

    // Combine data from Firestore and Realtime Database
    const currentUserDetails: User = {
      uid: user.uid,
      email: user.email || "",
      imageUrl: user.photoURL || "",
      role: userData.role || realtimeData.role || "user", // Default to 'user' if role is not found
      signInMethod: realtimeData.signInMethod || "unknown", // Default method if not found
    };

    return currentUserDetails;
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null; // If any error occurs, return null
  }
};
