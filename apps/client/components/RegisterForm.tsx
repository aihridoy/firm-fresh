"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRegisterUserMutation } from "@/lib/api/endpoints/users";

export default function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [registerUser, { isLoading, error }] = useRegisterUserMutation();

  const [formData, setFormData] = useState({
    userType: "farmer",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    password: "",
    confirmPassword: "",
    farmName: "",
    specialization: "",
    farmSize: "",
    farmSizeUnit: "acres",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePreview, setProfilePreview] = useState(
    "data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100' height='100' fill='%23e5e7eb'/%3e%3ctext x='50%25' y='50%25' font-size='18' text-anchor='middle' alignment-baseline='middle' fill='%236b7280'%3ePhoto%3c/text%3e%3c/svg%3e"
  );
  const [validationError, setValidationError] = useState("");

  const bioLength = formData.bio.length;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "bio" && value.length > 250) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserTypeChange = (type: "customer" | "farmer") => {
    setFormData((prev) => ({ ...prev, userType: type }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setValidationError("Image size must be less than 2MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePreview(reader.result as string);
      reader.readAsDataURL(file);
      setValidationError("");
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setValidationError("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      setValidationError("Last name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setValidationError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setValidationError("Email is invalid");
      return false;
    }
    if (!formData.phone.trim()) {
      setValidationError("Phone number is required");
      return false;
    }
    if (!formData.address.trim()) {
      setValidationError("Address is required");
      return false;
    }
    if (!formData.password) {
      setValidationError("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return false;
    }
    if (formData.userType === "farmer") {
      if (!formData.farmName.trim()) {
        setValidationError("Farm name is required for farmers");
        return false;
      }
      if (!formData.specialization) {
        setValidationError("Specialization is required for farmers");
        return false;
      }
    }
    setValidationError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("userType", formData.userType);
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("bio", formData.bio);
      formDataToSend.append("password", formData.password);

      if (selectedFile) formDataToSend.append("profilePicture", selectedFile);

      if (formData.userType === "farmer") {
        formDataToSend.append("farmName", formData.farmName);
        formDataToSend.append("specialization", formData.specialization);
        formDataToSend.append("farmSize", formData.farmSize || "0");
        formDataToSend.append("farmSizeUnit", formData.farmSizeUnit);
      }

      await registerUser(formDataToSend).unwrap();
      toast.success("Account created!");
      onSuccess();
    } catch (err: unknown) {
      console.error("Registration failed:", err);
      const errorMessage =
        (err as { data?: { error?: string; message?: string } })?.data?.error ||
        (err as { data?: { error?: string; message?: string } })?.data?.message ||
        "Registration failed. Please try again.";
      setValidationError(errorMessage);
    }
  };

  return (
    <>
      {(validationError || error) && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            {validationError || (error as { data?: { error?: string } })?.data?.error || "An error occurred"}
          </p>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Account Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            I want to register as:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="relative group">
              <input
                type="radio"
                name="userType"
                value="customer"
                checked={formData.userType === "customer"}
                onChange={() => handleUserTypeChange("customer")}
                className="sr-only peer"
              />
              <div className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900 hover:border-primary-300 dark:hover:border-primary-400 transition-all duration-200">
                <div className="text-center">
                  <i className="fas fa-user text-2xl mb-3 text-gray-600 dark:text-gray-400 peer-checked:text-primary-600 group-hover:text-primary-500 transition-colors"></i>
                  <div className="font-semibold text-gray-900 dark:text-white">Customer</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Buy fresh produce</div>
                </div>
              </div>
            </label>

            <label className="relative group">
              <input
                type="radio"
                name="userType"
                value="farmer"
                checked={formData.userType === "farmer"}
                onChange={() => handleUserTypeChange("farmer")}
                className="sr-only peer"
              />
              <div className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900 hover:border-primary-300 dark:hover:border-primary-400 transition-all duration-200">
                <div className="text-center">
                  <i className="fas fa-tractor text-2xl mb-3 text-gray-600 dark:text-gray-400 peer-checked:text-primary-600 group-hover:text-primary-500 transition-colors"></i>
                  <div className="font-semibold text-gray-900 dark:text-white">Farmer</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sell your produce</div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Profile Picture Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Profile Picture</label>
          <div className="flex items-center justify-center space-x-6">
            <div className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="h-20 w-20 object-cover rounded-full border-2 border-gray-300 dark:border-gray-600"
                src={profilePreview}
                alt="Profile preview"
              />
            </div>
            <div className="flex-1 max-w-xs">
              <label
                htmlFor="profilePicture"
                className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 transition block text-center"
              >
                <span className="flex items-center justify-center">
                  <i className="fas fa-camera mr-2"></i>
                  Choose photo
                </span>
                <input
                  id="profilePicture"
                  name="profilePicture"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
              </label>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center">PNG, JPG, GIF up to 2MB</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="John"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder="Enter your full address"
              ></textarea>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} text-gray-400 hover:text-gray-600`}></i>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Doe"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="+880 1234 567890"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio<span className="text-gray-400 text-xs font-normal"> (Optional)</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder="Tell us about yourself..."
              ></textarea>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Brief description</p>
                <span className="text-xs text-gray-400">{bioLength}/250</span>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <i
                    className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"} text-gray-400 hover:text-gray-600`}
                  ></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {formData.userType === "farmer" && (
          <div className="space-y-4 border-t border-gray-200 dark:border-gray-600 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Farm Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label htmlFor="farmName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Farm Name
                </label>
                <input
                  id="farmName"
                  name="farmName"
                  type="text"
                  required
                  value={formData.farmName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Green Valley Farm"
                />
              </div>

              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Specialization
                </label>
                <select
                  id="specialization"
                  name="specialization"
                  required
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select specialization</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="grains">Grains</option>
                  <option value="dairy">Dairy</option>
                  <option value="mixed">Mixed Farming</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="farmSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Farm Size
              </label>
              <div className="flex space-x-2">
                <input
                  id="farmSize"
                  name="farmSize"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.farmSize}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="5.5"
                />
                <select
                  id="farmSizeUnit"
                  name="farmSizeUnit"
                  value={formData.farmSizeUnit}
                  onChange={handleChange}
                  className="w-24 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                  <option value="sq_ft">Sq Ft</option>
                  <option value="sq_m">Sq M</option>
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter the total area of your farm</p>
            </div>
          </div>
        )}

        <div className="flex items-start">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            I agree to the{" "}
            <a href="#" className="text-primary-600 hover:text-primary-500">
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary-600 hover:text-primary-500">
              Privacy Policy
            </a>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Creating Account...
            </span>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="?auth=login" className="text-primary-600 hover:text-primary-500 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
