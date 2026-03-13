"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/state/redux";

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const isServices = pathname.startsWith("/services");
  const isTools = pathname.startsWith("/tools");

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          BorrowAtoZ
        </Link>

        {/* Center Navigation */}
        <div className="flex gap-6 text-sm font-medium">
          <Link
            href="/services"
            className={`pb-1 border-b-2 ${
              isServices ? "border-black" : "border-transparent"
            }`}
          >
            Services
          </Link>

          <Link
            href="/tools"
            className={`pb-1 border-b-2 ${
              isTools ? "border-black" : "border-transparent"
            }`}
          >
            Tools
          </Link>
        </div>

        {/* Right Side */}
        <div>
          {isAuthenticated ? (
            <Link
              href="/profile"
              className="border px-4 py-2 rounded-lg text-sm"
            >
              {user?.firstName || "Profile"}
            </Link>
          ) : (
            <Link
              href="/login"
              className="border px-4 py-2 rounded-lg text-sm"
            >
              Login
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}