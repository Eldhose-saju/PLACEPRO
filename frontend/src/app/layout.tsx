// =============================================================================
// Root Layout — Sidebar + TopBar shell for authenticated pages
// =============================================================================

import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import PortalShell from "@/components/PortalShell";

export const metadata: Metadata = {
  title: "Placement Portal — Institutional Suite",
  description: "A comprehensive college placement management system. Track students, companies, jobs, and applications.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <PortalShell>{children}</PortalShell>
        </AuthProvider>
      </body>
    </html>
  );
}
