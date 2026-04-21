"use client";
import { useState } from "react";
import { createStaffUser, updateStaffUser, deleteStaffUser } from "@/actions/admin";
import { Button } from "@/components/ui/Button";
import { Loader2, Plus, Trash2, Pencil, UserCog } from "lucide-react";

export function StaffManagementClient({ staff }: { staff: any[] }) {
  const [list, setList] = useState(staff);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const reset = () => { setForm({ name: "", email: "", password: "" }); setEditId(null); setShowForm(false); };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.password) { setMsg({ type: "error", text: "All fields required!" }); return; }
    if (form.password.length < 6) { setMsg({ type: "error", text: "Password must be at least 6 characters." }); return; }
    setLoading(true);
    const res = editId ? await updateStaffUser(editId, form) : await createStaffUser(form);
    setLoading(false);
    if (res.success) {
      setMsg({ type: "success", text: editId ? "Staff updated!" : "Staff created!" });
      reset();
      setTimeout(() => { window.location.reload(); }, 800);
    } else {
      setMsg({ type: "error", text: (res as any).error ?? "Failed" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this staff member?")) return;
    await deleteStaffUser(id);
    setList(list.filter((s) => s.id !== id));
  };

  const handleEdit = (s: any) => {
    setEditId(s.id); setForm({ name: s.name, email: s.email, password: s.password ?? "" }); setShowForm(true); window.scrollTo(0, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted">{list.length} staff members</span>
        <Button onClick={() => { reset(); setShowForm(!showForm); }} className="text-sm">
          <Plus size={15} /> {showForm ? "Cancel" : "Add Staff"}
        </Button>
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${msg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
          {msg.text}
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-sm">{editId ? "Edit Staff" : "Create Staff"}</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Staff Name *</label>
              <input className="auth-input" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Email *</label>
              <input type="email" className="auth-input" placeholder="staff@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Password *</label>
              <input type="text" className="auth-input" placeholder="min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : (editId ? "Update Staff" : "Create Staff")}
            </Button>
            {editId && <Button className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={reset}>Cancel</Button>}
          </div>
        </div>
      )}

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Staff</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Password</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-10 text-muted text-sm">
                <UserCog size={32} className="mx-auto mb-2 text-gray-200" />
                No staff created yet.
              </td></tr>
            ) : list.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-bold text-foreground">{s.name}</div>
                  <div className="text-xs text-muted">{s.email}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-amber-600">{s.password}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-50"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
