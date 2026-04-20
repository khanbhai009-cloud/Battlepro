"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { createOrder, verifyPayment } from "@/actions/wallet";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function HomeWalletCard({ userId, totalBalance }: { userId: string; totalBalance: number }) {
  const [loading, setLoading] = useState(false);

  const handleTopUp = async () => {
    setLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { alert("Payment gateway failed to load. Please try again."); return; }

      const orderRes = await createOrder(100, userId);
      if (!orderRes.success || !orderRes.order) { alert("Could not create order."); return; }

      const options = {
        key: orderRes.keyId,
        amount: (orderRes.order as any).amount,
        currency: "INR",
        name: "BattleZone Pro",
        description: "Wallet Top Up",
        order_id: (orderRes.order as any).id,
        handler: async (response: any) => {
          const verifyRes = await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            userId,
            100
          );
          if (verifyRes.success) {
            alert("Payment successful! ₹100 added to your wallet.");
            window.location.reload();
          } else {
            alert("Payment verification failed. Contact support.");
          }
        },
        theme: { color: "#111111" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-card w-full lg:w-[300px] shrink-0 shadow-lg">
      <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">
        Account Balance
      </div>
      <div className="text-2xl sm:text-3xl font-bold mb-5 tracking-tight">
        {formatCurrency(totalBalance)}
      </div>
      <Button
        className="w-full bg-white text-black hover:bg-gray-100 text-sm"
        onClick={handleTopUp}
        disabled={loading}
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : "Top Up via Razorpay"}
      </Button>
    </div>
  );
}
