import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useTodayStatus, usePunchIn, usePunchOut } from "../../hooks/useAttendance";
import { 
  Camera, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Clock, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function PunchPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedURL, setCapturedURL] = useState(null);
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: status = null } = useTodayStatus();

  const startCamera = async () => {
    setMsg(null);
    try {
      const s = await (
        navigator.mediaDevices?.getUserMedia({ video: { facingMode: "user" } })
          .catch(() => navigator.mediaDevices?.getUserMedia({ video: true }))
      );
      if (!s) throw new Error("No media stream");
      setStream(s);
    } catch {
      setMsg({ type: "error", text: "Camera access denied. Please allow camera permissions." });
    }
  };

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob((blob) => {
      setCapturedBlob(blob);
      setCapturedURL(canvas.toDataURL("image/jpeg"));
    }, "image/jpeg", 0.85);

    stopCamera();
  };

  const retake = () => {
    setCapturedBlob(null);
    setCapturedURL(null);
    startCamera();
  };

  const getLocation = () => {
    setLocLoading(true);
    setLocError(null);
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      setLocLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          acc: pos.coords.accuracy,
        });
        setLocLoading(false);
      },
      (err) => {
        setLocError("Location access denied. Please enable GPS/location.");
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    getLocation();
    return () => stopCamera();
  }, []);

  const handlePunchIn = async () => {
    if (!capturedBlob) {
      setMsg({ type: "error", text: "Please capture a live selfie verification." });
      return;
    }
    if (!location) {
      setMsg({ type: "error", text: "Please verify your location first." });
      return;
    }
    setMsg(null);

    const fd = new FormData();
    fd.append("file", capturedBlob, "selfie.jpg");
    fd.append("lat", location.lat);
    fd.append("lng", location.lng);
    punchInMutation.mutate(fd);
  };

  const punchInMutation = usePunchIn(
    () => {
      setMsg({ type: "success", text: "Punched in successfully! Redirecting to dashboard..." });
      setTimeout(() => navigate("/employee"), 1400);
    },
    (e) => {
      setMsg({
        type: "error",
        text: e.response?.data?.message || "Punch in failed. Ensure you are at the workplace.",
      });
    }
  );

  const punchOutMutation = usePunchOut(
    () => {
      setMsg({ type: "success", text: "Punched out successfully! Redirecting to dashboard..." });
      setTimeout(() => navigate("/employee"), 1400);
    },
    (e) => {
      setMsg({
        type: "error",
        text: e.response?.data?.message || "Punch out failed. Try again.",
      });
    }
  );

  const handlePunchOut = async () => {
    if (!capturedBlob) {
      setMsg({ type: "error", text: "Please capture a live selfie verification to punch out." });
      return;
    }
    if (!location) {
      setMsg({ type: "error", text: "Please verify your location first." });
      return;
    }
    setMsg(null);

    const fd = new FormData();
    fd.append("file", capturedBlob, "punchout-selfie.jpg");
    fd.append("lat", location.lat);
    fd.append("lng", location.lng);
    punchOutMutation.mutate(fd);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
          Attendance Terminal
        </span>
        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono my-2 text-white">
          {currentTime.toLocaleTimeString()}
        </div>
        <p className="text-xs text-slate-400">
          {currentTime.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700">
          <span
            className={`w-2 h-2 rounded-full ${
              status === "out"
                ? "bg-slate-400"
                : status === "in"
                ? "bg-emerald-400 animate-pulse"
                : "bg-amber-400"
            }`}
          />
          <span className="text-slate-200">
            {status === "out"
              ? "Completed Today"
              : status === "in"
              ? "Punched In (Active Session)"
              : "Ready to Punch In"}
          </span>
        </div>
      </div>

      {status === "out" && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-6 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-bold">Attendance Completed</h3>
          <p className="text-sm text-emerald-700">
            You have already punched out for today. See you next shift!
          </p>
        </div>
      )}

      {status !== "out" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  {status === "in" ? "Punch-Out Selfie Verification" : "Selfie Verification"}
                </h3>
              </div>
              {capturedURL && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Captured
                </span>
              )}
            </div>

            {!stream && !capturedURL && (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 space-y-3">
                <Camera className="w-10 h-10 mx-auto text-slate-400" />
                <p className="text-xs text-slate-500">
                  A live camera photo is required to verify your identity.
                </p>
                <button
                  onClick={startCamera}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Open Live Camera
                </button>
              </div>
            )}

            {stream && (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={(e) => e.target.play().catch(() => {})}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={capture}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Snapshot</span>
                </button>
              </div>
            )}

            {capturedURL && (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center ring-2 ring-emerald-500">
                  <img src={capturedURL} alt="Selfie" className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={retake}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Photo</span>
                </button>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">Geofence Location</h3>
              </div>
              <button
                onClick={getLocation}
                disabled={locLoading}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                {locLoading ? "Detecting..." : "Refresh Location"}
              </button>
            </div>

            {location ? (
              <div className="flex items-center gap-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="font-semibold block">Coordinates Detected</span>
                  <span className="font-mono text-emerald-700">
                    Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            ) : locError ? (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{locError}</span>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Detecting your location...</p>
            )}
          </div>

          {msg && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                msg.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              {msg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              )}
              <span>{msg.text}</span>
            </div>
          )}

          {status !== "in" ? (
            <button
              onClick={handlePunchIn}
              disabled={punchInMutation.isPending}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                punchInMutation.isPending
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{punchInMutation.isPending ? "Recording Punch In..." : "Confirm & Punch In"}</span>
            </button>
          ) : (
            <button
              onClick={handlePunchOut}
              disabled={punchOutMutation.isPending}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                punchOutMutation.isPending
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 active:scale-[0.98]"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{punchOutMutation.isPending ? "Recording Punch Out..." : "Confirm & Punch Out (End Shift)"}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
