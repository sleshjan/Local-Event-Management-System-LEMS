import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { getImageUrl } from '../../services/api';

const UserProfileIcon = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleClick = () => {
        // Navigate to profile page
        // Check role to determine if we stay in admin or user area, 
        // but typically a single profile page /profile or /admin/profile works.
        // Based on plan, we are using /admin/profile for admins.
        // Let's check role.
        if (user.role === 'admin') {
            navigate('/admin/profile');
        } else {
            // For now, let's assume /profile for users or use same component
            navigate('/profile');
        }
    };

    return (
        <button
            onClick={handleClick}
            className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            title="View Profile"
        >
            {user.profile_picture ? (
                <img
                    src={getImageUrl(user.profile_picture)}
                    alt="Profile"
                    crossOrigin="anonymous"
                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />
            ) : (
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 border border-purple-200">
                    <User className="w-8 h-8" />
                </div>
            )}
        </button>
    );
};

export default UserProfileIcon;
