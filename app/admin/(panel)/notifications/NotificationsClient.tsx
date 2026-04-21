"use client";
import { useState } from "react";
import { sendNotification } from "@/actions/admin";
import { Button } from "@/components/ui/Button";
import { Loader2, Bell } from "lucide-react";

export function NotificationsClient() {
  const [form, setForm] = useState({ title: "", body: "", targetUserId: "", redeemCode: "", target: "all" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSend = async () => {
    if (!form.title || !form.body) { setMsg({ type: "error", text: "Title and message are required!" }); return; }
    if (form.target === "specific" && !form.targetUserId) { setMsg({ type: "error", text: "Enter User UID or Email!" }); return; }
    setLoading(true);
    const res = await sendNotification({
      title: form.title,
      body: form.body,
      targetUserId: form.target === "specific" ? form.targetUserId : undefined,
      redeemCode: form.redeemCode,
    });
    setLoading(false);
    if (res.success) {
      setMsg({ type: "success", text: `Notification sent to ${form.target === "all" ? "all users" : "user"}!` });
      setForm({ title: "", body: "", targetUserId: "", redeemCode: "", target: "all" });
    } else {
      setMsg({ type: "error", text: (res as any).error ?? "Failed to send" });
    }
    setTimeout(() => setMsg(null), 5000);
  };

  return (
    <div className="bg-white border border-border rounded-xl p-5 space-y-4">
      {msg && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${msg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
          {msg.text}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Send To</label>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setForm({ ...form, target: "all" })} className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${form.target === "all" ? "bg-primary text-white border-primary" : "bg-white border-border text-muted"}`}>
            All Users
          </button>
          <button onClick={() => setForm({ ...form, target: "specific" })} className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${form.target === "specific" ? "bg-primary text-white border-primary" : "bg-white border-border text-muted"}`}>
            Specific User
          </button>
        </div>
      </div>

      {form.target === "specific" && (
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted">User UID or Email</label>
          <input className="auth-input" placeholder="Enter UID or email@..." value={form.targetUserId} onChange={(e) => setForm({ ...form, targetUserId: e.target.value })} />
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Notification Title *</label>
        <input className="auth-input" placeholder="e.g. Big Tournament Alert! 🏆" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Message *</label>
        <textarea className="auth-input min-h-[100px] resize-y" placeholder="Your notification message..." value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Attach Redeem Code (Optional)</label>
        <input className="auth-input" placeholder="e.g. FREE50" value={form.redeemCode} onChange={(e) => setForm({ ...form, redeemCode: e.target.value })} />
      </div>

      <Button className="w-full" onClick={handleSend} disabled={loading}>
        {loading ? <Loader2 size={15} className="animate-spin" /> : <><Bell size={15} /> Send Notification</>}
      </Button>
    </div>
  );
}
