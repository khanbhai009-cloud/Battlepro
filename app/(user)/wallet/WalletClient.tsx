"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Plus, ArrowRight, Gift, Loader2 } from "lucide-react";
import { requestWithdrawal } from "@/actions/wallet-server";
import { createOrder } from "@/actions/wallet"; // verifyPayment ab redirect page sambhalega
import { applyRedeemCode } from "@/actions/redeem";
import { Browser } from "@capacitor/browser"; // Native Browser Plugin

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
      // 1. Backend se Order ID create karo
      const orderRes = await createOrder(amt, userId);
      
      if (!orderRes.success || !orderRes.order) { 
        showMsg("error", "Could not create order."); 
        setLoading(false);
        return; 
      }

      // 2. APK ke WebView ke bajaye External Browser mein payment kholo
      const checkoutUrl = `https://battlepro.vercel.app/payment/checkout?orderId=${orderRes.order.id}&amount=${amt}&userId=${userId}`;
      
      // Fallback mechanism
      try {
        await Browser.open({ url: checkoutUrl });
      } catch (pluginError) {
        window.open(checkoutUrl, '_system');
      }

      // Browser open hone ke baad spinner band kar do
      setLoading(false);
      showMsg("success", "Opening secure payment window...");

    } catch (error) {
      console.error("Payment Error:", error);
      showMsg("error", "Failed to initiate payment.");
      setLoading(false);
    }
  };

  // ... (handleWithdraw aur handleRedeem same rahenge, wo server actions hain)
  const handleWithdraw = async () => {
    const amt = Number(amount);
    if (!amt || amt < 100) { showMsg("error", "Minimum withdrawal is 🪙100"); return; }
    if (!upiId.trim()) { showMsg("error", "Please enter your UPI ID"); return; }
    setLoading(true);
    try {
      const result = await requestWithdrawal(userId, amt);
      if (result.success) {
        showMsg("success", "Withdrawal requested! Processing within 24h.");
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
        showMsg("success", `Code applied! 🪙${result.amount} bonus added.`);
        setRedeemCode("");
        setTimeout(() => window.location.reload(), 2000);
      } else {
        showMsg("error", result.error || "Invalid code.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Tabs UI configuration
  const tabs: { key: Tab; label: string }[] = [
    { key: "deposit", label: "Add Funds" },
    { key: "withdraw", label: "Withdraw" },
    { key: "redeem", label: "Redeem Code" },
  ];

  return (
    <div className="space-y-6">
      {/* Balance Cards (Same as your original UI) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card-base border-primary/20">
          <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Winning Balance</div>
          <div className="text-xl sm:text-2xl font-bold text-primary">{formatCurrency(winning)}</div>
        </div>
        <div className="card-base">
          <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Deposit Balance</div>
          <div className="text-xl sm:text-2xl font-bold text-foreground">{formatCurrency(deposit)}</div>
        </div>
        <div className="card-base">
          <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1.5">Bonus Balance</div>
          <div className="text-xl sm:text-2xl font-bold text-amber-500">{formatCurrency(bonus)}</div>
        </div>
      </div>

      <div className="card-base p-0 overflow-hidden">
        {/* Tab Switcher */}
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
                  <input type="number" className="auth-input px-4 text-lg font-bold" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
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

          {/* Withdraw and Redeem views remain the same UI as you provided */}
          {activeTab === "withdraw" && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-0.5">Amount (🪙)</label>
                <input type="number" className="auth-input" placeholder="Min 🪙100" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-0.5">UPI ID</label>
                <input type="text" className="auth-input" placeholder="e.g. 9876543210@ybl" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
              </div>
              <Button className="w-full py-3 text-sm bg-black text-white" onClick={handleWithdraw} disabled={loading}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : <><ArrowRight size={16} />Request Withdrawal</>}
              </Button>
            </div>
          )}

          {activeTab === "redeem" && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-0.5">Redeem Code</label>
                <input type="text" className="auth-input uppercase text-center" placeholder="ENTER CODE" value={redeemCode} onChange={(e) => setRedeemCode(e.target.value.toUpperCase())} />
              </div>
              <Button className="w-full py-3 text-sm" onClick={handleRedeem} disabled={loading}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : <><Gift size={16} />Apply Code</>}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
