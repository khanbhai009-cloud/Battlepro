import { getAdminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { WalletClient } from "./WalletClient";

async function getWalletData(uid: string) {
  try {
    const db = getAdminDb();
    const doc = await db.collection("users").doc(uid).get();
    if (!doc.exists) return null;
    return doc.data();
  } catch {
    return null;
  }
}

export default async function WalletPage() {
  const cookieStore = await cookies();
  const uid = cookieStore.get("session")?.value;
  if (!uid) redirect("/login");

  const user = await getWalletData(uid);

  const winning = user?.wallets?.winning ?? 0;
  const deposit = user?.wallets?.deposit ?? 0;
  const bonus = user?.wallets?.bonus ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-foreground">My Wallet</h1>
        <p className="text-muted text-sm font-medium">Manage your funds and review past transactions.</p>
      </div>
      <WalletClient userId={uid} winning={winning} deposit={deposit} bonus={bonus} />
    </div>
  );
}
