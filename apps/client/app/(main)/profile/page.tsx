"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAppSelector } from "@/lib/hooks";
import { selectCurrentUser, selectIsAuthenticated } from "@/lib/api/endpoints/userSlice";
import { useUpdateUserMutation } from "@/lib/api/endpoints/users";

const SPECIALIZATIONS = ["vegetables", "fruits", "grains", "dairy", "mixed"];
const FARM_SIZE_UNITS = ["acres", "hectares", "sq_ft", "sq_m"];

export default function Profile() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/?auth=login");
  }, [isAuthenticated, router]);

  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [farmName, setFarmName] = useState(user?.farmerDetails?.farmName ?? "");
  const [specialization, setSpecialization] = useState(user?.farmerDetails?.specialization ?? "");
  const [farmSizeValue, setFarmSizeValue] = useState(String(user?.farmerDetails?.farmSize?.value ?? ""));
  const [farmSizeUnit, setFarmSizeUnit] = useState(user?.farmerDetails?.farmSize?.unit ?? "acres");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!user) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-24">Loading profile...</p>;
  }

  const startEditing = () => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone);
    setAddress(user.address);
    setBio(user.bio ?? "");
    setFarmName(user.farmerDetails?.farmName ?? "");
    setSpecialization(user.farmerDetails?.specialization ?? "");
    setFarmSizeValue(String(user.farmerDetails?.farmSize?.value ?? ""));
    setFarmSizeUnit(user.farmerDetails?.farmSize?.unit ?? "acres");
    setProfileFile(null);
    setPreviewUrl(null);
    setIsEditing(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("phone", phone);
    formData.append("address", address);
    formData.append("bio", bio);
    if (profileFile) formData.append("profilePicture", profileFile);

    if (user.userType === "farmer") {
      formData.append("farmerDetails.farmName", farmName);
      formData.append("farmerDetails.specialization", specialization);
      formData.append("farmerDetails.farmSize.value", farmSizeValue || "0");
      formData.append("farmerDetails.farmSize.unit", farmSizeUnit);
    }

    try {
      await updateUser({ id: user._id, formData }).unwrap();
      toast.success("Profile updated");
      setIsEditing(false);
    } catch {
      setError("Failed to update profile. Please try again.");
      toast.error("Couldn't update profile.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Profile</h1>

      {!isEditing ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="flex items-center space-x-4 mb-6">
            {user.profilePicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.profilePicture} alt={user.firstName} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-500 text-white flex items-center justify-center text-2xl font-semibold">
                {user.firstName.charAt(0)}
                {user.lastName.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h2>
              <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 capitalize">
                {user.userType}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
              <span className="text-gray-500 dark:text-gray-400">Email</span>
              <span className="text-gray-900 dark:text-white">{user.email}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
              <span className="text-gray-500 dark:text-gray-400">Phone</span>
              <span className="text-gray-900 dark:text-white">{user.phone}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
              <span className="text-gray-500 dark:text-gray-400">Address</span>
              <span className="text-gray-900 dark:text-white text-right max-w-xs">{user.address}</span>
            </div>
            {user.bio && (
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                <span className="text-gray-500 dark:text-gray-400">Bio</span>
                <span className="text-gray-900 dark:text-white text-right max-w-xs">{user.bio}</span>
              </div>
            )}

            {user.userType === "farmer" && user.farmerDetails && (
              <>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500 dark:text-gray-400">Farm Name</span>
                  <span className="text-gray-900 dark:text-white">{user.farmerDetails.farmName}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500 dark:text-gray-400">Specialization</span>
                  <span className="text-gray-900 dark:text-white capitalize">{user.farmerDetails.specialization}</span>
                </div>
                {user.farmerDetails.farmSize?.value ? (
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                    <span className="text-gray-500 dark:text-gray-400">Farm Size</span>
                    <span className="text-gray-900 dark:text-white">
                      {user.farmerDetails.farmSize.value} {user.farmerDetails.farmSize.unit}
                    </span>
                  </div>
                ) : null}
              </>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={startEditing}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium transition"
            >
              <i className="fas fa-edit mr-2"></i>
              Edit Profile
            </button>
            <Link
              href="/change-password"
              className="flex-1 text-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-2 rounded-lg font-medium transition"
            >
              <i className="fas fa-lock mr-2"></i>
              Change Password
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg p-4 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center space-x-4">
            {previewUrl || user.profilePicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl || user.profilePicture} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary-500 text-white flex items-center justify-center text-xl font-semibold">
                {firstName.charAt(0)}
                {lastName.charAt(0)}
              </div>
            )}
            <label className="cursor-pointer text-sm text-primary-600 dark:text-primary-400 hover:underline">
              Change photo
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <textarea
              rows={2}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
            <textarea
              rows={3}
              maxLength={250}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>

          {user.userType === "farmer" && (
            <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Farm Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Farm Name</label>
                  <input
                    type="text"
                    required
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialization</label>
                  <select
                    required
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white capitalize"
                  >
                    {SPECIALIZATIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Farm Size</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={farmSizeValue}
                      onChange={(e) => setFarmSizeValue(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                    <select
                      value={farmSizeUnit}
                      onChange={(e) => setFarmSizeUnit(e.target.value)}
                      className="w-28 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-sm"
                    >
                      {FARM_SIZE_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
