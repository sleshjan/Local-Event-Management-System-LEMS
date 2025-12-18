import apiRequest from "./api";

export const userService = {
    // Get authenticated user profile
    getProfile: async () => {
        // Endpoint likely /profile or /user. Using /profile based on previous probes/conventions
        const response = await apiRequest("/profile", {
            method: "GET",
        });
        return response.data || response;
    },

    // Update user interests
    // Payloads: { interests: [1, 2, 3] }
    // Update user interests
    // Payloads: { interests: [1, 2, 3] } (plus all other profile fields required by backend)
    updateInterests: async (interestIds) => {
        // First get current profile data because backend requires all fields
        const currentProfile = await userService.getProfile();

        // Prepare payload merging existing data with new interests
        const payload = {
            ...currentProfile,
            interests: interestIds,
            // Ensure we don't send nulls if fields are missing, though updateProfile handles most
            // Profile picture: If it's a URL string, updateProfile handles it (by not appending as File)
        };

        // Reuse updateProfile to send to /profile with FormData
        return await userService.updateProfile(payload);
    },

    // Get all users (Admin only)
    getAllUsers: async () => {
        const response = await apiRequest("/users", {
            method: "GET",
        });
        return response.data || response;
    },

    // Update user profile
    updateProfile: async (userData) => {
        const formData = new FormData();

        // Append text fields
        if (userData.name) formData.append('name', userData.name);
        if (userData.province) formData.append('province', userData.province);
        if (userData.district) formData.append('district', userData.district);
        if (userData.municipality_id) formData.append('municipality_id', userData.municipality_id);
        if (userData.ward_no) formData.append('ward_no', userData.ward_no);
        if (userData.street) formData.append('street', userData.street);
        if (userData.phone_number) {
            formData.append('phone', userData.phone_number);
            formData.append('phone_number', userData.phone_number);
            formData.append('phone_no', userData.phone_number); // Covering all bases
        }

        // Append profile picture if it exists (it handles File object)
        if (userData.profile_picture instanceof File) {
            formData.append('profile_picture', userData.profile_picture);
        }

        // Append interests
        // Assuming backend expects 'interests[]' or similar for array in FormData
        if (userData.interests && Array.isArray(userData.interests)) {
            userData.interests.forEach((interestId, index) => {
                formData.append(`interests[${index}]`, interestId);
            });
        }

        // Endpoint is /profile (POST)
        const response = await apiRequest("/profile", {
            method: "POST",
            body: formData,
        });

        // Update local storage user data if successful
        if (response.data) {
            // Merge new data with existing user data to keep other fields like email/role
            const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
            const updatedUser = { ...currentUser, ...response.data };
            localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        return response.data || response;
    },
};
