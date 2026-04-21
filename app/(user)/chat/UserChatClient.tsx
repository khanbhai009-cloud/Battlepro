"use client";
import { useState, useEffect, useRef } from "react";
import { getFirebaseClient } from "@/lib/firebase-client";
import { Send, Loader2, Globe } from "lucide-react";

export function UserChatClient({ uid, ffName }: { uid: string; ffName: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    setMessages([]);
    setLoading(true);
    (async () => {
      try {
        const { db } = await getFirebaseClient();
        const { collection, query, orderBy, onSnapshot, limit } = await import("firebase/firestore");
        const q = query(collection(db, "global_chat"), orderBy("timestamp", "asc"), limit(50));
        unsub = onSnapshot(q, (snap) => {
          setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoading(false);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        });
      } catch {
        setLoading(false);
      }
    })();
    return () => {
      if (unsub) unsub();
    };
  }, [uid]);

  const handleSend = async () => {
    const t = text.trim();
    if (!t) return;
    setSending(true);
    try {
      const { db } = await getFirebaseClient();
      const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
      await addDoc(collection(db, "global_chat"), {
        senderName: ffName,
        senderType: "user",
        uid,
        text: t,
        timestamp: serverTimestamp(),
      });
      setText("");
    } catch {}
    setSending(false);
  };

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden flex flex-col h-[550px]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-gray-50">
        <Globe size={15} className="text-primary" />
        <span className="font-bold text-sm">Global Chat</span>
        <span className="text-xs text-muted ml-auto">{messages.length} messages</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={20} className="animate-spin text-muted" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-muted text-sm">No messages yet. Be the first!</div>
        ) : (
          messages.map((m: any) => {
            const isMe = m.uid === uid;
            const isStaff = m.senderType === "admin" || m.senderType === "staff";
            const time =
              m.timestamp?.toDate?.()?.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }) ?? "";
            return (
              <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[78%] rounded-xl px-3 py-2 text-sm ${
                    isMe
                      ? "bg-primary text-white rounded-br-sm"
                      : isStaff
                      ? "bg-amber-50 border border-amber-200 text-foreground rounded-bl-sm"
                      : "bg-gray-100 text-foreground rounded-bl-sm"
                  }`}
                >
                  {!isMe && (
                    <div
                      className={`text-[10px] font-bold mb-1 ${
                        isStaff ? "text-amber-600" : "text-primary"
                      }`}
                    >
                      {m.senderName} {isStaff ? "⭐" : ""}
                    </div>
                  )}
                  <div>{m.text}</div>
                  <div className={`text-[10px] mt-0.5 ${isMe ? "text-white/60" : "text-muted"}`}>
                    {time}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 p-3 border-t border-border bg-gray-50">
        <input
          className="auth-input flex-1 py-2 text-sm"
          placeholder="Send a message to the community..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="px-4 py-2 bg-primary text-white rounded-xl font-bold disabled:opacity-50"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
