import { useEffect, useState, useMemo } from "react";
import { useTeamAttendance, useDecideOT } from "../../hooks/useAttendance";
import StatCard from "../../components/StatCard";
import ValidateAction from "../../components/ValidateAction";
import { StatusBadge, ValidBadge, fmtTime, Avatar, SelfieThumbnails } from "../../components/Badges";
import { 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  Calendar,
  MessageSquare
} from "lucide-react";

export default function ManagerDashboard({ view }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(view || "all"); 

  useEffect(() => {
    if (view) setActiveTab(view);
  }, [view]);

  const { data: records = [], isLoading: loading } = useTeamAttendance();
  const otMutation = useDecideOT();

  const decideOT = (id, decision) => {
    otMutation.mutate({ id, decision });
  };

  const otRecords = useMemo(
    () => records.filter((r) => r.otStatus === "pending"),
    [records]
  );

  const pendingValidations = useMemo(
    () => records.filter((r) => r.validationStatus === "pending"),
    [records]
  );

  const filteredTeamRecords = useMemo(() => {
    return records
      .filter((r) => r.employeeId)
      .filter((r) => {
        if (!searchTerm) return true;
        const name = r.employeeId?.name?.toLowerCase() || "";
        const email = r.employeeId?.email?.toLowerCase() || "";
        const term = searchTerm.toLowerCase();
        return name.includes(term) || email.includes(term);
      });
  }, [records, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Manager Portal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Oversee your team's attendance, validate records, and review overtime requests.
          </p>
        </div>

        <div className="inline-flex bg-slate-200/80 p-1 rounded-xl shadow-inner text-sm font-medium">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "all"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("ot")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "ot"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-4 h-4 text-purple-600" />
            <span>OT Requests</span>
            {otRecords.length > 0 && (
              <span className="bg-purple-600 text-white text-[11px] px-1.5 py-0.2 rounded-full font-bold">
                {otRecords.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "team"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>Team List</span>
            <span className="text-slate-400 text-xs">({records.length})</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Team Logs" value={records.length} icon={Users} color="blue" />
        <StatCard label="Pending OT Requests" value={otRecords.length} icon={Clock} color="purple" />
        <StatCard label="Pending Validations" value={pendingValidations.length} icon={AlertCircle} color="amber" />
      </div>

      {(activeTab === "all" || activeTab === "ot") && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <h2 className="font-bold text-slate-900 text-base">
                Pending OT Approvals ({otRecords.length})
              </h2>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {loading && <p className="text-slate-400 text-sm">Loading records...</p>}
            {!loading && otRecords.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2 opacity-80" />
                <p className="text-sm font-medium">All overtime requests are cleared.</p>
              </div>
            )}

            <div className="space-y-3">
              {otRecords.map((r) => (
                <div
                  key={r._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-purple-100 bg-purple-50/40 gap-4 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={r.employeeId?.profile}
                      name={r.employeeId?.name || "Employee"}
                      size="md"
                    />
                    <div>
                      <p className="font-semibold text-slate-900 leading-tight">
                        {r.employeeId?.name || "Employee"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {r.employeeId?.email || "No email"} · Date: <b className="text-slate-700">{r.date}</b>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <SelfieThumbnails punchInPhoto={r.punchInPhoto} punchOutPhoto={r.punchOutPhoto} />
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Worked</span>
                      <span className="font-bold text-slate-800">
                        {r.totalHours ? `${r.totalHours.toFixed(1)} hrs` : "—"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decideOT(r._id, "approved")}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => decideOT(r._id, "rejected")}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(activeTab === "all" || activeTab === "team") && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-base">Team Attendance Records</h2>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search member..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Member</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Punch In / Out</th>
                  <th className="px-6 py-3">Hours</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Validation</th>
                  <th className="px-6 py-3">Selfies</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400 text-xs">
                      Loading attendance data...
                    </td>
                  </tr>
                )}
                {!loading && filteredTeamRecords.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400 text-xs">
                      No records found.
                    </td>
                  </tr>
                )}
                {filteredTeamRecords.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 flex items-center gap-3">
                      <Avatar
                        src={r.employeeId?.profile}
                        name={r.employeeId?.name || "Member"}
                        size="sm"
                      />
                      <div>
                        <span className="font-semibold text-slate-800 block text-sm">
                          {r.employeeId?.name}
                        </span>
                        <span className="text-xs text-slate-400">{r.employeeId?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-700 font-medium whitespace-nowrap">
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
                      <ValidateAction record={r} invalidateKey="team-attendance" />
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

