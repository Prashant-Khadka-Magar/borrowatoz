"use client";

import { useVerifyOtpMutation } from "@/state/authApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function VerifyOtpPage() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();

  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await verifyOtp({
        email,
        otp,
      }).unwrap();

      router.push("/login");
    } catch (err) {
      setError(err?.data?.message || "Verification failed");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-6">Verify OTP</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            disabled
            className="w-full border rounded-lg px-4 py-3 text-gray-500"
            required
          />

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white rounded-lg px-4 py-3"
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </main>
  );
}
