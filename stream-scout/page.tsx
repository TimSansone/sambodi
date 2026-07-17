import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Stream Scout",
  description: "Discover popular shows and track new episodes."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="appShell">
          <Header />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
