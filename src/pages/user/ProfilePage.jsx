import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Save, ShieldCheck } from 'lucide-react';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import { getImageUrl, parseApiError } from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Sidebar from '../../components/common/Sidebar';
import { locationService } from '../../services/locationService';
import { Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [userInterests, setUserInterests] = useState([]); // For Sidebar
    const { showToast } = useToast();


    // Form State
    const [formData, setFormData] = useState({
        name: '',
        municipality_id: '',
        ward_no: '',
        street: '',
        phone_number: '',
        profile_picture: null
    });
    const [previewImage, setPreviewImage] = useState(null);

    // Location State
    const [locationData, setLocationData] = useState([]);
    const [fetchingLocations, setFetchingLocations] = useState(false);
    const [districts, setDistricts] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [wards, setWards] = useState([]);

    // Fetch Location Data on Mount
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                setFetchingLocations(true);
                const data = await locationService.getAddresses();
                setLocationData(data);
            } catch (err) {
                console.error("Failed to load location data", err);
            } finally {
                setFetchingLocations(false);
            }
        };
        fetchAddresses();
    }, []);

    // Handle Province Change
    useEffect(() => {
        if (formData.province) {
            const selectedProvince = locationData.find(p => p.id == formData.province);
            if (selectedProvince && selectedProvince.districts) {
                setDistricts(selectedProvince.districts);
            } else {
                setDistricts([]);
            }
        } else {
            setDistricts([]);
        }
    }, [formData.province, locationData]);

    // Handle District Change
    useEffect(() => {
        if (formData.district) {
            const selectedDistrict = districts.find(d => d.id == formData.district);
            if (selectedDistrict && selectedDistrict.municipalities) {
                setMunicipalities(selectedDistrict.municipalities);
            } else {
                setMunicipalities([]);
            }
        } else {
            setMunicipalities([]);
        }
    }, [formData.district, districts]);

    // Handle Municipality Change
    useEffect(() => {
        if (formData.municipality) {
            const selectedMunicipality = municipalities.find(m => m.id == formData.municipality);
            if (selectedMunicipality && selectedMunicipality.no_of_ward) {
                const wardCount = parseInt(selectedMunicipality.no_of_ward, 10);
                const wardArray = Array.from({ length: wardCount }, (_, i) => i + 1);
                setWards(wardArray);
            } else {
                setWards([]);
            }
        } else {
            setWards([]);
        }
    }, [formData.municipality, municipalities]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Get from local storage first
                const localUser = JSON.parse(localStorage.getItem('user') || '{}');
                setUser(localUser);
                setFormData({
                    name: localUser.name || '',
                    municipality_id: localUser.municipality_id || '',
                    ward_no: localUser.ward_no || '',
                    street: localUser.street || '',
                    phone_number: localUser.phone || localUser.phone_number || localUser.phone_no || '',
                    profile_picture: null
                });

                // Fetch latest
                const data = await userService.getProfile();
                const profileData = data.data || data;

                // Update localStorage to keep it in sync with latest backend data
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({ ...currentUser, ...profileData }));

                setUser(profileData);
                setFormData({
                    name: profileData.name || '',
                    province: profileData.address?.province?.id || '',
                    district: profileData.address?.district?.id || '',
                    municipality: profileData.address?.municipality?.id || '',
                    municipality_id: profileData.address?.municipality?.id || profileData.municipality_id || '',
                    ward_no: profileData.ward_no || '',
                    street: profileData.street || '',
                    phone_number: profileData.phone || profileData.phone_number || profileData.phone_no || '',
                    profile_picture: null
                });

                // Set interests for sidebar
                const interests = profileData.interests || [];
                setUserInterests(interests);

            } catch (err) {
                // Error handled by alert if needed, or silently failed
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // Debug Profile Picture and Verification
    useEffect(() => {
        if (user) {
            // Processing basic flags
        }
    }, [user]);


    const handleChange = (e) => {
        const { name, value } = e.target;

        // Prevent changing verified phone number
        if (name === 'phone_number' && user?.is_phone_verified) {
            showToast("Your phone number is verified and cannot be changed.", "error");
            return;
        }

        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Handle Cascading Resets
            if (name === 'province') {
                newData.district = '';
                newData.municipality = '';
                newData.municipality_id = '';
                newData.ward_no = '';
            } else if (name === 'district') {
                newData.municipality = '';
                newData.municipality_id = '';
                newData.ward_no = '';
            } else if (name === 'municipality') {
                newData.municipality_id = value; // Sync main ID
                newData.ward_no = '';
            }

            return newData;
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate File Size (Max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showToast("File size exceeds 5MB. Please upload a smaller image.", "error");
                return;
            }

            // Validate File Type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                showToast("Invalid file format. Please upload JPG, PNG, GIF, or WEBP.", "error");
                return;
            }

            setFormData(prev => ({ ...prev, profile_picture: file }));
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Phone Validation
        if (formData.phone_number) {
            const phoneRegex = /^9\d{9}$/; // Starts with 9, followed by 9 digits (total 10)
            if (!phoneRegex.test(formData.phone_number)) {
                showToast("Please enter a valid 10-digit mobile number starting with 9.", "error");
                return;
            }
        }

        setLoading(true);
        try {
            // Extract interest IDs to preserve them
            // userInterests might be objects or IDs. Handle both.
            const interestIds = userInterests.map(i => (typeof i === 'object' ? i.id : i));

            const updatePayload = {
                ...formData,
                interests: interestIds
            };

            const updatedUserResponse = await userService.updateProfile(updatePayload);

            // Refetch profile to check updates
            let refreshedProfile = await userService.getProfile();
            let newData = refreshedProfile.data || refreshedProfile;

            // Robust Auto-Verify Logic
            // We check two conditions to trigger verification:
            // 1. The user entered a phone number AND they were not verified before.
            // 2. The user CHANGED their phone number (comparing new input vs old state).
            // We do NOT rely on 'newData.is_phone_verified' immediately because the backend currently 
            // returns 'true' erroneously after a profile update.
            const phoneChanged = formData.phone_number !== user?.phone_number;
            const needsVerification = !user?.is_phone_verified || phoneChanged;

            if (formData.phone_number && needsVerification) {
                try {
                    console.log("Triggering verification for:", formData.phone_number);
                    await authService.verifyPhone(formData.phone_number);

                    // Refetch again to get the final verified state
                    refreshedProfile = await userService.getProfile();
                    newData = refreshedProfile.data || refreshedProfile;

                    showToast("Phone number updated and verification sent!", "success");
                } catch (verifyErr) {
                    console.error("Auto-verification failed", verifyErr);
                    showToast("Profile updated, but phone verification failed.", "warning");
                }
            }

            // Update user in state and local storage
            setUser(newData);
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...currentUser, ...newData }));

            setIsEditing(false);
            showToast("Profile updated successfully!", "success");
        } catch (err) {
            showToast(parseApiError(err), "error");
        } finally {
            setLoading(false);
        }
    };

    // Determine layout based on role
    const isAdmin = user?.role === 'admin' || user?.is_admin;

    if (loading && !user) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <div className="hidden lg:block">
                {isAdmin ? <AdminSidebar /> : <Sidebar userInterests={userInterests} />}
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Profile Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                        <div className="p-8">
                            {/* Profile Image & Basic Info */}
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
                                <div className="relative">
                                    <img
                                        src={previewImage || getImageUrl(user?.profile_picture) || "https://ui-avatars.com/api/?name=" + (user?.name || 'User')}
                                        alt="Profile"
                                        crossOrigin="anonymous"
                                        className="w-32 h-32 rounded-full border-4 border-gray-100 object-cover"
                                    />
                                    {isEditing && (
                                        <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow cursor-pointer hover:bg-gray-50 border border-gray-200">
                                            <Camera className="w-5 h-5 text-gray-600" />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    )}
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <h2 className="text-3xl font-bold text-gray-900">{user?.name}</h2>
                                    <p className="text-gray-500 text-lg">{user?.email}</p>
                                    <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${user?.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                            {user?.is_admin ? 'Admin' : 'User'}
                                        </span>
                                        {user?.is_organizer && <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">Organizer</span>}
                                    </div>
                                </div>
                            </div>


                            {/* Edit Form or Display */}
                            {isEditing ? (
                                <form onSubmit={handleSubmit} className="space-y-6">

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="email"
                                                    value={user?.email}
                                                    disabled
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        {/* Phone Number Section */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number {user?.is_phone_verified && <span className="text-xs text-green-600 font-normal">(Verified)</span>}
                                            </label>
                                            <div className="flex gap-2 relative">
                                                <input
                                                    type="text"
                                                    name="phone_number"
                                                    value={formData.phone_number || user?.phone_number || ''}
                                                    onChange={handleChange}
                                                    placeholder="Enter phone number"
                                                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${user?.is_phone_verified ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                                />
                                                {user?.is_phone_verified && (
                                                    <div className="absolute right-3 top-2.5 text-green-600" title="Verified">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                                Province
                                                {fetchingLocations && <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />}
                                            </label>
                                            <select
                                                name="province"
                                                value={formData.province}
                                                onChange={handleChange}
                                                disabled={fetchingLocations}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                                            >
                                                <option value="">Select Province</option>
                                                {locationData.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                                            <select
                                                name="district"
                                                value={formData.district}
                                                onChange={handleChange}
                                                disabled={!formData.province}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                                            >
                                                <option value="">Select District</option>
                                                {districts.map(d => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Municipality</label>
                                            <select
                                                name="municipality"
                                                value={formData.municipality}
                                                onChange={handleChange}
                                                disabled={!formData.district}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                                            >
                                                <option value="">Select Municipality</option>
                                                {municipalities.map(m => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ward No</label>
                                            <select
                                                name="ward_no"
                                                value={formData.ward_no}
                                                onChange={handleChange}
                                                disabled={!formData.municipality}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                                            >
                                                <option value="">Select Ward</option>
                                                {wards.map(w => (
                                                    <option key={w} value={w}>{w}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                                            <input
                                                type="text"
                                                name="street"
                                                value={formData.street}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                                        >
                                            {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">All Details</h3>
                                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                            {Object.entries(user || {}).map(([key, value]) => {
                                                // Handle address object specifically
                                                if (key === 'address' && value && typeof value === 'object') {
                                                    const parts = [
                                                        value.municipality?.name,
                                                        value.district?.name,
                                                        value.province?.name
                                                    ].filter(Boolean);

                                                    const addressString = parts.length > 0 ? parts.join(', ') : 'N/A';

                                                    return (
                                                        <div key={key}>
                                                            <dt className="text-sm text-gray-500">Address</dt>
                                                            <dd className="text-base font-medium text-gray-900 mt-1">{addressString}</dd>
                                                        </div>
                                                    );
                                                }

                                                if (
                                                    ['id', 'profile_picture', 'interests', 'email_verified_at', 'is_email_verified', 'phone_verified_at', 'is_phone_verified', 'created_at', 'updated_at', 'is_admin', 'is_organizer', 'role', 'token', 'address', 'municipality_id', 'province', 'district', 'municipality'].includes(key) ||
                                                    typeof value === 'object'
                                                ) return null;

                                                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                                const displayValue = (typeof value === 'boolean') ? (value ? 'Yes' : 'No') : (value || 'N/A');

                                                return (
                                                    <div key={key}>
                                                        <dt className="text-sm text-gray-500">{label}</dt>
                                                        <dd className="text-base font-medium text-gray-900 mt-1">{displayValue}</dd>
                                                    </div>
                                                )
                                            })}
                                            {!user?.ward_no && <div><dt className="text-sm text-gray-500">Ward No</dt><dd className="text-base font-medium text-gray-900 mt-1">N/A</dd></div>}
                                            {!user?.street && <div><dt className="text-sm text-gray-500">Street</dt><dd className="text-base font-medium text-gray-900 mt-1">N/A</dd></div>}
                                        </dl>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
