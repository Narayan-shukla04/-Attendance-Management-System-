import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, User, CheckCircle2, Camera, ImagePlus } from "lucide-react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { useManagersList } from "../../hooks/useUsers";
import axiosInstance from "../../config/AxiosInstance";
import { setUser } from "../../feature/AuthSlice";

export default function Register() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { role: "" } });

  const [isSuccess, setIsSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [serverError, setServerError] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const role = watch("role");

  const { data: managers = [], isLoading: loadingManagers } = useManagersList(role === "employee");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setValue("profile", file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data) => {
    setServerError(null);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("role", data.role);
    if (data.managerId) formData.append("managerId", data.managerId);
    if (data.profile) formData.append("profile", data.profile);

    try {
      const response = await axiosInstance.post("/auth/register", formData);
      dispatch(setUser(response.data.user));
      setIsSuccess(true);
      reset();
      setPreviewImage(null);
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      setServerError(error.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: 440, borderRadius: 16, boxShadow: "0 4px 24px #0001", padding: 32 }}>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: "50%", background: "#dbeafe", marginBottom: 12 }}>
            <User size={26} color="#2563eb" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: 0 }}>Create Account</h2>
          <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>Sign up to get started.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <label htmlFor="profile-upload" style={{ cursor: "pointer", position: "relative" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", border: "2px dashed #cbd5e1", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {previewImage
                  ? <img src={previewImage} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <ImagePlus size={28} color="#94a3b8" />}
              </div>
              <div style={{ position: "absolute", bottom: 0, right: 0, background: "#2563eb", borderRadius: "50%", padding: 5, border: "2px solid #fff" }}>
                <Camera size={10} color="#fff" />
              </div>
            </label>
            <input id="profile-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
            <span style={{ fontSize: 12, color: "#94a3b8" }}>Profile photo (optional)</span>
          </div>

          <Field label="Full Name" error={errors.name?.message}>
            <div style={inputWrap}>
              <User size={16} color="#94a3b8" style={icon} />
              <input id="name" type="text" placeholder="John Doe" style={input(errors.name)}
                {...register("name", { required: "Name is required", minLength: { value: 3, message: "Min 3 characters" } })} />
            </div>
          </Field>

          <Field label="Email Address" error={errors.email?.message}>
            <div style={inputWrap}>
              <Mail size={16} color="#94a3b8" style={icon} />
              <input id="email" type="email" placeholder="you@example.com" style={input(errors.email)}
                {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" } })} />
            </div>
          </Field>

          <Field label="Password" error={errors.password?.message}>
            <div style={inputWrap}>
              <Lock size={16} color="#94a3b8" style={icon} />
              <input id="password" type="password" placeholder="••••••••" style={input(errors.password)}
                {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })} />
            </div>
          </Field>

          <Field label="Role" error={errors.role?.message}>
            <select style={{ ...input(errors.role), paddingLeft: 12 }}
              {...register("role", { required: "Please select a role" })}>
              <option value="">Select role…</option>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </Field>

          {role === "employee" && (
            <Field label="Select Manager" error={errors.managerId?.message}>
              <select
                style={{ ...input(errors.managerId), paddingLeft: 12 }}
                {...register("managerId", { required: "Please select your manager" })}
              >
                <option value="">
                  {loadingManagers ? "Loading managers..." : "Select your manager..."}
                </option>
                {managers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
              {managers.length === 0 && !loadingManagers && (
                <p style={{ fontSize: 12, color: "#d97706", marginTop: 4 }}>
                  No managers found. A manager must register first.
                </p>
              )}
            </Field>
          )}

          {serverError && (
            <p style={{ fontSize: 13, color: "#991b1b", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px", textAlign: "center" }}>
              {serverError}
            </p>
          )}

          <button type="submit" disabled={isSubmitting} style={{ background: isSubmitting ? "#93c5fd" : "#2563eb", color: "#fff", border: "none", borderRadius: 9, padding: "11px", fontSize: 15, fontWeight: 600, cursor: isSubmitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {isSubmitting ? "Creating account…" : isSuccess ? <><CheckCircle2 size={18} /> Registered!</> : "Create Account"}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 14, color: "#64748b" }}>
          Already have an account?{" "}
          <button type="button" onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 600, cursor: "pointer" }}>
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 5 }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>{error}</p>}
    </div>
  );
}

const inputWrap = { position: "relative", display: "flex", alignItems: "center" };
const icon = { position: "absolute", left: 10 };
const input = (err) => ({ width: "100%", boxSizing: "border-box", padding: "9px 10px 9px 34px", border: `1px solid ${err ? "#f87171" : "#e2e8f0"}`, borderRadius: 8, fontSize: 14, background: "#f8fafc", outline: "none" });
