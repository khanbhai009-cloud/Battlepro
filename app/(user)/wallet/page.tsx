"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ArrowUpRight, ArrowDownRight, Clock, Building2, Plus, ArrowRight } from "lucide-react";
import { createOrder, verifyPayment } from "@/actions/wallet";
import { requestWithdrawal } from "@/actions/wallet-server"; // new wrapper to handle push

const TEMP_USER_ID = "user123";

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");

  const handleDeposit = async () => {
    // Razorpay Integration is mocked here due to limited client env bounds
    alert(`Initiating ₹${amount} Razorpay deposit for ${TEMP_USER_ID}`);
  };

  const handleWithdraw = async () => {
    if (!amount) return;
    try {
      // Trigger 1 (Withdrawal): Send Push Notification to Super Admin via Server Actions
      const result = await requestWithdrawal(TEMP_USER_ID, Number(amount));
      if (result.success) {
        alert("Withdrawal requested successfully! Admin has been notified.");
        setAmount("");
      }
    } catch (e) {
      alert("Withdraw failed.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Wallet</h1>
        <p className="text-muted text-sm font-medium">Manage your funds and review past transactions.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-base bg-white border-primary/20 shadow-sm relative overflow-hidden group">
          <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Winning Balance</div>
          <div className="text-2xl font-bold text-primary">{formatCurrency(450.00)}</div>
          <p className="text-xs text-muted-foreground mt-2 font-medium">Available to withdraw</p>
        </div>

        <div className="card-base bg-white shadow-sm relative overflow-hidden group">
          <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Deposit Balance</div>
          <div className="text-2xl font-bold text-foreground">{formatCurrency(750.50)}</div>
          <p className="text-xs text-muted-foreground mt-2 font-medium">Usable for match entry</p>
        </div>

        <div className="card-base bg-white shadow-sm relative overflow-hidden group">
          <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1.5">Bonus Balance</div>
          <div className="text-2xl font-bold text-amber-500">{formatCurrency(40.00)}</div>
          <p className="text-xs text-muted-foreground mt-2 font-medium">Max 40% usable per match</p>
        </div>
      </div>

      {/* Action Area */}
      <div className="card-base p-0 overflow-hidden shadow-sm">
        <div className="flex border-b border-border">
          <button 
            className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === 'deposit' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted hover:bg-gray-50'}`}
            onClick={() => setActiveTab('deposit')}
          >
            Add Funds
          </button>
          <button 
            className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === 'withdraw' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted hover:bg-gray-50'}`}
            onClick={() => setActiveTab('withdraw')}
          >
            Withdraw
          </button>
        </div>

        <div className="p-6 md:p-8 max-w-lg mx-auto">
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted">₹</span>
                <input 
                  type="number" 
                  className="auth-input pl-8 text-xl font-bold" 
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            {activeTab === 'deposit' ? (
              <div className="pt-2">
                <div className="flex gap-2 mb-6">
                  {[50, 100, 200, 500].map((amt) => (
                    <button 
                      key={amt}
                      onClick={() => setAmount(amt.toString())}
                      className="flex-1 py-2 rounded-lg border border-border text-xs w-full font-bold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
                <Button className="w-full py-6 text-base shadow-lg" onClick={handleDeposit}>
                  <Plus size={18} />
                  Proceed to Pay
                </Button>
              </div>
            ) : (
              <div className="pt-2">
                <div className="space-y-1.5 mb-6">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">UPI ID or Bank Details</label>
                  <input type="text" className="auth-input" placeholder="e.g. 9876543210@ybl" />
                </div>
                <Button className="w-full py-6 text-base bg-black hover:bg-black/80 text-white shadow-lg" onClick={handleWithdraw}>
                  Request Withdrawal
                  <ArrowRight size={18} className="text-white" />
                </Button>
                <p className="text-[10px] text-center text-muted font-bold mt-4 uppercase tracking-wider">
                  Withdrawal triggers admin notification. Processing within 24h.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
{/* Transaction history omitted to save space for now */}
    </div>
  );
}
