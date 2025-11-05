import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, KeyRound, LogOut, LayoutDashboard, FolderKanban, Users, Inbox } from 'lucide-react';
import Logo from '../common/Logo';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const menuItems = [
    { 
      name: 'Events', 
      path: '/admin/dashboard',
      icon: LayoutDashboard
    },
    { 
      name: 'Manage Users', 
      path: '/admin/users',
      icon: Users
    },
    { 
      name: 'Manage Categories', 
      path: '/admin/categories',
      icon: FolderKanban
    },
    { 
      name: 'Organizer requests', 
      path: '/admin/organizer-requests',
      icon: Inbox
    }
  ];

  const isActive = (path) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResetPassword = () => {
    setIsDropdownOpen(false);
    navigate('/reset-password');
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    localStorage.clear();
    navigate('/login');
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
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </button>
          );
        })}
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

export default AdminSidebar;