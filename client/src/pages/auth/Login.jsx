import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, LogIn, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "../../config/AxiosInstance";
import { loginUser } from "../../feature/AuthSlice";

const ROLE_REDIRECT = {
  employee: "/employee",
  manager: "/manager",
  admin: "/admin",
};

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  React.useEffect(() => {
    if (user?.role && ROLE_REDIRECT[user.role]) {
      navigate(ROLE_REDIRECT[user.role], { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    setServerError(null);
    try {
      const resultAction = await dispatch(
        loginUser({
          email: data.email,
          password: data.password,
          role: data.role,
        })
      );

      if (loginUser.fulfilled.match(resultAction)) {
        setIsSuccess(true);
        const loggedInUser = resultAction.payload;
        setTimeout(() => navigate(ROLE_REDIRECT[loggedInUser.role] ?? "/"), 1200);
      } else {
        setServerError(resultAction.payload || "Login failed. Please try again.");
      }
    } catch {
      setServerError("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
          <p className="text-slate-500 mt-2 text-sm">Sign in to your account.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors ${
                  errors.email ? "border-red-500 focus:ring-red-500" : "border-slate-200"
                }`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors ${
                  errors.password ? "border-red-500 focus:ring-red-500" : "border-slate-200"
                }`}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
                })}
              />
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              className={`w-full px-4 py-3 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.role ? "border-red-500" : "border-slate-200"
              }`}
              {...register("role", { required: "Please select your role" })}
            >
              <option value="">Select role...</option>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>}
          </div>

          {serverError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center transition-all duration-200 ${
              isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
            }`}
          >
            {isSubmitting ? (
              <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" /> Signed In!
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}