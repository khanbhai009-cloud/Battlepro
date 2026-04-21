import { getStaffUsers } from "@/actions/admin";
import { StaffManagementClient } from "./StaffManagementClient";

export const revalidate = 0;

export default async function StaffPage() {
  const staff = await getStaffUsers();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Staff Setup</h1>
        <p className="text-sm text-muted mt-1">Create and manage staff accounts for match management.</p>
      </div>
      <StaffManagementClient staff={staff as any[]} />
    </div>
  );
}
