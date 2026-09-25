export default function StatCard({ label, value, icon: Icon, color = "blue" }) {
  const colorStyles = {
    blue: { text: "text-slate-500", val: "text-slate-900", iconBg: "bg-blue-50 text-blue-600" },
    emerald: { text: "text-emerald-600", val: "text-emerald-700", iconBg: "bg-emerald-50 text-emerald-600" },
    amber: { text: "text-amber-600", val: "text-amber-700", iconBg: "bg-amber-50 text-amber-600" },
    purple: { text: "text-purple-600", val: "text-purple-600", iconBg: "bg-purple-50 text-purple-600" },
    slate: { text: "text-slate-400", val: "text-slate-900", iconBg: "bg-slate-50 text-slate-600" },
  }[color] || { text: "text-slate-500", val: "text-slate-900", iconBg: "bg-slate-50 text-slate-600" };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wider ${colorStyles.text}`}>
          {label}
        </p>
        <p className={`text-2xl font-bold mt-1 ${colorStyles.val}`}>{value}</p>
      </div>
      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${colorStyles.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}
