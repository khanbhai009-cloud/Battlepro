"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { clearUnreadCount } from "@/actions/notifications";
import { motion, AnimatePresence } from "motion/react";

/**
 * 🔔 The "Red Dot" (Unread Badge) Optimization
 * - Minimal server reads via single document snapshot (not querying collections)
 * - Observes unreadNotificationCount (integer) inside the main users document.
 */
export function NotificationBell({ userId }: { userId?: string }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Listen only to the specific client's doc for real-time red dot state
    const userDocRef = doc(db, "users", userId);
    const unsub = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const count = doc.data().unreadNotificationCount || 0;
        setUnreadCount(count);
      }
    });

    return () => unsub();
  }, [userId]);

  const handleOpenNotifications = async () => {
    // When the user opens the notification tab/dropdown:
    // Trigger Server Action to securely reset unreadNotificationCount to 0
    if (unreadCount > 0 && userId) {
      setUnreadCount(0); // Optimistic UI update
      await clearUnreadCount(userId);
    }
  };

  return (
    <button
      onClick={handleOpenNotifications}
      className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
      aria-label="Notifications"
    >
      <Bell size={20} className="text-foreground" strokeWidth={2} />

      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 border-2 border-white shadow-sm"
          >
            <span className="sr-only">New notifications</span>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
