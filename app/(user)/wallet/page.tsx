"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Plus, ArrowRight } from "lucide-react";
import { requestWithdrawal } from "@/actions/wallet-server";

const TEMP_USER_ID = "user123";

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");

  const handleDeposit = async () => {
    alert(`Initiating ₹${amount} Razorpay deposit for ${TEMP_USER_ID}`);
  };

  const handleWithdraw = async () => {
    if (!amount) return;
    try {
      const result = await requestWithdrawal(TEMP_USER_ID, Number(amount));
      if (result.success) {
        alert("Withdrawal requested! Admin has been notified.");
        setAmount("");
      }
    } catch {
      alert("Withdraw failed.");
    }
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-foreground">
          My Wallet
        </h1>
        <p className="text-muted text-sm font-medium">
          Manage your funds and review past transactions.
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card-base border-primary/20">
          <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">
            Winning Balance
          </div>
          <div className="text-xl sm:text-2xl font-bold text-primary">
            {formatCurrency(450.00)}
          </div>
          <p className="text-xs text-muted mt-1.5 font-medium">Available to withdraw</p>
        </div>

        <div className="card-base">
          <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">
            Deposit Balance
          </div>
          <div className="text-xl sm:text-2xl font-bold text-foreground">
            {formatCurrency(750.50)}
          </div>
          <p className="text-xs text-muted mt-1.5 font-medium">Usable for match entry</p>
        </div>

        <div className="card-base">
          <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1.5">
            Bonus Balance
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-500">
            {formatCurrency(40.00)}
          </div>
          <p className="text-xs text-muted mt-1.5 font-medium">Max 40% usable per match</p>
        </div>
      </div>

      {/* Action Area */}
      <div className="card-base p-0 overflow-hidden">
        <div className="flex border-b border-border">
          <button
            className={`flex-1 py-3.5 text-sm font-bold transition-all ${activeTab === "deposit" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted hover:bg-gray-50"}`}
            onClick={() => setActiveTab("deposit")}
          >
            Add Funds
          </button>
          <button
            className={`flex-1 py-3.5 text-sm font-bold transition-all ${activeTab === "withdraw" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted hover:bg-gray-50"}`}
            onClick={() => setActiveTab("withdraw")}
          >
            Withdraw
          </button>
        </div>

        <div className="p-5 sm:p-7 max-w-md mx-auto w-full">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-0.5">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted text-sm">₹</span>
                <input
                  type="number"
                  className="auth-input pl-8 text-lg font-bold"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            {activeTab === "deposit" ? (
              <div>
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {[50, 100, 200, 500].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt.toString())}
                      className="py-2 rounded-lg border border-border text-xs font-bold text-muted hover:border-primary hover:text-primary transition-colors"
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
                <Button className="w-full py-3 text-sm" onClick={handleDeposit}>
                  <Plus size={16} />
                  Proceed to Pay
                </Button>
              </div>
            ) : (
              <div>
                <div className="space-y-1.5 mb-5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-0.5">
                    UPI ID or Bank Details
                  </label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="e.g. 9876543210@ybl"
                  />
                </div>
                <Button
                  className="w-full py-3 text-sm bg-black hover:bg-black/80 text-white"
                  onClick={handleWithdraw}
                >
                  Request Withdrawal
                  <ArrowRight size={16} />
                </Button>
                <p className="text-[10px] text-center text-muted font-bold mt-3 uppercase tracking-wider">
                  Processing within 24h. Admin will be notified.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
