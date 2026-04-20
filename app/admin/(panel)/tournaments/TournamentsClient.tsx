"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { createTournament, updateTournamentStatus, deleteTournament } from "@/actions/admin";
import { Plus, Loader2, Trash2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";

const games = ["BGMI", "Free Fire", "Valorant", "COD Mobile", "PUBG PC"];
const modes = ["Solo", "Duo", "Squad"];
const statuses = ["upcoming", "live", "ended"];

interface Tournament {
  id: string;
  name: string;
  game: string;
  mode: string;
  prize: number;
  fee: number;
  max: number;
  status: string;
  joinedUsers?: any[];
}

export function TournamentsClient({ tournaments }: { tournaments: Tournament[] }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({
    name: "", game: "BGMI", mode: "Squad", prize: "", fee: "", max: "100", status: "upcoming", description: ""
  });

  const handleCreate = async () => {
    if (!form.name || !form.prize || !form.fee) { setMsg({ type: "error", text: "Fill all required fields." }); return; }
    setLoading(true);
    try {
      const result = await createTournament({
        name: form.name, game: form.game, mode: form.mode,
        prize: Number(form.prize), fee: Number(form.fee),
        max: Number(form.max), status: form.status, description: form.description,
      });
      if (result.success) {
        setMsg({ type: "success", text: "Tournament created!" });
        setForm({ name: "", game: "BGMI", mode: "Squad", prize: "", fee: "", max: "100", status: "upcoming", description: "" });
        setShowForm(false);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMsg({ type: "error", text: result.error || "Failed to create." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateTournamentStatus(id, status);
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tournament?")) return;
    await deleteTournament(id);
    window.location.reload();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium text-muted">{tournaments.length} tournaments total</p>
        <Button onClick={() => setShowForm(!showForm)} className="text-sm">
          <Plus size={16} />{showForm ? "Cancel" : "New Tournament"}
        </Button>
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${msg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
          {msg.text}
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-bold">Create New Tournament</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Tournament Name *</label>
              <input className="auth-input" placeholder="e.g. BGMI Pro League S2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Game</label>
              <select className="auth-input bg-white" value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })}>
                {games.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Mode</label>
              <select className="auth-input bg-white" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                {modes.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Prize Pool (₹) *</label>
              <input type="number" className="auth-input" placeholder="25000" value={form.prize} onChange={(e) => setForm({ ...form, prize: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Entry Fee (₹) *</label>
              <input type="number" className="auth-input" placeholder="100" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Max Slots</label>
              <input type="number" className="auth-input" placeholder="100" value={form.max} onChange={(e) => setForm({ ...form, max: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Status</label>
              <select className="auth-input bg-white" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {statuses.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Description / Rules</label>
              <textarea className="auth-input min-h-[80px] resize-y" placeholder="Match rules, schedule info..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <Button className="w-full" onClick={handleCreate} disabled={loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : "Create Tournament"}
          </Button>
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
            <div key={t.id} className="bg-white border border-border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${t.status === "live" ? "bg-red-100 text-red-600" : t.status === "upcoming" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                    {t.status}
                  </span>
                  <span className="text-xs text-muted font-medium">{t.game} · {t.mode}</span>
                </div>
                <h3 className="font-bold text-foreground truncate">{t.name}</h3>
                <div className="flex gap-4 mt-1 text-xs text-muted font-medium">
                  <span>Prize: {formatCurrency(t.prize)}</span>
                  <span>Fee: {formatCurrency(t.fee)}</span>
                  <span>{t.joinedUsers?.length ?? 0}/{t.max} joined</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  className="text-xs border border-border rounded-lg px-2 py-1.5 font-bold bg-white"
                  value={t.status}
                  onChange={(e) => handleStatusChange(t.id, e.target.value)}
                >
                  {statuses.map((s) => <option key={s}>{s}</option>)}
                </select>
                <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
