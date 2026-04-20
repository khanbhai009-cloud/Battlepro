"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useEffect } from "react";

export function NotificationsProvider({ userId }: { userId?: string }) {
  // This component simply triggers the Capacitor logic on mount
  usePushNotifications(userId);
  
  return null;
}
