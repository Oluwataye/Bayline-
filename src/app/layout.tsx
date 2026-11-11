import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { WarehouseProvider } from "@/context/WarehouseContext";
import { APP_CONFIG } from "@/config/app.config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} | Modern Multi-Facility WMS`,
  description: APP_CONFIG.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#F4F5F7] text-[#111111] antialiased">
        <WarehouseProvider>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
              <TopBar />
              <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto">
                {children}
              </main>
            </div>
          </div>
        </WarehouseProvider>
      </body>
    </html>
  );
}

