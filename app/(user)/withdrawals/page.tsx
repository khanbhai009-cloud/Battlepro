import { getAdminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import WithdrawalsClient from "./WithdrawalsClient";

export const revalidate = 0;

async function getData(uid: string) {
  try {
    const db = getAdminDb();
    const [userDoc, snap] = await Promise.all([
      db.collection("users").doc(uid).get(),
      db
        .collection("withdrawals")
        .where("userId", "==", uid)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get(),
    ]);

    const user = userDoc.exists ? JSON.parse(JSON.stringify(userDoc.data())) : null;
    const withdrawals = JSON.parse(
      JSON.stringify(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    ) as any[];

    return { user, withdrawals };
  } catch {
    return { user: null, withdrawals: [] };
  }
}

export default async function WithdrawalsPage() {
  const cookieStore = await cookies();
  const uid = cookieStore.get("session")?.value;
  if (!uid) redirect("/login");

  const { user, withdrawals } = await getData(uid);

  return (
    <WithdrawalsClient userId={uid} initialUser={user} initialWithdrawals={withdrawals} />
  );
}
