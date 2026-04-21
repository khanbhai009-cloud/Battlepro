"use client";
import { useState } from "react";
import { saveAppSchedule } from "@/actions/admin";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";

export function AppScheduleClient({ initialData }: { initialData: any }) {
  const [form, setForm] = useState({
    status: initialData?.status ?? "open",
    message: initialData?.message ?? "",
    start: initialData?.start ?? "",
    end: initialData?.end ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSave = async () => {
    if (form.status === "scheduled" && (!form.start || !form.end)) {
      setMsg("Select start and end times for scheduled mode!");
      return;
    }
    setLoading(true);
    const res = await saveAppSchedule(form);
    setLoading(false);
    setMsg(res.success ? "Saved!" : "Error saving.");
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="bg-white border border-border rounded-xl p-5 space-y-4">
      {msg && <div className={`px-3 py-2 rounded-lg text-sm font-medium ${msg === "Saved!" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{msg}</div>}

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted">App Status</label>
        <select className="auth-input bg-white" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="open">Open (Normal)</option>
          <option value="closed">Closed (Maintenance)</option>
          <option value="scheduled">Scheduled Downtime</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Message to Users</label>
        <textarea className="auth-input min-h-[80px] resize-y" placeholder="e.g. Maintenance in progress. We'll be back soon!" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      </div>

      {form.status === "scheduled" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Start Time</label>
            <input type="time" className="auth-input" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted">End Time</label>
            <input type="time" className="auth-input" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
          </div>
        </div>
      )}

      <Button className="w-full" onClick={handleSave} disabled={loading}>
        {loading ? <Loader2 size={15} className="animate-spin" /> : "Save App Status"}
      </Button>

      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold ${form.status === "open" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
        <div className={`w-2.5 h-2.5 rounded-full ${form.status === "open" ? "bg-green-500" : "bg-red-500"}`} />
        Current Status: {form.status.toUpperCase()}
      </div>
    </div>
  );
}
