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
import EditCategory from "./pages/admin/EditCategory";
import AddCategory from "./pages/admin/AddCategory";
import ManageUsers from "./pages/admin/ManageUsers";
import OrganizerRequests from "./pages/admin/OrganizerRequests";
import ManageRegistrations from "./pages/admin/ManageRegistrations";
import CreateEvent from './pages/admin/CreateEvent';
import EditEvent from './pages/admin/EditEvent';
import ProfilePage from './pages/user/ProfilePage';
import ResetPasswordConfirm from "./pages/auth/ResetPasswordConfirm";
import TermsAndPrivacy from "./pages/TermsAndPrivacy";

import MyEvents from "./pages/user/MyEvents";
import UserCreateEvent from "./pages/user/CreateEvent";
import { ToastProvider } from "./context/ToastContext";
import ToastContainer from "./components/common/ToastContainer";
import { ModalProvider } from "./context/ModalContext";
import GlobalModal from "./components/common/GlobalModal";

function App() {
  return (
    <ToastProvider>
      <ModalProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<UserDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/select-interests" element={<SelectInterests />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPasswordConfirm />} />
            <Route path="/terms-and-privacy" element={<TermsAndPrivacy />} />

            {/* User routes */}
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/my-events" element={<MyEvents />} />
            <Route path="/user/create-event" element={<UserCreateEvent />} />
            <Route path="/change-password" element={<ResetPassword />} />
            <Route path="/become-organizer" element={<BecomeOrganizer />} />
            <Route path="/event/:slug" element={<EventDetails />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/categories" element={<ManageCategories />} />
            <Route path="/admin/edit-category/:id" element={<EditCategory />} />
            <Route path="/admin/add-category" element={<AddCategory />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/events/:slug" element={<AdminEventDetails />} />
            <Route path="/admin/organizer-requests" element={<OrganizerRequests />} />
            <Route path="/admin/registrations" element={<ManageRegistrations />} />
            <Route path="/admin/create-event" element={<CreateEvent />} />
            <Route path="/admin/edit-event/:id" element={<EditEvent />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer />
        <GlobalModal />
      </ModalProvider>
    </ToastProvider>
  );
}

export default App;