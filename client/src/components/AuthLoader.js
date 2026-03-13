"use client";

import { useMeQuery } from "@/state/authApi";

export default function AuthLoader({ children }) {
  const { isLoading } = useMeQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return children;
}
