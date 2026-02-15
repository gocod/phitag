import { db } from "./firebaseAdmin"; // Import the ADMIN db, not the client one

export async function getUserPlan(email: string) {
  try {
    // Note: Admin SDK syntax is different: .collection().doc().get()
    const userDoc = await db.collection("users").doc(email).get();
    
    if (userDoc.exists) {
      return userDoc.data()?.plan || "Free Trial";
    }
    return "New User";
  } catch (e) {
    console.error("Error fetching plan from Firebase Admin:", e);
    return "Error fetching plan";
  }
}