"use client";
import { useState } from "react";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import API from "@/app/service/api";
import auth from "@/app/endpoint/auth";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";


interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await API.post(auth.login, data);
      toast.success("Login successful!");
      reset();
      router.push("/admin");
      // Do something like save token or redirect
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-pink-600 p-4">
      <Toaster />
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Image */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-purple-800 to-pink-700 text-white p-10">
          <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
          <p className="text-xl font-semibold">Login to your account</p>
          <img
            src="https://images.unsplash.com/photo-1660675587581-658b751954cd?q=80&w=2070&auto=format&fit=crop"
            alt="Login"
            className="mt-6 w-full rounded-xl shadow-2xl"
          />
        </div>

        {/* Right Form */}
        <div className="p-10">
          <h2 className="text-3xl font-semibold text-pink-600 mb-6">Login</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-pink-600 hover:bg-pink-500 text-white py-3 rounded-md font-semibold transition"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            <p className="text-sm text-center text-black mt-4">
              Don't have an account?{" "}
              <Link href="/register" className="text-pink-600 font-medium">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
