import { useState } from "react";
import { useValidateAttendance } from "../hooks/useAttendance";

export default function ValidateAction({ record, invalidateKey = "team-attendance", title = "Review Attendance" }) {
  const [show, setShow] = useState(false);
  const [remarks, setRemarks] = useState("");
  const validateMutation = useValidateAttendance(invalidateKey);

  if (record.validationStatus !== "pending") {
    return (
      <span className="text-xs text-slate-400 italic">
        {record.remarks ? `"${record.remarks}"` : "Reviewed"}
      </span>
    );
  }

  const handleValidate = (status) => {
    validateMutation.mutate(
      { id: record._id, status, remarks },
      {
        onSuccess: () => setShow(false),
      }
    );
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setShow(!show)}
        className="px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors cursor-pointer"
      >
        Validate
      </button>

      {show && (
        <div className="absolute right-0 mt-2 w-72 p-3.5 bg-white border border-slate-200 rounded-xl shadow-xl z-20 space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-800">{title}</p>
            <button
              onClick={() => setShow(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          {(record.punchInPhoto || record.punchOutPhoto) && (
            <div className="flex gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
              {record.punchInPhoto && (
                <div className="flex-1 text-center">
                  <span className="text-[10px] text-slate-500 font-semibold block mb-1">Punch In</span>
                  <a href={record.punchInPhoto} target="_blank" rel="noreferrer">
                    <img
                      src={record.punchInPhoto}
                      alt="Punch In Selfie"
                      className="w-full h-16 object-cover rounded-md border border-slate-200 hover:opacity-90 transition-opacity"
                    />
                  </a>
                </div>
              )}
              {record.punchOutPhoto && (
                <div className="flex-1 text-center">
                  <span className="text-[10px] text-slate-500 font-semibold block mb-1">Punch Out</span>
                  <a href={record.punchOutPhoto} target="_blank" rel="noreferrer">
                    <img
                      src={record.punchOutPhoto}
                      alt="Punch Out Selfie"
                      className="w-full h-16 object-cover rounded-md border border-slate-200 hover:opacity-90 transition-opacity"
                    />
                  </a>
                </div>
              )}
            </div>
          )}

          <input
            type="text"
            placeholder="Remarks (optional)..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex gap-1.5 pt-1">
            <button
              disabled={validateMutation.isPending}
              onClick={() => handleValidate("valid")}
              className="flex-1 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              Valid
            </button>
            <button
              disabled={validateMutation.isPending}
              onClick={() => handleValidate("invalid")}
              className="flex-1 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              Invalid
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
