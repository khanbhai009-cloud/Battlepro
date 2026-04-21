import { getAppSchedule } from "@/actions/admin";
import { AppScheduleClient } from "./AppScheduleClient";

export const revalidate = 0;

export default async function AppSchedulePage() {
  const schedule = await getAppSchedule();
  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-xl font-bold">App Schedule / Maintenance</h1>
        <p className="text-sm text-muted mt-1">Control app access — open, closed, or scheduled maintenance.</p>
      </div>
      <AppScheduleClient initialData={schedule as any} />
    </div>
  );
}
