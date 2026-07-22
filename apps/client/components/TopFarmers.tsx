"use client";

import Link from "next/link";
import { useGetAllFarmersQuery } from "@/lib/api/endpoints/users";
import { useGetFarmerProductsQuery } from "@/lib/api/endpoints/products";
import { FarmerGridSkeleton } from "@/components/Skeleton";

interface Farmer {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  address: string;
  farmerDetails?: {
    farmName: string;
    specialization: string;
  };
}

function FarmerCard({ farmer }: { farmer: Farmer }) {
  const { data: productsData } = useGetFarmerProductsQuery(farmer._id);
  const productCount = productsData?.count ?? 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      {farmer.profilePicture ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={farmer.profilePicture} alt={farmer.firstName} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
          <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
            {farmer.firstName.charAt(0)}
            {farmer.lastName.charAt(0)}
          </span>
        </div>
      )}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {farmer.farmerDetails?.farmName || `${farmer.firstName} ${farmer.lastName}`}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          <i className="fas fa-map-marker-alt mr-2"></i>
          {farmer.address}
        </p>
        <div className="flex items-center justify-between mb-4">
          {farmer.farmerDetails?.specialization ? (
            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs capitalize">
              {farmer.farmerDetails.specialization}
            </span>
          ) : (
            <span />
          )}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {productCount} product{productCount === 1 ? "" : "s"}
          </span>
        </div>
        <Link
          href={`/products?farmer=${farmer._id}`}
          className="block text-center bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium transition"
        >
          View Products
        </Link>
      </div>
    </div>
  );
}

export default function TopFarmers() {
  const { data, isLoading, isError } = useGetAllFarmersQuery(undefined);
  const farmers: Farmer[] = (data?.data ?? []).slice(0, 4);

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Top Farmers</h2>
            <p className="text-gray-600 dark:text-gray-400">The passionate people behind your fresh produce</p>
          </div>
          <Link
            href="/farmers"
            className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300"
          >
            View All Farmers <i className="fas fa-arrow-right ml-1"></i>
          </Link>
        </div>

        {isLoading && <FarmerGridSkeleton count={4} />}

        {isError && <p className="text-center text-red-500 py-12">Couldn&apos;t load farmers. Please try again later.</p>}

        {!isLoading && !isError && farmers.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">No farmers registered yet.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {farmers.map((farmer) => (
            <FarmerCard key={farmer._id} farmer={farmer} />
          ))}
        </div>
      </div>
    </section>
  );
}
