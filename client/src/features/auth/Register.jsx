import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    branch: "",
    year: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    if (!isValidEmail(formData.email)) {
      setEmailAvailable(null);
      return;
    }
    setEmailChecking(true);
    setEmailAvailable(null);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/check-email?email=${encodeURIComponent(formData.email)}`);
        const data = await res.json();
        setEmailAvailable(data.available);
        if (!data.available) setEmailError("This email is already registered.");
        else setEmailError("");
      } catch {
        setEmailAvailable(null);
      } finally {
        setEmailChecking(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [formData.email]);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const [coldStartBanner, setColdStartBanner] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setColdStartBanner(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "", message: "" }), type === "error" ? 5000 : 3000);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const passwordChecks = {
    minLength: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasLower: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecial: /[^A-Za-z0-9]/.test(formData.password),
  };
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(formData.email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    if (emailAvailable === false) {
      setEmailError("This email is already registered.");
      return;
    }
    if (!isPasswordValid) {
      showToast("error", "Please meet all password requirements.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("success", "Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        showToast("error", data.message || "Registration failed");
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Server error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative py-8 bg-slate-800"
      style={{
        backgroundImage: "url('/auth-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Blurred overlay */}
      <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm" />

      {/* Cold Start Banner */}
      {coldStartBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-500/90 backdrop-blur-sm text-white text-sm font-medium shadow-lg">
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          <span>Server is on Render free tier — first load may take up to 60s. Please wait.</span>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
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
      )}

      {/* Form Card */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Brand */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
            <p className="text-slate-500 text-sm mt-1">Join EduHub today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Your full name"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => { handleChange(e); setEmailError(""); setEmailAvailable(null); }}
                  onBlur={() => {
                    if (formData.email && !isValidEmail(formData.email))
                      setEmailError("Please enter a valid email address.");
                  }}
                  className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-9 ${emailError ? "border-red-400" : emailAvailable === true ? "border-green-400" : "border-slate-300"}`}
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                  {emailChecking && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                  {!emailChecking && emailAvailable === true && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {!emailChecking && emailAvailable === false && <XCircle className="w-4 h-4 text-red-500" />}
                </span>
              </div>
              {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
              {!emailError && emailAvailable === true && <p className="mt-1 text-xs text-green-600">Email is available</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setPasswordFocused(true)}
                  className="w-full px-3.5 py-2.5 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Create a password"
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

              {/* Password strength checklist */}
              {(passwordFocused || formData.password.length > 0) && (
                <ul className="mt-2 space-y-1">
                  {[
                    { key: "minLength", label: "At least 8 characters" },
                    { key: "hasUpper",  label: "At least one uppercase letter" },
                    { key: "hasLower",  label: "At least one lowercase letter" },
                    { key: "hasNumber", label: "At least one number" },
                    { key: "hasSpecial",label: "At least one special character" },
                  ].map(({ key, label }) => (
                    <li
                      key={key}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                        passwordChecks[key] ? "text-green-600" : "text-slate-400"
                      }`}
                    >
                      <span className="text-base leading-none">
                        {passwordChecks[key] ? "✓" : "○"}
                      </span>
                      {label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Branch
                </label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="e.g., CSE"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Year
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="1-4"
                  min="1"
                  max="4"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 no-underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
