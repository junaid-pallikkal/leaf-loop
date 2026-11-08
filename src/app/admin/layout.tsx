import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7FAF7] flex flex-col md:flex-row pb-16 md:pb-0">
      {/* Left Persistent Admin Sidebar */}
      <AdminSidebar />

      {/* Main Admin Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <AdminHeader />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
