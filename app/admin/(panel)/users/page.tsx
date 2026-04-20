import { getAllUsers } from "@/actions/admin";
import { UsersClient } from "./UsersClient";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const users = await getAllUsers();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Users</h1>
        <p className="text-muted text-sm font-medium">Manage player accounts, roles, and bonus balance.</p>
      </div>
      <UsersClient users={users as any[]} />
    </div>
  );
}
