import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard,
  FileText,
  Building2,
  User,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  GraduationCap,
} from "lucide-react";
import NotificationBell from "../components/community/NotificationBell";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Community", path: "/community", icon: MessageSquare },
  { label: "Question Papers", path: "/question-papers", icon: FileText },
  { label: "Placement Records", path: "/placements", icon: Building2 },
  { label: "Profile", path: "/profile", icon: User },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("studentSidebarCollapsed") === "true";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("studentSidebarCollapsed", collapsed);
  }, [collapsed]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [navigate]);

  const handleLogout = () => setShowLogoutModal(true);

  const confirmLogout = () => {
    logout();
    setTimeout(() => navigate("/login"), 50);
  };


  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo / Brand — h-14 matches the top navbar exactly */}
      <div
        className={`flex items-center gap-3 px-4 h-14 flex-shrink-0 border-b border-slate-700 ${
          collapsed && !isMobile ? "justify-center" : ""
        }`}
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {(!collapsed || isMobile) && (
          <div>
            <p className="text-white font-bold text-sm leading-tight">EduHub</p>
            <p className="text-blue-300 text-xs">Student Portal</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/dashboard"}
            onClick={() => isMobile && setMobileOpen(false)}
            className={({ isActive }) =>
              `no-underline flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                collapsed && !isMobile ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white hover:no-underline"
              }`
            }
            title={collapsed && !isMobile ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                  }`}
                />
                {(!collapsed || isMobile) && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info + collapse toggle */}
      <div className="border-t border-slate-700 p-3 space-y-2">
        {(!collapsed || isMobile) && user && (
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-slate-700/50">
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">
                {user?.name || "Student"}
              </p>
              <p className="text-slate-400 text-xs truncate">
                {user?.branch} · Year {user?.year}
              </p>
            </div>
          </div>
        )}

        {/* Collapse button — desktop only */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed((v) => !v)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-slate-100 dark:bg-slate-800">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-slate-900 dark:bg-slate-950 transition-all duration-300 h-screen sticky top-0 overflow-y-auto ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 left-0 h-full w-64 z-50 bg-slate-900 dark:bg-slate-950 flex flex-col lg:hidden transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-end p-3 border-b border-slate-700">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent isMobile />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="flex-shrink-0 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user && (
              <Link
                to="/profile"
                className="hidden sm:flex items-center gap-2 px-1 no-underline"
                title="Profile"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-80 space-y-4">
            <h2 className="text-base font-semibold text-slate-800 dark:text-white">Log out?</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Are you sure you want to log out of EduHub?</p>
            <div className="flex gap-3 justify-end pt-1">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
