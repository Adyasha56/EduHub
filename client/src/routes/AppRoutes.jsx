import { Routes, Route } from "react-router-dom";

// Layouts
import DashboardLayout from "../layout/DashboardLayout";

// Pages
import Home from "../pages/Home";
import Login from '../features/auth/Login';
import Register from "../features/auth/Register";
import ForgotPassword from "../features/auth/ForgotPassword";
import Profile from "../pages/Profile";
import AdminRoutes from "./AdminRoutes";
import QuestionPapers from "../pages/QuestionPapers";
import Placements from "../pages/Placements";
import Dashboard from "../pages/Dashboard";
import Community from "../pages/Community";
import Notifications from "../pages/Notifications";
import NotFound from "../pages/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Home page without Layout (has its own navbar) */}
      <Route path="/" element={<Home />} />
      
      {/* Auth pages - standalone without Layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Routes with DashboardLayout */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/placements" element={<Placements />} />
        <Route path="/question-papers" element={<QuestionPapers />} />
        <Route path="/community" element={<Community />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>
      
      {/* Admin routes (separate layout) */}
      <Route path="/admin/*" element={<AdminRoutes />} />
   
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;