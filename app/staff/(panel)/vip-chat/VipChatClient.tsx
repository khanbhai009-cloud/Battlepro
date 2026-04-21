"use client";
import { useState, useEffect, useRef } from "react";
import { getFirebaseClient } from "@/lib/firebase-client";
import { Send, Loader2, Crown } from "lucide-react";

export function VipChatClient({ vipUsers, senderType, senderName }: { vipUsers: any[]; senderType: string; senderName: string }) {
  const [activeUid, setActiveUid] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeUid) return;
    let unsub: any;
    (async () => {
      const { db } = await getFirebaseClient();
      const { collection, query, where, onSnapshot, orderBy } = await import("firebase/firestore");
      const q = query(collection(db, "direct_messages"), where("uid", "==", activeUid));
      unsub = onSnapshot(q, (snap) => {
        const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => {
          const ta = a.timestamp?.toDate?.()?.getTime?.() ?? 0;
          const tb = b.timestamp?.toDate?.()?.getTime?.() ?? 0;
          return ta - tb;
        });
        setMessages(msgs);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      });
    })();
    return () => { if (unsub) unsub(); };
  }, [activeUid]);

  const handleSend = async () => {
    if (!activeUid || !text.trim()) return;
    setSending(true);
    try {
      const { db } = await getFirebaseClient();
      const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
      await addDoc(collection(db, "direct_messages"), { uid: activeUid, senderName, senderType, text: text.trim(), timestamp: serverTimestamp() });
      setText("");
    } catch {}
    setSending(false);
  };

  const activeUser = vipUsers.find((u) => u.id === activeUid);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
      <div className="bg-white border border-border rounded-xl overflow-hidden flex flex-col">
        <div className="p-3 border-b border-border font-bold text-sm flex items-center gap-2">
          <Crown size={14} className="text-amber-500" /> VIP Users ({vipUsers.length})
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {vipUsers.length === 0 ? (
            <div className="text-center py-8 text-muted text-sm">No VIP users.</div>
          ) : vipUsers.map((u) => (
            <div key={u.id} onClick={() => setActiveUid(u.id)} className={`p-3 cursor-pointer hover:bg-gray-50 flex items-center gap-2 transition-colors ${activeUid === u.id ? "bg-primary/5 border-l-2 border-primary" : ""}`}>
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">{(u.ffName ?? "V")[0].toUpperCase()}</div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-foreground truncate">{u.ffName ?? "VIP User"}</div>
                <div className="text-xs text-muted truncate">{u.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="md:col-span-2 bg-white border border-border rounded-xl overflow-hidden flex flex-col">
        {!activeUid ? (
          <div className="flex-1 flex items-center justify-center text-muted text-sm">Select a VIP user to start chatting</div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-border bg-gray-50">
              <div className="font-bold text-sm">Chatting with: {activeUser?.ffName ?? activeUid}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m: any) => {
                const isMine = m.senderType !== "user";
                return (
                  <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${isMine ? "bg-primary text-white rounded-br-sm" : "bg-gray-100 text-foreground rounded-bl-sm"}`}>
                      {!isMine && <div className="text-[10px] font-bold text-amber-600 mb-1">{m.senderName}</div>}
                      <div>{m.text}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="flex gap-2 p-3 border-t border-border bg-gray-50">
              <input
                className="auth-input flex-1 py-2 text-sm"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button onClick={handleSend} disabled={sending || !text.trim()} className="px-4 py-2 bg-primary text-white rounded-xl font-bold disabled:opacity-50">
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
