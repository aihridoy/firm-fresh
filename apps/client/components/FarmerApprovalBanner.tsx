"use client";

import { useAppSelector } from "@/lib/hooks";
import { selectCurrentUser } from "@/lib/api/endpoints/userSlice";

export default function FarmerApprovalBanner() {
  const user = useAppSelector(selectCurrentUser);

  if (!user || user.userType !== "farmer" || user.approvalStatus === "approved") {
    return null;
  }

  if (user.approvalStatus === "rejected") {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <i className="fas fa-times-circle text-red-500"></i>
            <p className="text-sm text-red-700 dark:text-red-300">
              <span className="font-semibold">Application Rejected:</span> Your farmer account application has been rejected. Please contact support for more information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <i className="fas fa-clock text-yellow-500"></i>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            <span className="font-semibold">Pending Approval:</span> Your farmer account is awaiting admin approval. You will be able to list products once approved.
          </p>
        </div>
      </div>
    </div>
  );
}
