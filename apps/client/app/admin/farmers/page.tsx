"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  useGetPendingFarmersQuery,
  useApproveFarmerMutation,
  useRejectFarmerMutation,
} from "@/lib/api/endpoints/admin";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ListSkeleton } from "@/components/Skeleton";
import Pager from "../Pager";
import AdminSelect from "@/components/Select";
import { User } from "@/lib/api/endpoints/userSlice";

const STATUS_CLASSES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  approved: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function AdminFarmers() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading, isFetching } = useGetPendingFarmersQuery({ page, status, search: debouncedSearch });
  const [approveFarmer] = useApproveFarmerMutation();
  const [rejectFarmer] = useRejectFarmerMutation();

  const farmers = data?.data ?? [];

  const handleApprove = async (farmer: User) => {
    if (!window.confirm(`Approve ${farmer.firstName} ${farmer.lastName} as a farmer?`)) return;
    try {
      await approveFarmer(farmer._id).unwrap();
      toast.success(`${farmer.firstName} has been approved`);
    } catch (err) {
      toast.error((err as { data?: { error?: string } })?.data?.error ?? "Approval failed");
    }
  };

  const handleReject = async (farmer: User) => {
    if (!window.confirm(`Reject ${farmer.firstName} ${farmer.lastName}'s farmer application?`)) return;
    try {
      await rejectFarmer(farmer._id).unwrap();
      toast.success(`${farmer.firstName} has been rejected`);
    } catch (err) {
      toast.error((err as { data?: { error?: string } })?.data?.error ?? "Rejection failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Farmers</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name, email, or farm name..."
          className="flex-1 min-w-52 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <AdminSelect
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by status"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All</option>
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
                  <th className="py-2 pr-4">Farm Name</th>
                  <th className="py-2 pr-4">Specialization</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map((farmer) => (
                  <tr key={farmer._id} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-2.5 pr-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {farmer.firstName} {farmer.lastName}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400">{farmer.email}</td>
                    <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400">{farmer.phone}</td>
                    <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400">
                      {farmer.farmerDetails?.farmName || "—"}
                    </td>
                    <td className="py-2.5 pr-4 capitalize text-gray-600 dark:text-gray-400">
                      {farmer.farmerDetails?.specialization || "—"}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                          STATUS_CLASSES[farmer.approvalStatus ?? "pending"]
                        }`}
                      >
                        {farmer.approvalStatus ?? "pending"}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        {farmer.approvalStatus !== "approved" && (
                          <button
                            onClick={() => handleApprove(farmer)}
                            className="px-2 py-1 text-xs text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition"
                          >
                            Approve
                          </button>
                        )}
                        {farmer.approvalStatus !== "rejected" && (
                          <button
                            onClick={() => handleReject(farmer)}
                            className="px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {farmers.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No farmers found.</p>
            )}
          </div>
          <Pager pagination={data?.pagination} onPage={setPage} />
        </div>
      )}
    </div>
  );
}
