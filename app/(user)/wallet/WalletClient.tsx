"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Plus, ArrowRight, Gift, Loader2 } from "lucide-react";
import { requestWithdrawal } from "@/actions/wallet-server";
import { createOrder, verifyPayment } from "@/actions/wallet";
import { applyRedeemCode } from "@/actions/redeem";

declare global {
  interface Window { Razorpay: any; }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) { resolve(true); return; }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type Tab = "deposit" | "withdraw" | "redeem";

interface Props {
  userId: string;
  winning: number;
  deposit: number;
  bonus: number;
}

export function WalletClient({ userId, winning, deposit, bonus }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("deposit");
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [redeemCode, setRedeemCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showMsg = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 5000);
  };

  const handleDeposit = async () => {
    const amt = Number(amount);
    if (!amt || amt < 10) { showMsg("error", "Minimum deposit is 🪙10"); return; }
    setLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { showMsg("error", "Payment gateway failed to load."); return; }

      const orderRes = await createOrder(amt, userId);
      if (!orderRes.success || !orderRes.order) { showMsg("error", "Could not create order."); return; }

      const options = {
        key: orderRes.keyId,
        amount: (orderRes.order as any).amount,
        currency: "INR",
        name: "BattleZone Pro",
        description: "Wallet Deposit",
        order_id: (orderRes.order as any).id,
        handler: async (response: any) => {
          setLoading(true);
          const verifyRes = await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            userId,
            amt
          );
          if (verifyRes.success) {
            showMsg("success", `🪙${amt} added to your deposit wallet!`);
            setAmount("");
            window.location.reload();
          } else {
            showMsg("error", "Payment verification failed. Contact support.");
          }
          setLoading(false);
        },
        modal: { ondismiss: () => setLoading(false) },
        theme: { color: "#111111" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      showMsg("error", "Payment failed. Please try again.");
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amt = Number(amount);
    if (!amt || amt < 100) { showMsg("error", "Minimum withdrawal is 🪙100"); return; }
    if (!upiId.trim()) { showMsg("error", "Please enter your UPI ID"); return; }
    setLoading(true);
    try {
      const result = await requestWithdrawal(userId, amt);
      if (result.success) {
        showMsg("success", "Withdrawal requested! Admin has been notified. Processing within 24h.");
        setAmount(""); setUpiId("");
      } else {
        showMsg("error", result.error || "Withdraw failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!redeemCode.trim()) { showMsg("error", "Please enter a redeem code"); return; }
    setLoading(true);
    try {
      const result = await applyRedeemCode(userId, redeemCode.trim().toUpperCase());
      if (result.success) {
        showMsg("success", `Code applied! 🪙${result.amount} bonus added to your wallet.`);
        setRedeemCode("");
        setTimeout(() => window.location.reload(), 2000);
      } else {
        showMsg("error", result.error || "Invalid code.");
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "deposit", label: "Add Funds" },
    { key: "withdraw", label: "Withdraw" },
    { key: "redeem", label: "Redeem Code" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card-base border-primary/20">
          <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Winning Balance</div>
          <div className="text-xl sm:text-2xl font-bold text-primary">{formatCurrency(winning)}</div>
          <p className="text-xs text-muted mt-1.5 font-medium">Available to withdraw</p>
        </div>
        <div className="card-base">
          <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Deposit Balance</div>
          <div className="text-xl sm:text-2xl font-bold text-foreground">{formatCurrency(deposit)}</div>
          <p className="text-xs text-muted mt-1.5 font-medium">Usable for match entry</p>
        </div>
        <div className="card-base">
          <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1.5">Bonus Balance</div>
          <div className="text-xl sm:text-2xl font-bold text-amber-500">{formatCurrency(bonus)}</div>
          <p className="text-xs text-muted mt-1.5 font-medium">Max 40% usable per match</p>
        </div>
      </div>

      <div className="card-base p-0 overflow-hidden">
        <div className="flex border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`flex-1 py-3.5 text-sm font-bold transition-all ${activeTab === t.key ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted hover:bg-gray-50"}`}
              onClick={() => { setActiveTab(t.key); setMsg(null); setAmount(""); }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-7 max-w-md mx-auto w-full">
          {msg && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${msg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
              {msg.text}
            </div>
          )}

          {activeTab === "deposit" && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-0.5">Amount (🪙)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted text-sm">🪙</span>
                  <input type="number" className="auth-input pl-8 text-lg font-bold" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[50, 100, 200, 500].map((amt) => (
                  <button key={amt} onClick={() => setAmount(amt.toString())} className="py-2 rounded-lg border border-border text-xs font-bold text-muted hover:border-primary hover:text-primary transition-colors">
                    +🪙{amt}
                  </button>
                ))}
              </div>
              <Button className="w-full py-3 text-sm" onClick={handleDeposit} disabled={loading}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : <><Plus size={16} />Proceed to Pay</>}
              </Button>
            </div>
          )}

          {activeTab === "withdraw" && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-0.5">Amount (🪙)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted text-sm">🪙</span>
                  <input type="number" className="auth-input pl-8 text-lg font-bold" placeholder="Min 🪙100" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-0.5">UPI ID / Bank Details</label>
                <input type="text" className="auth-input" placeholder="e.g. 9876543210@ybl" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
              </div>
              <Button className="w-full py-3 text-sm bg-black hover:bg-black/80 text-white" onClick={handleWithdraw} disabled={loading}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : <><ArrowRight size={16} />Request Withdrawal</>}
              </Button>
              <p className="text-[10px] text-center text-muted font-bold uppercase tracking-wider">Only Winning Balance is withdrawable. Processing within 24h.</p>
            </div>
          )}

          {activeTab === "redeem" && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-0.5">Redeem Code</label>
                <input
                  type="text"
                  className="auth-input uppercase tracking-widest font-bold text-center text-lg"
                  placeholder="ENTER CODE"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                />
              </div>
              <Button className="w-full py-3 text-sm" onClick={handleRedeem} disabled={loading}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : <><Gift size={16} />Apply Code</>}
              </Button>
              <p className="text-[10px] text-center text-muted font-bold uppercase tracking-wider">Redeem codes add bonus balance to your wallet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
