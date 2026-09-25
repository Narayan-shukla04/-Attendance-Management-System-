import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useMyAttendance, useRequestOT } from "../../hooks/useAttendance";
import StatCard from "../../components/StatCard";
import { StatusBadge, ValidBadge, fmtTime, SelfieThumbnails } from "../../components/Badges";
import { 
  CalendarCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  ArrowUpRight 
} from "lucide-react";

const localToday = () => new Date().toLocaleDateString("en-CA");

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: records = [], isLoading: loading } = useMyAttendance();

  const today = localToday();
  const todayRec = records.find(
    (r) => r.date === today || (r.punchIn && new Date(r.punchIn).toLocaleDateString("en-CA") === today)
  );
  const totalDays = records.length;
  const completedDays = records.filter((r) => r.status === "completed").length;
  const incompleteDays = records.filter((r) => r.status === "incomplete").length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            Employee Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || "User"}
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            Track your daily work hours, punch in with live verification, and manage your attendance history.
          </p>
        </div>

        <button
          onClick={() => navigate("/employee/punch")}
          className="flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-5 py-3 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap self-start sm:self-center"
        >
          <Camera className="w-5 h-5 text-blue-600" />
          <span>Punch In / Out</span>
          <ArrowUpRight className="w-4 h-4 text-blue-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Logged Days" value={totalDays} icon={CalendarCheck} color="blue" />
        <StatCard label="Completed Days (≥8h)" value={completedDays} icon={CheckCircle2} color="emerald" />
        <StatCard label="Incomplete Days" value={incompleteDays} icon={AlertCircle} color="amber" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-900 text-base">Today's Activity — {today}</h2>
          </div>
          {todayRec ? (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Punched In Today
            </span>
          ) : (
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
              Not Punched In
            </span>
          )}
        </div>

        {!todayRec ? (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 gap-3">
            <p className="text-sm text-slate-500">
              You haven't recorded your punch for today yet. Use the camera to punch in.
            </p>
            <button
              onClick={() => navigate("/employee/punch")}
              className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Punch Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs text-slate-400 block">Punch In Time</span>
              <span className="text-sm font-bold text-slate-800">{fmtTime(todayRec.punchIn)}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Punch Out Time</span>
              <span className="text-sm font-bold text-slate-800">
                {todayRec.punchOut ? fmtTime(todayRec.punchOut) : "In Progress"}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Total Hours</span>
              <span className="text-sm font-bold text-slate-800">
                {todayRec.totalHours ? `${todayRec.totalHours.toFixed(1)} hrs` : "—"}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Selfie Photos</span>
              <div className="mt-1">
                <SelfieThumbnails
                  punchInPhoto={todayRec.punchInPhoto}
                  punchOutPhoto={todayRec.punchOutPhoto}
                />
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Validation</span>
              <span className="text-xs font-semibold capitalize text-slate-700">
                {todayRec.validationStatus || "pending"}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-slate-900 text-base">Attendance History</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total records: {records.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Punch In / Out</th>
                <th className="px-6 py-3">Hours</th>
                <th className="px-6 py-3">Photos</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Validation</th>
                <th className="px-6 py-3 text-right">Overtime (OT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-xs">
                    Loading your history...
                  </td>
                </tr>
              )}
              {!loading && records.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-xs">
                    No attendance logs recorded yet.
                  </td>
                </tr>
              )}
              {records.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-3.5 text-xs font-bold text-slate-800 whitespace-nowrap">
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
                    <SelfieThumbnails punchInPhoto={r.punchInPhoto} punchOutPhoto={r.punchOutPhoto} />
                  </td>
                  <td className="px-6 py-3.5">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-6 py-3.5">
                    <ValidBadge status={r.validationStatus} remarks={r.remarks} />
                  </td>
                  <td className="px-6 py-3.5 text-right whitespace-nowrap">
                    <OTHandler r={r} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OTHandler({ r }) {
  const otMutation = useRequestOT();

  if (r.otStatus && r.otStatus !== "none") {
    const styles = {
      pending: "bg-purple-50 text-purple-700 border-purple-200",
      approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
    }[r.otStatus] || "bg-slate-50 text-slate-700 border-slate-200";

    return (
      <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full border ${styles}`}>
        OT: {r.otStatus}
      </span>
    );
  }

  if (r.status === "completed") {
    return (
      <button
        disabled={otMutation.isPending}
        onClick={() => otMutation.mutate(r._id)}
        className="px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md transition-colors cursor-pointer disabled:opacity-50"
      >
        {otMutation.isPending ? "Requesting..." : "Request OT"}
      </button>
    );
  }

  return <span className="text-slate-300 text-xs">—</span>;
}

