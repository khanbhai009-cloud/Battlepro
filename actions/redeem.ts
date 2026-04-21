"use server";

import { getAdminDb, admin } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function applyRedeemCode(userId: string, code: string) {
  try {
    const db = getAdminDb();
    const codeRef = db.collection("redeemCodes").doc(code);

    const result = await db.runTransaction(async (t) => {
      const codeDoc = await t.get(codeRef);
      if (!codeDoc.exists) throw new Error("Invalid code. Please check and try again.");

      const codeData = codeDoc.data()!;
      if (!codeData.active) throw new Error("This code has already been used or expired.");

      const usedBy: string[] = codeData.usedBy ?? [];
      if (usedBy.includes(userId)) throw new Error("You have already used this code.");

      const isOneTime = codeData.type === "one_time";
      const maxUses = codeData.maxUses ?? 1;
      if (isOneTime || usedBy.length >= maxUses) {
        throw new Error("This code has reached its usage limit.");
      }

      const amount = codeData.amount ?? 0;
      const userRef = db.collection("users").doc(userId);
      const userDoc = await t.get(userRef);
      if (!userDoc.exists) throw new Error("User not found");

      const currentBonus = userDoc.data()?.wallets?.bonus ?? 0;
      t.update(userRef, { "wallets.bonus": currentBonus + amount });

      t.update(codeRef, {
        usedBy: admin.firestore.FieldValue.arrayUnion(userId),
        ...(isOneTime || usedBy.length + 1 >= maxUses ? { active: false } : {}),
      });

      const txnRef = db.collection("transactions").doc();
      t.set(txnRef, {
        userId,
        type: "Redeem",
        desc: `Redeem Code: ${code}`,
        amount,
        status: "Success",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { amount };
    });

    // Wallet balance changed — purge all panels
    revalidateAll();
    return { success: true, amount: result.amount };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function generateRedeemCode(amount: number, maxUses: number, code?: string) {
  try {
    const db = getAdminDb();
    const generatedCode = code || Math.random().toString(36).substring(2, 10).toUpperCase();
    const codeRef = db.collection("redeemCodes").doc(generatedCode);

    const existing = await codeRef.get();
    if (existing.exists) throw new Error("Code already exists. Try a different code.");

    await codeRef.set({
      amount,
      maxUses,
      usedBy: [],
      active: true,
      type: maxUses === 1 ? "one_time" : "multi_use",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, code: generatedCode };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getRedeemCodes() {
  try {
    const db = getAdminDb();
    const snap = await db.collection("redeemCodes").orderBy("createdAt", "desc").limit(50).get();
    return JSON.parse(JSON.stringify(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
  } catch {
    return [];
  }
}

export async function deactivateRedeemCode(code: string) {
  try {
    const db = getAdminDb();
    await db.collection("redeemCodes").doc(code).update({ active: false });
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
