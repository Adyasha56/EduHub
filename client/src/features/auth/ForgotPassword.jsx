import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Loader2, CheckCircle, XCircle, ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import axios from "axios";

const Toast = ({ toast }) =>
  toast.show ? (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border ${
        toast.type === "success"
          ? "border-green-500 bg-green-50 text-green-700"
          : "border-red-500 bg-red-50 text-red-700"
      }`}
    >
      {toast.type === "success" ? (
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 flex-shrink-0" />
      )}
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  ) : null;

const PageWrapper = ({ children }) => (
  <div
    className="min-h-screen flex items-center justify-center relative bg-slate-800 py-8"
    style={{
      backgroundImage: "url('/auth-bg.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm" />
    <div className="relative z-10 w-full max-w-sm mx-4">{children}</div>
  </div>
);

// ─── Step 1: Email form ──────────────────────────────────────────────────────

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "", message: "" }), type === "error" ? 5000 : 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast("error", "Please enter your email address");
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`,
        { email }
      );
      if (res.status === 200) {
        showToast("success", "Enter your new password");
        setResetToken(res.data.resetToken);
        setShowResetForm(true);
      }
    } catch (err) {
      console.error(err);
      showToast("error", err.response?.data?.message || "Error validating email. Please try again.");
      setIsLoading(false);
    }
  };

  if (showResetForm) {
    return <ResetPasswordForm email={email} resetToken={resetToken} />;
  }

  return (
    <PageWrapper>
      <Toast toast={toast} />

      <div className="bg-white rounded-2xl shadow-2xl p-8">
        {/* Back link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Login
        </Link>

        {/* Brand */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 mb-4">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Forgot Password?</h1>
          <p className="text-slate-500 text-sm mt-1">Enter your email to reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Continue"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Remember your password?{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
            Sign In
          </Link>
        </p>
      </div>
    </PageWrapper>
  );
};

// ─── Step 2: Reset password form ────────────────────────────────────────────

const ResetPasswordForm = ({ email, resetToken }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const [resetSuccess, setResetSuccess] = useState(false);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "", message: "" }), type === "error" ? 5000 : 3000);
  };

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.newPassword.trim()) return showToast("error", "Please enter a new password");
    if (formData.newPassword.length < 6) return showToast("error", "Password must be at least 6 characters");
    if (formData.newPassword !== formData.confirmPassword)
      return showToast("error", "Passwords do not match");

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password`,
        { token: resetToken, email, newPassword: formData.newPassword, confirmPassword: formData.confirmPassword }
      );
      if (res.status === 200) {
        showToast("success", "Password reset successful!");
        setResetSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      console.error(err);
      showToast("error", err.response?.data?.message || "Failed to reset password. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Toast toast={toast} />

      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 mb-4">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create New Password</h1>
          <p className="text-slate-500 text-sm mt-1">
            {resetSuccess ? "Password reset successfully!" : "Enter your new password below"}
          </p>
        </div>

        {resetSuccess ? (
          <div className="text-center">
            <div className="p-4 bg-green-50 rounded-xl border border-green-200 mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-700">Your password has been reset successfully!</p>
            </div>
            <p className="text-xs text-slate-500">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Min. 6 characters"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Re-enter password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-500 mt-6">
          <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
            Back to Sign In
          </Link>
        </p>
      </div>
    </PageWrapper>
  );
};

export default ForgotPassword;
