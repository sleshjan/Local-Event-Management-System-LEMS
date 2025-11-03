import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import SelectInterests from "./pages/auth/SelectInterests";
import UserDashboard from "./pages/user/UserDashboard";
import ResetPassword from "./pages/user/ResetPassword";
import ForgotPassword from "./pages/auth/ForgotPassword";
import BecomeOrganizer from "./pages/user/BecomeOrganizer";
import EventDetails from "./pages/user/EventDetails";
import AdminDashboard from "./pages/admin/AdminDashboard";
import OrganizerRequests from "./pages/admin/OrganizerRequests";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/select-interests" element={<SelectInterests />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* User routes */}
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/my-events" element={<UserDashboard />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/become-organizer" element={<BecomeOrganizer />} />
        <Route path="/event/:id" element={<EventDetails />} />

        {/* User Routes */}
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/my-events" element={<UserDashboard />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/become-organizer" element={<BecomeOrganizer />} />
        <Route path="/event/:id" element={<EventDetails />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route
          path="/admin/organizer-requests"
          element={<OrganizerRequests />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
