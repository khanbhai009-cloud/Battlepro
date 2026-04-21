import { getAdminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Crown, Check, Star } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

async function getVipData(uid: string) {
  try {
    const db = getAdminDb();
    const [userDoc, settingsDoc] = await Promise.all([
      db.collection("users").doc(uid).get(),
      db.collection("settings").doc("pricing").get(),
    ]);
    return {
      user: userDoc.exists ? userDoc.data() : null,
      pricing: settingsDoc.exists ? settingsDoc.data() : null,
    };
  } catch {
    return { user: null, pricing: null };
  }
}

const vipPerks = [
  "Access to VIP-only tournaments",
  "Direct chat with support team",
  "Priority withdrawal processing",
  "Exclusive VIP badge on profile",
  "Early access to new features",
  "Higher bonus wallet limits",
];

export default async function VipPage() {
  const cookieStore = await cookies();
  const uid = cookieStore.get("session")?.value;
  if (!uid) redirect("/login");

  const { user, pricing } = await getVipData(uid);
  const isVip = user?.vipExpiry && new Date() < new Date(user.vipExpiry);
  const vipExpiry = user?.vipExpiry ? new Date(user.vipExpiry).toLocaleDateString() : null;

  const plans = [
    { label: "1 Month", days: 30, price: pricing?.vip1Month ?? 99 },
    { label: "3 Months", days: 90, price: pricing?.vip3Month ?? 249, popular: true },
    { label: "6 Months", days: 180, price: pricing?.vip6Month ?? 449 },
  ];

  return (
    <div className="space-y-6 max-w-xl">
      <div className="text-center py-6">
        <Crown size={40} className="mx-auto text-amber-500 mb-3" />
        <h1 className="text-2xl font-bold">VIP Membership</h1>
        <p className="text-muted text-sm mt-2">Unlock exclusive perks and compete at the highest level</p>
      </div>

      {isVip && (
        <div className="card-base bg-gradient-to-r from-amber-500 to-amber-600 border-amber-400 text-white text-center">
          <Crown size={24} className="mx-auto mb-2" />
          <div className="font-bold">You are already a VIP member! 👑</div>
          <div className="text-sm text-amber-100 mt-1">Valid till {vipExpiry}</div>
        </div>
      )}

      <div className="card-base space-y-3">
        <h2 className="font-bold text-sm">VIP Perks</h2>
        {vipPerks.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <Check size={14} className="text-green-500 shrink-0" />
            <span>{p}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="font-bold text-sm">Choose a Plan</h2>
        {plans.map((plan) => (
          <div key={plan.days} className={`card-base relative ${plan.popular ? "border-primary/30 bg-primary/5" : ""}`}>
            {plan.popular && (
              <span className="absolute -top-2.5 right-4 text-[10px] px-2 py-0.5 bg-primary text-white rounded-full font-bold flex items-center gap-1">
                <Star size={8} fill="white" /> Most Popular
              </span>
            )}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{plan.label}</div>
                <div className="text-xs text-muted">{plan.days} days of VIP access</div>
              </div>
              <div className="text-right">
                <div className="font-black text-xl text-foreground">₹{plan.price}</div>
                <Link href={`/wallet?vip=${plan.days}&amount=${plan.price}`} className="text-xs text-primary font-bold hover:underline">Get VIP →</Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted text-center">VIP membership is purchased through in-app deposit. Contact support for queries.</p>
    </div>
  );
}
