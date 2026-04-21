"use client";
import { useState, useEffect, useRef } from "react";
import { getFirebaseClient } from "@/lib/firebase-client";
import { Send, Loader2, Globe, Lock, Crown } from "lucide-react";

export function UserChatClient({ uid, ffName, isVip }: { uid: string; ffName: string; isVip: boolean }) {
  const [tab, setTab] = useState<"global" | "vip">("global");
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unsub: any;
    setMessages([]); setLoading(true);
    (async () => {
      try {
        const { db } = await getFirebaseClient();
        const { collection, query, orderBy, onSnapshot, where, limit } = await import("firebase/firestore");
        if (tab === "global") {
          const q = query(collection(db, "global_chat"), orderBy("timestamp", "asc"), limit(50));
          unsub = onSnapshot(q, (snap) => {
            setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            setLoading(false);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
          });
        } else if (tab === "vip" && isVip) {
          const q = query(collection(db, "direct_messages"), where("uid", "==", uid), limit(50));
          unsub = onSnapshot(q, (snap) => {
            const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => {
              return (a.timestamp?.toDate?.()?.getTime?.() ?? 0) - (b.timestamp?.toDate?.()?.getTime?.() ?? 0);
            });
            setMessages(msgs);
            setLoading(false);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
          });
        } else {
          setLoading(false);
        }
      } catch { setLoading(false); }
    })();
    return () => { if (unsub) unsub(); };
  }, [tab, uid, isVip]);

  const handleSend = async () => {
    const t = text.trim();
    if (!t) return;
    setSending(true);
    try {
      const { db } = await getFirebaseClient();
      const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
      if (tab === "global") {
        await addDoc(collection(db, "global_chat"), { senderName: ffName, senderType: "user", uid, text: t, timestamp: serverTimestamp() });
      } else if (tab === "vip") {
        await addDoc(collection(db, "direct_messages"), { uid, senderName: ffName, senderType: "user", text: t, timestamp: serverTimestamp() });
      }
      setText("");
    } catch {}
    setSending(false);
  };

  const tabs = [
    { key: "global", label: "Global Chat", icon: Globe },
    { key: "vip", label: "VIP Support", icon: Crown },
  ];

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden flex flex-col h-[550px]">
      <div className="flex border-b border-border">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold transition-all ${active ? "text-primary border-b-2 border-primary" : "text-muted hover:text-foreground"}`}>
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full"><Loader2 size={20} className="animate-spin text-muted" /></div>
        ) : tab === "vip" && !isVip ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Lock size={32} className="text-gray-300 mb-3" />
            <div className="font-bold text-sm">VIP Only Feature</div>
            <p className="text-muted text-xs mt-1">Upgrade to VIP to chat directly with our support team.</p>
            <a href="/vip" className="mt-3 text-primary text-xs font-bold hover:underline">Get VIP →</a>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-muted text-sm">No messages yet. Be the first!</div>
        ) : messages.map((m: any) => {
          const isMe = m.uid === uid || m.senderType === "user" && m.uid === uid;
          const isStaff = m.senderType === "admin" || m.senderType === "staff";
          const time = m.timestamp?.toDate?.()?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) ?? "";
          return (
            <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] rounded-xl px-3 py-2 text-sm ${isMe ? "bg-primary text-white rounded-br-sm" : isStaff ? "bg-amber-50 border border-amber-200 text-foreground rounded-bl-sm" : "bg-gray-100 text-foreground rounded-bl-sm"}`}>
                {!isMe && <div className={`text-[10px] font-bold mb-1 ${isStaff ? "text-amber-600" : "text-primary"}`}>{m.senderName} {isStaff ? "⭐" : ""}</div>}
                <div>{m.text}</div>
                <div className={`text-[10px] mt-0.5 ${isMe ? "text-white/60" : "text-muted"}`}>{time}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {(tab === "global" || (tab === "vip" && isVip)) && (
        <div className="flex gap-2 p-3 border-t border-border bg-gray-50">
          <input
            className="auth-input flex-1 py-2 text-sm"
            placeholder={tab === "global" ? "Send a message..." : "Message support..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          />
          <button onClick={handleSend} disabled={sending || !text.trim()} className="px-4 py-2 bg-primary text-white rounded-xl font-bold disabled:opacity-50">
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      )}
    </div>
  );
}
