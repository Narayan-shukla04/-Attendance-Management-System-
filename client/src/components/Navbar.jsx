import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink } from "react-router";
import { Avatar } from "./Badges";
import { 
  LogOut, 
  Menu, 
  X, 
  Clock, 
  Users, 
  FileCheck2, 
  CalendarCheck, 
  BarChart3, 
  LayoutDashboard, 
  Camera 
} from "lucide-react";
import { logoutUser } from "../feature/AuthSlice";

const NAV = {
  employee: [
    { to: "/employee", label: "Dashboard", icon: LayoutDashboard },
    { to: "/employee/punch", label: "Punch In/Out", icon: Camera },
  ],
  manager: [
    { to: "/manager", label: "Dashboard", icon: LayoutDashboard },
    { to: "/manager/team", label: "Team Attendance", icon: Users },
    { to: "/manager/ot", label: "OT Requests", icon: Clock },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/attendance", label: "All Attendance", icon: CalendarCheck },
    { to: "/admin/report", label: "Reports", icon: BarChart3 },
  ],
};

const ROLE_COLORS = {
  admin: "bg-purple-100 text-purple-700 border-purple-200",
  manager: "bg-blue-100 text-blue-700 border-blue-200",
  employee: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function Navbar() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = async () => {
    await dispatch(logoutUser());
    navigate("/");
  };

  const links = (user?.role && NAV[user.role]) ? NAV[user.role] : [];
  const isBaseRoute = (path) => path === "/employee" || path === "/manager" || path === "/admin";

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div 
              onClick={() => navigate(user?.role ? `/${user.role}` : "/")}
              className="flex items-center gap-2 cursor-pointer font-bold text-xl tracking-tight text-white hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold shadow-sm shadow-blue-500/50">
                AT
              </div>
              <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent font-black">
                AttendTrack
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-1.5">
              {links.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={isBaseRoute(item.to)}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-slate-800 text-blue-400 font-semibold shadow-inner border border-slate-700/60"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                      }`
                    }
                  >
                    {Icon && <Icon className="w-4 h-4 opacity-80" />}
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
              <Avatar src={user?.profile} name={user?.name} size="sm" />
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold text-slate-100 max-w-[130px] truncate leading-tight">
                  {user?.name || "Anonymous"}
                </span>
                <span className="text-[11px] font-medium capitalize text-slate-400">
                  {user?.role || "User"}
                </span>
              </div>
              <span
                className={`ml-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  ROLE_COLORS[user?.role] || "bg-slate-800 text-slate-300 border-slate-700"
                }`}
              >
                {user?.role}
              </span>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-300 hover:text-white bg-red-500/10 hover:bg-red-600 rounded-lg border border-red-500/20 transition-all cursor-pointer shadow-sm"
              title="Sign out of account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur px-4 pt-3 pb-4 space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-slate-800 mb-2">
            <div className="flex items-center gap-2.5">
              <Avatar src={user?.profile} name={user?.name} size="sm" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-200">{user?.name}</span>
                <span className="text-xs text-slate-400 capitalize">{user?.role}</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/20 rounded border border-red-500/30"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>

          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={isBaseRoute(item.to)}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-slate-800 text-blue-400 font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`
                }
              >
                {Icon && <Icon className="w-4 h-4 opacity-80" />}
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
}
