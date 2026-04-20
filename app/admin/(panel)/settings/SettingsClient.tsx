"use client";

import { useState } from "react";
import { generateRedeemCode, deactivateRedeemCode } from "@/actions/redeem";
import { Button } from "@/components/ui/Button";
import { Plus, Loader2, Gift, XCircle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RedeemCode {
  id: string;
  amount: number;
  maxUses: number;
  usedBy?: string[];
  active: boolean;
  type: string;
}

export function SettingsClient({ codes }: { codes: RedeemCode[] }) {
  const [form, setForm] = useState({ code: "", amount: "", maxUses: "1" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [localCodes, setLocalCodes] = useState(codes);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!form.amount) { setMsg({ type: "error", text: "Enter an amount." }); return; }
    setLoading(true);
    try {
      const result = await generateRedeemCode(
        Number(form.amount),
        Number(form.maxUses),
        form.code || undefined
      );
      if (result.success) {
        setMsg({ type: "success", text: `Code generated: ${result.code}` });
        setForm({ code: "", amount: "", maxUses: "1" });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMsg({ type: "error", text: result.error || "Failed to generate." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (code: string) => {
    setDeactivatingId(code);
    await deactivateRedeemCode(code);
    setLocalCodes((prev) => prev.map((c) => c.id === code ? { ...c, active: false } : c));
    setDeactivatingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Gift size={18} className="text-primary" />
          <h2 className="font-bold">Generate Redeem Code</h2>
        </div>

        {msg && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium ${msg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
            {msg.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Custom Code (optional)</label>
            <input type="text" className="auth-input uppercase" placeholder="e.g. WELCOME50" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Bonus Amount (₹) *</label>
            <input type="number" className="auth-input" placeholder="e.g. 50" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Max Uses</label>
            <input type="number" className="auth-input" placeholder="1" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="text-sm">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={15} />Generate Code</>}
        </Button>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold">All Redeem Codes ({localCodes.length})</h2>
        </div>
        {localCodes.length === 0 ? (
          <div className="p-8 text-center text-muted text-sm font-medium">No codes generated yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {localCodes.map((code) => (
              <div key={code.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {code.active
                    ? <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                    : <XCircle size={16} className="text-gray-300 shrink-0" />}
                  <div>
                    <div className="font-black tracking-widest text-sm font-mono">{code.id}</div>
                    <div className="text-xs text-muted font-medium">
                      {formatCurrency(code.amount)} bonus · {code.usedBy?.length ?? 0}/{code.maxUses} used · {code.type}
                    </div>
                  </div>
                </div>
                {code.active && (
                  <button
                    onClick={() => handleDeactivate(code.id)}
                    disabled={deactivatingId === code.id}
                    className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                  >
                    {deactivatingId === code.id ? <Loader2 size={12} className="animate-spin" /> : "Deactivate"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
