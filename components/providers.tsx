"use client";

import { AuthProvider } from "@/lib/auth-context";
import { AuthModal } from "@/components/auth-modal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <AuthModal />
    </AuthProvider>
  );
}
