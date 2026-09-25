import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useSelector((s) => s.auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
};

export default ProtectedRoute;