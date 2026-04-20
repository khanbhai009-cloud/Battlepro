import { getRedeemCodes } from "@/actions/redeem";
import { SettingsClient } from "./SettingsClient";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const codes = await getRedeemCodes();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Settings</h1>
        <p className="text-muted text-sm font-medium">Manage redeem codes and platform settings.</p>
      </div>
      <SettingsClient codes={codes as any[]} />
    </div>
  );
}
