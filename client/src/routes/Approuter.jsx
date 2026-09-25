import { Route, Routes, Navigate, Outlet } from "react-router";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../layout/DashboardLayout";

import EmployeeDashboard from "../pages/employee/EmployeeDashboard";
import PunchPage from "../pages/employee/PunchPage";

import ManagerDashboard from "../pages/manager/ManagerDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";

const Approuter = () => (
  <Routes>
    <Route path="/" element={<Outlet />}>
      <Route index element={<Login />} />
      <Route path="register" element={<Register />} />
    </Route>

    <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
      <Route path="/employee" element={<DashboardLayout />}>
        <Route index element={<EmployeeDashboard />} />
        <Route path="punch" element={<PunchPage />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
      <Route path="/manager" element={<DashboardLayout />}>
        <Route index element={<ManagerDashboard />} />
        <Route path="team" element={<ManagerDashboard view="team" />} />
        <Route path="ot" element={<ManagerDashboard view="ot" />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
      <Route path="/admin" element={<DashboardLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminDashboard view="users" />} />
        <Route path="attendance" element={<AdminDashboard view="attendance" />} />
        <Route path="report" element={<AdminDashboard view="report" />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default Approuter;
