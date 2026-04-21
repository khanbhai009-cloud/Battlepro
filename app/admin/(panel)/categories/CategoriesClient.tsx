"use client";
import { useState } from "react";
import { saveGameCategory, deleteGameCategory } from "@/actions/admin";
import { Button } from "@/components/ui/Button";
import { Loader2, Plus, Trash2, Pencil, GamepadIcon } from "lucide-react";

export function CategoriesClient({ categories }: { categories: any[] }) {
  const [list, setList] = useState(categories);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", url: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const reset = () => { setForm({ name: "", url: "" }); setEditId(null); setShowForm(false); };

  const handleSave = async () => {
    if (!form.name) { setMsg("Name is required!"); return; }
    setLoading(true);
    const res = await saveGameCategory(form, editId ?? undefined);
    setLoading(false);
    if (res.success) { setMsg("Saved!"); reset(); setTimeout(() => window.location.reload(), 600); }
    else setMsg("Error");
    setTimeout(() => setMsg(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await deleteGameCategory(id);
    setList(list.filter((c) => c.id !== id));
  };

  const handleEdit = (c: any) => {
    setEditId(c.id); setForm({ name: c.name ?? "", url: c.url ?? "" }); setShowForm(true); window.scrollTo(0, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted">{list.length} categories</span>
        <Button onClick={() => { reset(); setShowForm(!showForm); }} className="text-sm">
          <Plus size={15} /> {showForm ? "Cancel" : "Add Category"}
        </Button>
      </div>

      {msg && <div className={`px-4 py-3 rounded-lg text-sm font-medium ${msg === "Saved!" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{msg}</div>}

      {showForm && (
        <div className="bg-white border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-sm">{editId ? "Edit Category" : "New Category"}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Game Name *</label>
              <input className="auth-input" placeholder="e.g. Free Fire" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Logo Image URL</label>
              <input className="auth-input" placeholder="https://..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </div>
          </div>
          {form.url && <img src={form.url} alt="preview" className="w-16 h-16 object-contain border border-border rounded-lg" />}
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : "Save Category"}
            </Button>
            {editId && <Button className="flex-1 bg-gray-100 text-gray-700" onClick={reset}>Cancel</Button>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {list.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-white rounded-xl border border-dashed border-border">
            <GamepadIcon size={32} className="mx-auto mb-2 text-gray-200" />
            <p className="text-muted text-sm">No categories yet.</p>
          </div>
        ) : list.map((c) => (
          <div key={c.id} className="bg-white border border-border rounded-xl p-4 flex flex-col items-center gap-2">
            {c.url ? <img src={c.url} alt={c.name} className="w-12 h-12 object-contain" /> : <GamepadIcon size={32} className="text-gray-300" />}
            <div className="font-bold text-sm text-center">{c.name}</div>
            <div className="flex gap-1">
              <button onClick={() => handleEdit(c)} className="p-1.5 text-blue-400 hover:bg-blue-50 rounded-lg"><Pencil size={13} /></button>
              <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
