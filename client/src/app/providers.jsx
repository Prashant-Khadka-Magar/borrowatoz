"use client";

import AuthLoader from "@/components/AuthLoader";
import { StoreProvider } from "@/state/redux";

export default function Providers({ children }) {
  return (
    <StoreProvider>
      <AuthLoader>{children}</AuthLoader>
    </StoreProvider>
  );
}
