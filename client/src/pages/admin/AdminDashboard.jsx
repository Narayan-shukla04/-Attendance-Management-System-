import { useEffect, useState, useMemo } from "react";
import { useUsersList, useDeleteUser } from "../../hooks/useUsers";
import { useAllAttendance } from "../../hooks/useAttendance";
import StatCard from "../../components/StatCard";
import ValidateAction from "../../components/ValidateAction";
import { RoleBadge, StatusBadge, ValidBadge, fmtTime, Avatar, SelfieThumbnails } from "../../components/Badges";
import { 
  Users, 
  CalendarCheck, 
  BarChart3, 
  Trash2, 
  Search, 
  Calendar, 
  ShieldCheck, 
  ExternalLink,
  CheckCircle2,
  XCircle,
  Filter
} from "lucide-react";

const localToday = () => new Date().toLocaleDateString("en-CA");

export default function AdminDashboard({ view }) {
  const [date, setDate] = useState(localToday());
  const [activeTab, setActiveTab] = useState(view || "overview");
  const [userSearch, setUserSearch] = useState("");
  const [recordSearch, setRecordSearch] = useState("");

  useEffect(() => {
    if (view) setActiveTab(view);
  }, [view]);

  const { data: users = [], isLoading: usersLoading } = useUsersList();
  const isReport = activeTab === "report";
  const { data: records = [], isLoading: recordsLoading, refetch: loadReport } = useAllAttendance(isReport ? date : null);

  const loading = usersLoading || recordsLoading;
  const deleteMutation = useDeleteUser();

  const deleteUser = (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    deleteMutation.mutate(id);
  };

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    const term = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.role?.toLowerCase().includes(term)
    );
  }, [users, userSearch]);

  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => r.employeeId)
      .filter((r) => {
        if (!recordSearch) return true;
        const term = recordSearch.toLowerCase();
        return (
          r.employeeId?.name?.toLowerCase().includes(term) ||
          r.employeeId?.email?.toLowerCase().includes(term) ||
          r.date?.includes(term)
        );
      });
  }, [records, recordSearch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Admin Control Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage system users, oversee all attendance logs, and generate reports.
          </p>
        </div>

        <div className="inline-flex bg-slate-200/80 p-1 rounded-xl shadow-inner text-sm font-medium">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "overview"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "users"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>Users</span>
            <span className="text-xs text-slate-400">({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "attendance"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
            <span>Attendance</span>
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "report"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Reports</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={users.length} icon={Users} color="slate" />
        <StatCard label="Employees" value={users.filter((u) => u.role === "employee").length} icon={Users} color="emerald" />
        <StatCard label="Managers" value={users.filter((u) => u.role === "manager").length} icon={Users} color="blue" />
        <StatCard label="Attendance Records" value={records.length} icon={CalendarCheck} color="purple" />
      </div>

      {(activeTab === "overview" || activeTab === "users") && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-base">User Directory</h2>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search user by name, email, or role..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Assigned Manager</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 flex items-center gap-3">
                      <Avatar
                        src={u.profile}
                        name={u.name}
                        size="sm"
                      />
                      <div>
                        <span className="font-semibold text-slate-800 block">{u.name}</span>
                        <span className="text-xs text-slate-400">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">
                      {u.managerId?.name ? (
                        <span className="font-medium text-slate-700">{u.managerId.name}</span>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => deleteUser(u._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(activeTab === "overview" || activeTab === "attendance" || activeTab === "report") && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-base">
                {activeTab === "report" ? "Date-based Attendance Report" : "All Attendance Records"}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {activeTab === "report" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={loadReport}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    Filter Report
                  </button>
                </div>
              )}

              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={recordSearch}
                  onChange={(e) => setRecordSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Punch In / Out</th>
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Validation</th>
                  <th className="px-6 py-3">Selfies</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400 text-xs">
                      No attendance records found.
                    </td>
                  </tr>
                )}
                {filteredRecords.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="font-semibold text-slate-800 block text-sm">
                        {r.employeeId?.name || "Unknown"}
                      </span>
                      <span className="text-xs text-slate-400">{r.employeeId?.email}</span>
                    </td>
                    <td className="px-6 py-3.5 text-xs font-medium text-slate-700 whitespace-nowrap">
                      {r.date}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                      <span className="text-emerald-700 font-semibold">{fmtTime(r.punchIn)}</span>
                      <span className="mx-1 text-slate-300">→</span>
                      <span className="text-slate-600">{r.punchOut ? fmtTime(r.punchOut) : "—"}</span>
                    </td>
                    <td className="px-6 py-3.5 text-xs font-semibold text-slate-700 whitespace-nowrap">
                      {r.totalHours ? `${r.totalHours.toFixed(1)} hrs` : "—"}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-6 py-3.5">
                      <ValidBadge status={r.validationStatus} />
                    </td>
                    <td className="px-6 py-3.5">
                      <SelfieThumbnails punchInPhoto={r.punchInPhoto} punchOutPhoto={r.punchOutPhoto} />
                    </td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <ValidateAction record={r} invalidateKey="all-attendance" title="Admin Validation" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

