"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AuthProvider from "./authProvider";
import StoreProvider, { useAppSelector } from "./redux";
import ToastProvider from "@/components/ToastProvider";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // Check demo session state if Cognito is not configured
  useEffect(() => {
    const hasCognitoConfig =
      Boolean(process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID) &&
      Boolean(process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID);
    
    if (!hasCognitoConfig) {
      const session = sessionStorage.getItem("planpilot_demo_session");
      if (!session) {
        router.replace("/");
      }
    }
  }, [router]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  });

  return (
    <div className="flex min-h-screen w-full bg-gray-50 text-gray-900">
      <Sidebar />
      <main
        className={`flex w-full flex-col bg-gray-50 dark:bg-dark-bg ${
          isSidebarCollapsed ? "" : "md:pl-64"
        }`}
      >
        <Navbar />
        {children}
      </main>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <ToastProvider>
        <AuthProvider>
          <DashboardLayout>{children}</DashboardLayout>
        </AuthProvider>
      </ToastProvider>
    </StoreProvider>
  );
};

export default DashboardWrapper;
