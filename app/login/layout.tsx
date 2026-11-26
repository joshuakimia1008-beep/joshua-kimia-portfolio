import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in · Private workspace",
  description: "Authorized access only.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
