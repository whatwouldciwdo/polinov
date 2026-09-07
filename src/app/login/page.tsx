"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      const res = await fetch("/api/auth/session");
      const session = await res.json();

      if (session?.user?.role === "admin") {
        router.push("/dashboard/users");
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <>
      {error && <Toast type="error" message={error} />}
      <div className="bg-[#1e2029] min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 font-cabin">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Hero Card - Neumorphic Panel */}
          <div className="relative h-[480px] lg:h-[580px] neu-panel p-8 flex flex-col items-center justify-center overflow-hidden border border-white/5">
            {/* Ambient Purple Glow */}
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-900/30 rounded-full blur-3xl pointer-events-none"></div>

            {/* Background Texture */}
            <img
              src="/image/noise-texture.png"
              alt="Texture"
              className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay pointer-events-none"
            />

            {/* Star & UFO floating */}
            <img
              src="/image/star.png"
              alt="Star"
              className="absolute left-6 top-10 w-24 sm:w-28 animate-pulse"
            />
            <img
              src="/image/ufo.png"
              alt="UFO"
              className="absolute right-6 top-1/4 w-36 sm:w-44 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
            />

            {/* Text Inset Plate */}
            <div className="neu-inset px-6 py-5 z-10 text-center max-w-sm border border-white/5 backdrop-blur-sm">
              <span className="inline-block px-3 py-1 mb-2 text-xs font-semibold text-purple-400 neu-pill-inset uppercase tracking-wider">
                Innovation Platform
              </span>
              <h1 className="text-white text-2xl sm:text-3xl font-bold font-cabin leading-tight">
                Web Penilaian Inovasi
                <span className="block text-purple-400">UBP CLG 2026</span>
              </h1>
            </div>
          </div>

          {/* Right Login Form - Neumorphic Card */}
          <div className="neu-panel p-8 sm:p-12 flex flex-col justify-center items-center border border-white/5 relative">
            {/* Logo */}
            <div className="neu-pill p-3 mb-4 flex items-center justify-center">
              <img src="/image/logo.png" alt="Logo" className="h-10 object-contain" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white text-center font-buenard">
              Login to Continue
            </h2>
            <p className="text-gray-400 text-sm font-buenard text-center mt-1">
              Login With Corporate Email
            </p>

            {/* Divider */}
            <div className="w-full flex items-center my-6">
              <div className="flex-grow h-[1px] bg-gradient-to-r from-transparent via-[#14151b] to-transparent"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
              <div>
                <label
                  className="block text-gray-300 text-sm font-semibold mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <div className="neu-inset px-4 py-1 flex items-center">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="eg. admin@polinov.com"
                    className="w-full py-2.5 bg-transparent border-none focus:outline-none text-white text-sm placeholder-gray-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-gray-300 text-sm font-semibold mb-2"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="neu-inset px-4 py-1 flex items-center justify-between">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    placeholder="Enter your password"
                    className="w-full py-2.5 bg-transparent border-none focus:outline-none text-white text-sm placeholder-gray-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="neu-btn w-8 h-8 p-1 ml-2 text-gray-400 hover:text-white flex-shrink-0"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
                        <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
                        <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full neu-btn-primary py-3.5 text-base mt-2 disabled:opacity-50 tracking-wide"
              >
                {loading ? "Menghubungkan..." : "Login"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </>
  );
}
