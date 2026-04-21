"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { createTournament, updateTournament, deleteTournament } from "@/actions/admin";
import { Plus, Loader2, Trash2, Trophy, Pencil, Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

const statuses = ["Upcoming", "Ongoing", "Results", "Cancelled"];
const types = ["Solo", "Duo", "Squad"];

const emptyForm = {
  name: "", category: "", serial: "", time: "", status: "Upcoming",
  fee: "", pool: "", perKill: "", max: "100", type: "Squad",
  map: "", rules: "", banner: "", roomId: "", roomPass: "",
  publishRoom: false, isVipOnly: false,
};

export function TournamentsClient({ tournaments, categories }: { tournaments: any[]; categories: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const f = (key: string, val: any) => setForm({ ...form, [key]: val });

  const reset = () => { setForm({ ...emptyForm }); setEditId(null); setShowForm(false); };

  const handleEdit = (t: any) => {
    setEditId(t.id);
    setForm({
      name: t.name ?? "", category: t.category ?? t.game ?? "",
      serial: t.serial ?? "", time: t.time ?? "",
      status: t.status ?? "Upcoming", fee: String(t.fee ?? ""),
      pool: String(t.pool ?? t.prize ?? ""), perKill: String(t.perKill ?? ""),
      max: String(t.max ?? 100), type: t.type ?? t.mode ?? "Squad",
      map: t.map ?? "", rules: t.rules ?? t.description ?? "",
      banner: t.banner ?? "", roomId: t.roomId ?? "",
      roomPass: t.roomPass ?? "", publishRoom: t.publishRoom ?? false,
      isVipOnly: t.isVipOnly ?? false,
    });
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleSave = async () => {
    if (!form.name || !form.category) { setMsg({ type: "error", text: "Category and Name are required." }); return; }
    setLoading(true);
    const data = {
      name: form.name, category: form.category, serial: form.serial,
      time: form.time, status: form.status, fee: Number(form.fee),
      pool: Number(form.pool), perKill: Number(form.perKill),
      max: Number(form.max), type: form.type, map: form.map,
      rules: form.rules, banner: form.banner, roomId: form.roomId,
      roomPass: form.roomPass, publishRoom: form.publishRoom,
      isVipOnly: form.isVipOnly, staffEmail: "ADMIN",
    };
    try {
      const res = editId ? await updateTournament(editId, data) : await createTournament(data);
      if (res.success) {
        setMsg({ type: "success", text: editId ? "Match updated!" : "Match created!" });
        reset();
        setTimeout(() => window.location.reload(), 800);
      } else {
        setMsg({ type: "error", text: (res as any).error ?? "Failed" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this match? Fees will be refunded to all joined players.")) return;
    await deleteTournament(id);
    window.location.reload();
  };

  const statusColor: Record<string, string> = {
    Upcoming: "bg-blue-100 text-blue-600",
    Ongoing: "bg-green-100 text-green-700",
    Results: "bg-amber-100 text-amber-700",
    Cancelled: "bg-red-100 text-red-600",
    live: "bg-green-100 text-green-700",
    upcoming: "bg-blue-100 text-blue-600",
    ended: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted">{tournaments.length} matches total</p>
        <Button onClick={() => { reset(); setShowForm(!showForm); }} className="text-sm">
          <Plus size={16} />{showForm && !editId ? "Cancel" : "New Match"}
        </Button>
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${msg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
          {msg.text}
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-bold">{editId ? "Edit Match" : "Create New Match"}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Category *</label>
              <select className="auth-input bg-white" value={form.category} onChange={(e) => f("category", e.target.value)}>
                <option value="">Select Category...</option>
                {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Match Name *</label>
              <input className="auth-input" placeholder="e.g. Pro League S2" value={form.name} onChange={(e) => f("name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Serial (#101)</label>
              <input className="auth-input" placeholder="#101" value={form.serial} onChange={(e) => f("serial", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Date &amp; Time</label>
              <input type="datetime-local" className="auth-input" value={form.time} onChange={(e) => f("time", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Status</label>
              <select className="auth-input bg-white" value={form.status} onChange={(e) => f("status", e.target.value)}>
                {statuses.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Match Type</label>
              <select className="auth-input bg-white" value={form.type} onChange={(e) => f("type", e.target.value)}>
                {types.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Entry Fee (₹)</label>
              <input type="number" className="auth-input" placeholder="50" value={form.fee} onChange={(e) => f("fee", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Prize Pool (₹)</label>
              <input type="number" className="auth-input" placeholder="5000" value={form.pool} onChange={(e) => f("pool", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Per Kill (₹)</label>
              <input type="number" className="auth-input" placeholder="5" value={form.perKill} onChange={(e) => f("perKill", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Max Slots</label>
              <input type="number" className="auth-input" placeholder="100" value={form.max} onChange={(e) => f("max", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Map Name</label>
              <input className="auth-input" placeholder="Bermuda, Kalahari..." value={form.map} onChange={(e) => f("map", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Banner Image URL</label>
              <input className="auth-input" placeholder="https://..." value={form.banner} onChange={(e) => f("banner", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Rules</label>
            <textarea className="auth-input min-h-[80px] resize-y" placeholder="Match rules..." value={form.rules} onChange={(e) => f("rules", e.target.value)} />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-700">
              <Crown size={14} /> VIP Exclusive Match
            </div>
            <div className="flex gap-3">
              <button onClick={() => f("isVipOnly", false)} className={`flex-1 py-2 rounded-lg text-sm font-bold border ${!form.isVipOnly ? "bg-amber-500 text-white border-amber-500" : "bg-white border-amber-200 text-amber-700"}`}>Open to All</button>
              <button onClick={() => f("isVipOnly", true)} className={`flex-1 py-2 rounded-lg text-sm font-bold border ${form.isVipOnly ? "bg-amber-500 text-white border-amber-500" : "bg-white border-amber-200 text-amber-700"}`}>VIP Only</button>
            </div>
          </div>

          <div className="border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-muted">
              <Lock size={14} /> Room Credentials
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="auth-input" placeholder="Room ID" value={form.roomId} onChange={(e) => f("roomId", e.target.value)} />
              <input className="auth-input" placeholder="Password" value={form.roomPass} onChange={(e) => f("roomPass", e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input type="checkbox" checked={form.publishRoom} onChange={(e) => f("publishRoom", e.target.checked)} className="w-4 h-4 accent-primary" />
              Publish Room Info to Players
            </label>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1" onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : (editId ? "Update Match" : "Create Match")}
            </Button>
            <Button className="bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={reset}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tournaments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-border">
            <Trophy size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-muted text-sm font-medium">No tournaments yet. Create one above!</p>
          </div>
        ) : (
          tournaments.map((t) => (
            <div key={t.id} className="bg-white border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColor[t.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {t.status}
                    </span>
                    {t.isVipOnly && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700">👑 VIP Only</span>}
                    <span className="text-xs text-muted font-medium">{t.category ?? t.game} · {t.type ?? t.mode} {t.serial ? `· ${t.serial}` : ""}</span>
                  </div>
                  <h3 className="font-bold text-foreground">{t.name}</h3>
                  <div className="flex gap-4 mt-1 text-xs text-muted font-medium flex-wrap">
                    <span>Pool: {formatCurrency(t.pool ?? t.prize ?? 0)}</span>
                    <span>Fee: {formatCurrency(t.fee ?? 0)}</span>
                    <span>Kill: ₹{t.perKill ?? 0}</span>
                    <span>{(t.joinedUsers ?? []).length}/{t.max ?? 100} joined</span>
                    {t.map && <span>Map: {t.map}</span>}
                  </div>
                  {t.publishRoom && t.roomId && (
                    <div className="mt-1 text-xs font-mono text-green-600">Room: {t.roomId} | Pass: {t.roomPass}</div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleEdit(t)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-50"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
