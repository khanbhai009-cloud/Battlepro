import { getAllUsers } from "@/actions/admin";
import { StaffUsersClient } from "./StaffUsersClient";

export const revalidate = 0;

export default async function StaffUsersPage() {
  const users = await getAllUsers();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">User Management</h1>
        <p className="text-sm text-muted mt-1">View and manage user accounts, block/unblock players.</p>
      </div>
      <StaffUsersClient users={users as any[]} />
    </div>
  );
}
