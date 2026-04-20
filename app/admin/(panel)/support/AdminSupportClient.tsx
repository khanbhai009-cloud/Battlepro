"use client";

import { useState } from "react";
import { updateTicketStatus } from "@/actions/support";
import { Button } from "@/components/ui/Button";
import { Loader2, MessageCircle, CheckCircle2, Clock, ChevronDown, ChevronUp } from "lucide-react";

interface Ticket {
  id: string;
  ffName?: string;
  email?: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  adminReply?: string;
}

export function AdminSupportClient({ tickets }: { tickets: Ticket[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [localTickets, setLocalTickets] = useState(tickets);
  const [filter, setFilter] = useState<"all" | "Open" | "Resolved">("all");

  const filtered = localTickets.filter((t) => filter === "all" || t.status === filter);

  const handleResolve = async (ticketId: string) => {
    setLoading(ticketId);
    const reply = replyText[ticketId] || "";
    await updateTicketStatus(ticketId, "Resolved", reply || undefined);
    setLocalTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, status: "Resolved", adminReply: reply || t.adminReply } : t));
    setLoading(null);
    setExpanded(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(["all", "Open", "Resolved"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === f ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}>
            {f === "all" ? `All (${tickets.length})` : f === "Open" ? `Open (${tickets.filter((t) => t.status === "Open").length})` : `Resolved (${tickets.filter((t) => t.status === "Resolved").length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-border">
          <MessageCircle size={36} className="mx-auto text-gray-200 mb-3" />
          <p className="text-muted text-sm font-medium">No tickets here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => (
            <div key={ticket.id} className="bg-white border border-border rounded-xl overflow-hidden">
              <div
                className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {ticket.status === "Resolved"
                    ? <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                    : <Clock size={16} className="text-amber-500 shrink-0" />}
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-foreground truncate">{ticket.subject}</div>
                    <div className="text-xs text-muted truncate">{ticket.ffName} · {ticket.category}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${ticket.status === "Resolved" ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}>
                    {ticket.status}
                  </span>
                  {expanded === ticket.id ? <ChevronUp size={15} className="text-muted" /> : <ChevronDown size={15} className="text-muted" />}
                </div>
              </div>

              {expanded === ticket.id && (
                <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">Player Message</div>
                    <p className="text-sm text-foreground leading-relaxed">{ticket.message}</p>
                  </div>

                  {ticket.adminReply && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Your Reply</div>
                      <p className="text-sm text-foreground">{ticket.adminReply}</p>
                    </div>
                  )}

                  {ticket.status === "Open" && (
                    <div className="space-y-3">
                      <textarea
                        className="auth-input min-h-[80px] resize-y text-sm"
                        placeholder="Reply to player (optional)..."
                        value={replyText[ticket.id] ?? ""}
                        onChange={(e) => setReplyText({ ...replyText, [ticket.id]: e.target.value })}
                      />
                      <Button onClick={() => handleResolve(ticket.id)} disabled={loading === ticket.id} className="text-sm">
                        {loading === ticket.id ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle2 size={14} />Mark as Resolved</>}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
