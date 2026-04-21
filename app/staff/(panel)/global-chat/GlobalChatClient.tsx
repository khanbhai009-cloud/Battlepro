"use client";
import { useState, useEffect, useRef } from "react";
import { getFirebaseClient } from "@/lib/firebase-client";
import { Send, Loader2, Globe } from "lucide-react";

export function GlobalChatClient({ senderType, senderName }: { senderType: string; senderName: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unsub: any;
    (async () => {
      try {
        const { db } = await getFirebaseClient();
        const { collection, orderBy, query, onSnapshot } = await import("firebase/firestore");
        const q = query(collection(db, "global_chat"), orderBy("timestamp", "asc"));
        unsub = onSnapshot(q, (snap) => {
          setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoading(false);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        });
      } catch { setLoading(false); }
    })();
    return () => { if (unsub) unsub(); };
  }, []);

  const handleSend = async () => {
    const t = text.trim();
    if (!t) return;
    setSending(true);
    try {
      const { db } = await getFirebaseClient();
      const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
      await addDoc(collection(db, "global_chat"), { senderName, senderType, text: t, timestamp: serverTimestamp() });
      setText("");
    } catch {}
    setSending(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const { db } = await getFirebaseClient();
      const { doc, deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "global_chat", id));
    } catch {}
  };

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden flex flex-col h-[600px]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-gray-50">
        <Globe size={16} className="text-primary" />
        <span className="font-bold text-sm">Global Chat</span>
        <span className="text-xs text-muted ml-auto">{messages.length} messages</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full"><Loader2 size={20} className="animate-spin text-muted" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted text-sm py-10">No messages yet. Start chatting!</div>
        ) : messages.map((m: any) => {
          const isAdmin = m.senderType === "admin" || m.senderType === "staff";
          const time = m.timestamp?.toDate?.()?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) ?? "";
          return (
            <div key={m.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"} group`}>
              <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${isAdmin ? "bg-primary text-white rounded-br-sm" : "bg-gray-100 text-foreground rounded-bl-sm"}`}>
                {!isAdmin && <div className="text-[10px] font-bold text-amber-600 mb-1">{m.senderName}</div>}
                <div>{m.text}</div>
                <div className={`text-[10px] mt-1 ${isAdmin ? "text-white/70" : "text-muted"}`}>{time}</div>
              </div>
              <button onClick={() => handleDelete(m.id)} className="ml-2 opacity-0 group-hover:opacity-100 text-red-400 text-xs self-center transition-opacity">✕</button>
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
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
        />
        <button onClick={handleSend} disabled={sending || !text.trim()} className="px-4 py-2 bg-primary text-white rounded-xl font-bold disabled:opacity-50">
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
