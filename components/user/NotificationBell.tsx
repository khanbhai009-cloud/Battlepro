"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Inbox, X } from "lucide-react";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { clearUnreadCount } from "@/actions/notifications";
import { motion, AnimatePresence } from "motion/react";

type NotificationDoc = {
  id: string;
  title?: string;
  body?: string;
  createdAt?: any;
  read?: boolean;
};

function formatRelative(ts: any): string {
  if (!ts) return "";
  let ms = 0;
  if (typeof ts === "string" || typeof ts === "number") ms = new Date(ts).getTime();
  else if (typeof ts === "object") {
    const sec = ts._seconds ?? ts.seconds;
    if (sec) ms = sec * 1000;
    else if (typeof ts.toMillis === "function") ms = ts.toMillis();
  }
  if (!ms) return "";
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(ms).toLocaleDateString();
}

export function NotificationBell({ userId }: { userId?: string }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<NotificationDoc[]>([]);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  // Live red-dot count from users/{uid}.unreadNotificationCount
  useEffect(() => {
    if (!userId) return;
    const unsub = onSnapshot(doc(db, "users", userId), (d) => {
      if (d.exists()) setUnreadCount(d.data()?.unreadNotificationCount || 0);
    });
    return () => unsub();
  }, [userId]);

  // Live notification feed for this user
  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotifs(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as NotificationDoc[]
      );
    });
    return () => unsub();
  }, [userId]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0 && userId) {
      setUnreadCount(0); // optimistic
      await clearUnreadCount(userId);
    }
  };

  const empty = useMemo(() => notifs.length === 0, [notifs]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell size={20} className="text-foreground" strokeWidth={2} />

        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-white shadow-sm"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label="Notifications"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-auto sm:mt-2 z-[70] w-[min(92vw,360px)] bg-white rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-primary" />
                <h3 className="text-sm font-extrabold text-foreground">
                  Notifications
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="p-1 rounded-md text-muted hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {empty ? (
                <div className="px-6 py-10 text-center">
                  <Inbox size={28} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-xs text-muted font-medium">
                    No notifications yet.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {notifs.map((n) => (
                    <li
                      key={n.id}
                      className="px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 mt-2 rounded-full bg-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-foreground line-clamp-1">
                            {n.title ?? "Notification"}
                          </div>
                          {n.body && (
                            <div className="text-xs text-muted mt-0.5 line-clamp-2">
                              {n.body}
                            </div>
                          )}
                          <div className="text-[10px] text-muted mt-1 font-medium">
                            {formatRelative(n.createdAt)}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
