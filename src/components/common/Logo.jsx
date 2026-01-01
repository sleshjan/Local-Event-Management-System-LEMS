import { Link } from "react-router-dom";
import { authService } from "../../services/authService";

const Logo = () => {
  const user = authService.getCurrentUser();
  const userRole = user?.role;

  const dashboardPath = userRole === "admin" ? "/admin/dashboard" : "/";

  return (
    <Link to={dashboardPath} className="flex items-center gap-3 transition-opacity hover:opacity-80">
      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-sm">
        <span className="text-white font-bold text-xl">इV</span>
      </div>
      <span className="text-2xl font-semibold text-gray-900">Evently</span>
    </Link>
  );
};

export default Logo;