import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import SelectInterests from "./pages/auth/SelectInterests";
import UserDashboard from "./pages/user/UserDashboard";
import ResetPassword from "./pages/user/ResetPassword";
import ForgotPassword from "./pages/auth/ForgotPassword";
import BecomeOrganizer from "./pages/user/BecomeOrganizer";
import EventDetails from "./pages/events/EventDetails";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEventDetails from "./pages/admin/AdminEventDetails";
import ManageCategories from "./pages/admin/ManageCategories";
import ManageUsers from "./pages/admin/ManageUsers";
import OrganizerRequests from "./pages/admin/OrganizerRequests";
import CreateEvent from './pages/admin/CreateEvent';
import EditEvent from './pages/admin/EditEvent';

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

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/categories" element={<ManageCategories />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/events/:id" element={<AdminEventDetails />} />
        <Route path="/admin/organizer-requests" element={<OrganizerRequests />} />
        <Route path="/admin/create-event" element={<CreateEvent />} />
        <Route path="/admin/edit-event/:id" element={<EditEvent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;