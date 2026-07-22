"use client";

import Link from "next/link";
import { useGetAllFarmersQuery } from "@/lib/api/endpoints/users";
import { FarmerGridSkeleton } from "@/components/Skeleton";

interface Farmer {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  address: string;
  phone: string;
  bio?: string;
  farmerDetails?: {
    farmName: string;
    specialization: string;
    farmSize?: { value: number; unit: string };
  };
}

export default function FarmersPage() {
  const { data, isLoading, isError } = useGetAllFarmersQuery(undefined);
  const farmers: Farmer[] = data?.data ?? [];

  return (
    <>
      {/* Page Header */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Meet Our Farmers</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Discover the passionate farmers who grow fresh, organic produce with care and dedication
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">{farmers.length}</div>
            <div className="text-gray-600 dark:text-gray-400">Active Farmers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              {new Set(farmers.map((f) => f.address)).size}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Locations Covered</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              {new Set(farmers.map((f) => f.farmerDetails?.specialization).filter(Boolean)).size}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Specializations</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">100%</div>
            <div className="text-gray-600 dark:text-gray-400">Farm Direct</div>
          </div>
        </div>

        {isLoading && <FarmerGridSkeleton count={6} />}
        {isError && <p className="text-center text-red-500 py-12">Couldn&apos;t load farmers. Please try again.</p>}
        {!isLoading && !isError && farmers.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">No farmers registered yet.</p>
        )}

        {/* Farmers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {farmers.map((farmer) => (
            <div
              key={farmer._id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="relative">
                {farmer.profilePicture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={farmer.profilePicture} alt={farmer.firstName} className="w-full h-64 object-cover" />
                ) : (
                  <div className="w-full h-64 bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <span className="text-5xl font-bold text-primary-600 dark:text-primary-400">
                      {farmer.firstName.charAt(0)}
                      {farmer.lastName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {farmer.firstName} {farmer.lastName}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  {farmer.address}
                </p>
                {farmer.bio && <p className="text-gray-700 dark:text-gray-300 mb-4">{farmer.bio}</p>}
                <div className="flex items-center justify-between mb-4">
                  {farmer.farmerDetails?.farmSize?.value ? (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Farm Size:</span> {farmer.farmerDetails.farmSize.value}{" "}
                      {farmer.farmerDetails.farmSize.unit}
                    </div>
                  ) : (
                    <div />
                  )}
                  {farmer.farmerDetails?.farmName && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Farm:</span> {farmer.farmerDetails.farmName}
                    </div>
                  )}
                </div>
                {farmer.farmerDetails?.specialization && (
                  <div className="flex space-x-2 mb-4">
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs capitalize">
                      {farmer.farmerDetails.specialization}
                    </span>
                  </div>
                )}
                <div className="flex space-x-3">
                  <Link
                    href={`/products?farmer=${farmer._id}`}
                    className="flex-1 text-center bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium transition"
                  >
                    View Products
                  </Link>
                  <a
                    href={`tel:${farmer.phone}`}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    aria-label={`Call ${farmer.firstName}`}
                  >
                    <i className="fas fa-phone"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Join as Farmer CTA */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Want to Join Our Farmer Community?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Share your fresh produce with thousands of customers and grow your business
          </p>
          <Link
            href="?auth=register"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Join as Farmer
          </Link>
        </div>
      </div>
    </>
  );
}
