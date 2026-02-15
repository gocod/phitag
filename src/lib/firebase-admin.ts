import { db } from "@/lib/firebase"; // Your firebase config
import { doc, getDoc } from "firebase/firestore";

export async function getUserPlan(email: string) {
  try {
    const userDoc = await getDoc(doc(db, "users", email));
    if (userDoc.exists()) {
      return userDoc.data().plan || "Free Trial";
    }
    return "New User";
  } catch (e) {
    return "Error fetching plan";
  }
}