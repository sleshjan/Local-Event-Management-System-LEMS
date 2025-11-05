import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Settings,
  KeyRound,
  LogOut,
  LayoutDashboard,
  FolderKanban,
  User,
} from "lucide-react";
import Logo from "./Logo";
import InterestTag from "./InterestTag";

const Sidebar = ({ userInterests = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "My Events", path: "/my-events", icon: FolderKanban },
  ];

  const isActive = (path) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResetPassword = () => {
    setIsDropdownOpen(false);
    // console.log('Reset password clicked');
    navigate("/reset-password");
  };

  const handleBeOrganizer = () => {
    setIsDropdownOpen(false);
    // console.log('Be an organizer clicked');
    navigate("/become-organizer");
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Logo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive(item.path)
                  ? "bg-purple-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </button>
          );
        })}

        {/* Your Interests Section */}
        {userInterests.length > 0 && (
          <div className="pt-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-3 px-4">
              Your interests
            </h3>
            <div className="space-y-2 px-4">
              {userInterests.map((interest, index) => (
                <InterestTag key={index} text={interest} />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Settings Button at Bottom */}
      <div className="p-4 border-t border-gray-200 relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Reset Password */}
            <button
              onClick={handleResetPassword}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left"
            >
              <KeyRound className="w-5 h-5" />
              <span className="text-sm font-medium">Reset Password</span>
            </button>

            {/* Be an Organizer */}
            <button
              onClick={handleBeOrganizer}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
            >
              <User className="w-5 h-5" />
              <span className="text-sm font-medium">Be an Organizer</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-left border-t border-gray-100"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
