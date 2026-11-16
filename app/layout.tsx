import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TapTap Design System",
  description: "React components of the TapTap design system",
};

// Root layout: base font (--font-sans token) and full-height body
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full font-sans antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
