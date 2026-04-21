"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminDb } from "@/lib/firebase-admin";

export async function createStaffSession(email: string, name: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    cookieStore.set("staff_session", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    cookieStore.set("staff_name", name, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Session creation failed";
    return { success: false, error: message };
  }
}

export async function verifyStaffCredentials(email: string, password: string): Promise<{ success: boolean; name?: string; error?: string }> {
  try {
    const db = getAdminDb();
    const snap = await db.collection("staff_users").where("email", "==", email).where("password", "==", password).limit(1).get();
    if (snap.empty) return { success: false, error: "Invalid credentials" };
    const data = snap.docs[0].data();
    return { success: true, name: data.name ?? "Staff" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Verification failed";
    return { success: false, error: message };
  }
}

export async function destroyStaffSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("staff_session");
  cookieStore.delete("staff_name");
  redirect("/staff/login");
}
