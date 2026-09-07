import AdminSidebar from "@/components/AdminSidebar";

export default function AdminCandidatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#1e2029] text-gray-100 lg:flex-row font-cabin">
      <AdminSidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">{children}</div>
    </div>
  );
}
