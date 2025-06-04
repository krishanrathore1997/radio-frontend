"use client";
import { useState } from "react";
import Link from "next/link";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import API from "@/app/service/api";
import auth from "@/app/endpoint/auth";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface FormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  confirmpassword: string;
  agree: boolean;
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    console.log(data);
    try {
      const response = await API.post(auth.register, data);
      toast.success("Registration successful!");
      reset();
      router.push("/login");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error registering user."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-pink-600 p-4">
      <Toaster />
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Image Section */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-purple-800 to-pink-700 text-white p-10">
          <h2 className="text-3xl font-bold mb-2">Listen to the top music</h2>
          <p className="text-xl font-semibold">FOR FREE</p>
          <img
            src="https://images.unsplash.com/photo-1660675587581-658b751954cd?q=80&w=2070&auto=format&fit=crop"
            alt="Girl with headphones"
            className="mt-6 w-full rounded-xl shadow-2xl"
          />
        </div>

        {/* Right Form Section */}
        <div className="p-10">
          <h2 className="text-3xl font-semibold text-pink-600 mb-6">Sign Up</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <input
                type="text"
                placeholder="Full Name"
                {...register("name", { required: "Name is required" })}
                className="w-full px-4 py-3 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                placeholder="Email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email format",
                  },
                })}
                className="w-full px-4 py-3 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className="w-full px-4 py-3 pr-12 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeIcon className="h-5 w-5" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5" />
                )}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                {...register("password_confirmation", {
                  required: "Confirm Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className="w-full px-4 py-3 pr-12 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeIcon className="h-5 w-5" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5" />
                )}
              </button>
              {errors.confirmpassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmpassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-pink-600 hover:bg-pink-500 text-white py-3 rounded-md font-semibold transition"
            >
              {isSubmitting ? "Submitting..." : "Sign Up"}
            </button>

            <p className="text-sm text-center text-black mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-pink-600 font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
