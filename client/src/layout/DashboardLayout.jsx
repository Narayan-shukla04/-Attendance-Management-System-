import { Outlet } from "react-router";
import Navbar from "../components/Navbar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
