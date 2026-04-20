"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { AlertTriangle, Hammer } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function AppStatusListener() {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    // Critical global listener for Maintenance Mode, App Version, and Alerts
    const unsub = onSnapshot(doc(db, "settings", "general"), (snapshot) => {
      if (snapshot.exists()) {
        setStatus(snapshot.data());
      }
    });

    return () => unsub();
  }, []);

  return (
    <AnimatePresence>
      {status?.maintenanceMode && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-10 text-center"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Hammer className="text-primary w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">System Maintenance</h1>
          <p className="text-muted text-sm max-w-xs mx-auto leading-relaxed">
            {status.maintenanceMessage || "We are currently improving the battlefield. Please check back shortly."}
          </p>
          
          <div className="mt-10 pt-10 border-t border-border w-full max-w-xs">
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest">
              <AlertTriangle size={12} className="text-amber-500" />
              BattleZone Pro v2.0
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
