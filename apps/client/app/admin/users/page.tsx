"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  useGetAdminUsersQuery,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
} from "@/lib/api/endpoints/admin";
import { useAppSelector } from "@/lib/hooks";
import { selectCurrentUser, User } from "@/lib/api/endpoints/userSlice";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ListSkeleton } from "@/components/Skeleton";
import Pager from "../Pager";
import AdminSelect from "../AdminSelect";

const ROLE_CLASSES: Record<string, string> = {
  admin: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  farmer: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  customer: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
};

export default function AdminUsers() {
  const me = useAppSelector(selectCurrentUser);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, isFetching } = useGetAdminUsersQuery({ page, role, search: debouncedSearch });
  const [updateUser] = useUpdateAdminUserMutation();
  const [deleteUser] = useDeleteAdminUserMutation();

  const users = data?.data ?? [];

  const handleRoleChange = async (user: User, userType: string) => {
    try {
      await updateUser({ id: user._id, body: { userType: userType as User["userType"] } }).unwrap();
      toast.success(`${user.firstName} is now a ${userType}`);
    } catch (err) {
      toast.error((err as { data?: { error?: string } })?.data?.error ?? "Update failed");
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Delete ${user.firstName} ${user.lastName} (${user.email})? This cannot be undone.`)) return;
    try {
      await deleteUser(user._id).unwrap();
      toast.success("User deleted");
    } catch (err) {
      toast.error((err as { data?: { error?: string } })?.data?.error ?? "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Users</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or email..."
          className="flex-1 min-w-52 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <AdminSelect
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by role"
        >
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="farmer">Farmer</option>
          <option value="admin">Admin</option>
        </AdminSelect>
      </div>

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-opacity ${isFetching ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Phone</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Joined</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isAdmin = user.userType === "admin";
                  return (
                    <tr key={user._id} className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-2.5 pr-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {user.firstName} {user.lastName}
                        {me?._id === user._id && <span className="ml-1 text-xs text-gray-400">(you)</span>}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                      <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400">{user.phone}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${ROLE_CLASSES[user.userType]}`}>
                          {user.userType}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <AdminSelect
                            small
                            value={user.userType}
                            disabled={isAdmin}
                            onChange={(e) => handleRoleChange(user, e.target.value)}
                            aria-label="Change role"
                          >
                            <option value="customer">Customer</option>
                            <option value="farmer">Farmer</option>
                            <option value="admin">Admin</option>
                          </AdminSelect>
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={isAdmin}
                            className="px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-40 transition"
                            title={isAdmin ? "Admin accounts cannot be deleted" : "Delete user"}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No users found.</p>
            )}
          </div>
          <Pager pagination={data?.pagination} onPage={setPage} />
        </div>
      )}
    </div>
  );
}
