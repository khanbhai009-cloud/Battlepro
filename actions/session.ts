"use server";

import { cookies } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Verifies a Firebase ID token, reads the user's role from Firestore,
 * then sets HTTP-only session + role cookies so proxy.ts can protect routes.
 */
export async function createSession(idToken: string): Promise<{ success: boolean; role?: string; error?: string }> {
  try {
    const auth = getAdminAuth();
    const db = getAdminDb();

    // 1. Verify the Firebase ID token server-side
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = (decoded.email ?? "").toLowerCase();

    // 2. Fetch role from Firestore (default to "user" if doc doesn't exist yet)
    const userDoc = await db.collection("users").doc(uid).get();
    let role: string = userDoc.exists ? (userDoc.data()?.role ?? "user") : "user";

    // 2b. Fall back to the staff_users collection (admin-managed) when the
    // users/{uid} doc doesn't carry an elevated role. This lets staff entries
    // created by the admin panel resolve to "admin" / "staff" at login time.
    if (role === "user" && email) {
      const staffSnap = await db
        .collection("staff_users")
        .where("email", "==", email)
        .limit(1)
        .get();
      if (!staffSnap.empty) {
        const staffRole = staffSnap.docs[0].data()?.role;
        if (staffRole === "admin" || staffRole === "staff") {
          role = staffRole;
        }
      }
    }

    // 3. Set secure HTTP-only cookies
    const cookieStore = await cookies();

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: SESSION_MAX_AGE,
      path: "/",
    };

    cookieStore.set("session", uid, cookieOptions);
    cookieStore.set("role", role, cookieOptions);

    return { success: true, role };
  } catch (error: any) {
    console.error("createSession error:", error);
    return { success: false, error: error.message ?? "Session creation failed" };
  }
}

/**
 * Clears session cookies and redirects to /login.
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  cookieStore.delete("role");
  redirect("/login");
}
