import { useState } from "react";

export const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

export const StatusBadge = ({ status }) => {
  const styles = {
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    incomplete: "bg-amber-50 text-amber-700 border-amber-200",
    present: "bg-blue-50 text-blue-700 border-blue-200",
  }[status] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span className={`text-[11px] font-bold capitalize px-2 py-0.5 rounded-full border ${styles}`}>
      {status || "—"}
    </span>
  );
};

export const ValidBadge = ({ status, remarks }) => {
  const styles = {
    valid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    invalid: "bg-red-50 text-red-700 border-red-200",
    pending: "bg-slate-100 text-slate-600 border-slate-200",
  }[status] || "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <span
      title={remarks ? `Remarks: ${remarks}` : undefined}
      className={`text-[11px] font-bold capitalize px-2 py-0.5 rounded-full border ${styles} cursor-default`}
    >
      {status || "pending"}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const styles = {
    admin: "bg-purple-50 text-purple-700 border-purple-200",
    manager: "bg-blue-50 text-blue-700 border-blue-200",
    employee: "bg-emerald-50 text-emerald-700 border-emerald-200",
  }[role] || "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <span className={`text-[11px] font-bold capitalize px-2 py-0.5 rounded-full border ${styles}`}>
      {role}
    </span>
  );
};

export const Avatar = ({ src, name = "User", size = "md" }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  }[size] || "w-10 h-10 text-sm";

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses} rounded-full object-cover ring-2 ring-slate-200`}
      />
    );
  }

  const initial = (name || "U").trim().charAt(0).toUpperCase();
  return (
    <div
      className={`${sizeClasses} rounded-full bg-slate-700 text-white font-bold flex items-center justify-center ring-2 ring-slate-200 select-none flex-shrink-0`}
    >
      {initial}
    </div>
  );
};

export const SelfieThumbnails = ({ punchInPhoto, punchOutPhoto }) => {
  const [modalImg, setModalImg] = useState(null);

  if (!punchInPhoto && !punchOutPhoto) {
    return <span className="text-slate-300 text-xs">—</span>;
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        {punchInPhoto && (
          <button
            type="button"
            onClick={() => setModalImg({ url: punchInPhoto, label: "Punch-In Selfie" })}
            className="group relative cursor-pointer"
            title="View Punch In Selfie"
          >
            <img
              src={punchInPhoto}
              alt="In"
              className="w-7 h-7 rounded-md object-cover ring-1 ring-slate-200 group-hover:ring-blue-500 transition-all"
            />
            <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-[8px] text-white px-0.5 rounded font-bold leading-tight">
              IN
            </span>
          </button>
        )}
        {punchOutPhoto && (
          <button
            type="button"
            onClick={() => setModalImg({ url: punchOutPhoto, label: "Punch-Out Selfie" })}
            className="group relative cursor-pointer"
            title="View Punch Out Selfie"
          >
            <img
              src={punchOutPhoto}
              alt="Out"
              className="w-7 h-7 rounded-md object-cover ring-1 ring-slate-200 group-hover:ring-red-500 transition-all"
            />
            <span className="absolute -bottom-1 -right-1 bg-red-600 text-[8px] text-white px-0.5 rounded font-bold leading-tight">
              OUT
            </span>
          </button>
        )}
      </div>

      {modalImg && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setModalImg(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-800 text-sm">{modalImg.label}</h4>
              <button
                onClick={() => setModalImg(null)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <img src={modalImg.url} alt={modalImg.label} className="w-full h-full object-cover" />
            </div>
            <a
              href={modalImg.url}
              target="_blank"
              rel="noreferrer"
              className="block text-center text-xs text-blue-600 hover:underline font-semibold"
            >
              Open Full Resolution ↗
            </a>
          </div>
        </div>
      )}
    </>
  );
};
