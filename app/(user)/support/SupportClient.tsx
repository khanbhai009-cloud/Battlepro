"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { submitSupportTicket } from "@/actions/support";
import { Loader2, MessageCircle, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const categories = ["Payment Issue", "Match Problem", "Account Issue", "Withdrawal Issue", "Bug Report", "Other"];

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: string;
  message: string;
  adminReply?: string;
  createdAt?: any;
}

export function SupportClient({ userId, tickets }: { userId: string; tickets: Ticket[] }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeView, setActiveView] = useState<"new" | "history">("new");

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setMsg({ type: "error", text: "Please fill in all fields." });
      return;
    }
    setLoading(true);
    try {
      const result = await submitSupportTicket(userId, subject.trim(), message.trim(), category);
      if (result.success) {
        setMsg({ type: "success", text: "Ticket submitted! We'll respond within 24h." });
        setSubject(""); setMessage("");
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMsg({ type: "error", text: result.error || "Failed to submit ticket." });
      }
    } finally {
      setLoading(false);
    }
  };

  const statusIcon = (status: string) => {
    if (status === "Open") return <Clock size={14} className="text-amber-500" />;
    if (status === "Resolved") return <CheckCircle2 size={14} className="text-green-500" />;
    return <AlertCircle size={14} className="text-red-500" />;
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(["new", "history"] as const).map((v) => (
          <button key={v} onClick={() => setActiveView(v)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeView === v ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}>
            {v === "new" ? "New Ticket" : `My Tickets (${tickets.length})`}
          </button>
        ))}
      </div>

      {activeView === "new" && (
        <div className="card-base space-y-5">
          {msg && (
            <div className={`px-4 py-3 rounded-lg text-sm font-medium ${msg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
              {msg.text}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Category</label>
            <select className="auth-input bg-white" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Subject</label>
            <input type="text" className="auth-input" placeholder="Brief description of your issue" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Message</label>
            <textarea className="auth-input min-h-[120px] resize-y" placeholder="Describe your issue in detail..." value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <Button className="w-full py-3 text-sm" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <><MessageCircle size={16} />Submit Ticket</>}
          </Button>
        </div>
      )}

      {activeView === "history" && (
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-border">
              <MessageCircle size={32} className="mx-auto text-gray-200 mb-3" />
              <p className="text-muted text-sm font-medium">No tickets yet. Submit one if you need help!</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="card-base">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="font-bold text-sm text-foreground">{ticket.subject}</div>
                    <div className="text-[10px] text-muted font-bold uppercase tracking-wide mt-0.5">{ticket.category}</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold shrink-0">
                    {statusIcon(ticket.status)}
                    <span className={ticket.status === "Resolved" ? "text-green-600" : ticket.status === "Open" ? "text-amber-600" : "text-red-500"}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted leading-relaxed">{ticket.message}</p>
                {ticket.adminReply && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-primary mb-1">Admin Reply</div>
                    <p className="text-xs text-foreground leading-relaxed">{ticket.adminReply}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
