"use client";
import { useState } from "react";
import { saveBanner, deleteBanner } from "@/actions/admin";
import { Button } from "@/components/ui/Button";
import { Loader2, Plus, Trash2, Pencil, Image } from "lucide-react";

export function BannersClient({ banners }: { banners: any[] }) {
  const [list, setList] = useState(banners);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ url: "", link: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const reset = () => { setForm({ url: "", link: "" }); setEditId(null); setShowForm(false); };

  const handleSave = async () => {
    if (!form.url) { setMsg("Image URL is required!"); return; }
    setLoading(true);
    const res = await saveBanner(form, editId ?? undefined);
    setLoading(false);
    if (res.success) { setMsg("Saved!"); reset(); setTimeout(() => { window.location.reload(); }, 600); }
    else setMsg("Error saving banner");
    setTimeout(() => setMsg(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    await deleteBanner(id);
    setList(list.filter((b) => b.id !== id));
  };

  const handleEdit = (b: any) => {
    setEditId(b.id); setForm({ url: b.url ?? "", link: b.link ?? "" }); setShowForm(true); window.scrollTo(0, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted">{list.length} banners</span>
        <Button onClick={() => { reset(); setShowForm(!showForm); }} className="text-sm">
          <Plus size={15} /> {showForm ? "Cancel" : "Add Banner"}
        </Button>
      </div>

      {msg && <div className={`px-4 py-3 rounded-lg text-sm font-medium ${msg === "Saved!" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{msg}</div>}

      {showForm && (
        <div className="bg-white border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-sm">{editId ? "Edit Banner" : "New Banner"}</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Image URL *</label>
              <input className="auth-input" placeholder="https://imgur.com/banner.jpg" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </div>
            {form.url && <img src={form.url} alt="preview" className="w-full h-32 object-cover rounded-lg border border-border" onError={(e) => (e.currentTarget.style.display = "none")} />}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Target Link (Optional)</label>
              <input className="auth-input" placeholder="https://instagram.com/..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : "Save Banner"}
            </Button>
            {editId && <Button className="flex-1 bg-gray-100 text-gray-700" onClick={reset}>Cancel</Button>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {list.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-dashed border-border">
            <Image size={32} className="mx-auto mb-2 text-gray-200" />
            <p className="text-muted text-sm">No banners yet. Add one above!</p>
          </div>
        ) : list.map((b) => (
          <div key={b.id} className="bg-white border border-border rounded-xl overflow-hidden">
            <img src={b.url} alt="banner" className="w-full h-28 object-cover" onError={(e) => { e.currentTarget.src = ""; e.currentTarget.style.background = "#f3f4f6"; }} />
            <div className="p-3 flex justify-between items-center">
              <p className="text-xs text-muted truncate flex-1">{b.link || "No link"}</p>
              <div className="flex gap-1 ml-2">
                <button onClick={() => handleEdit(b)} className="p-1.5 text-blue-400 hover:bg-blue-50 rounded-lg"><Pencil size={13} /></button>
                <button onClick={() => handleDelete(b.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
