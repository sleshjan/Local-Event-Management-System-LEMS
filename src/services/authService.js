import apiRequest from "./api";

export const authService = {

  // Register
  register: async (userData) => {
    // Create FormData object for multipart/form-data
    const formData = new FormData();

    formData.append('name', userData.username);
    formData.append('username', userData.username);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('password_confirmation', userData.confirmPassword);
    formData.append('province', userData.province);
    formData.append('district', userData.district);
    formData.append('municipality_id', userData.municipality);
    formData.append('ward_no', userData.ward);
    formData.append('street', userData.street);

    if (userData.profilePicture) {
      formData.append('profile_picture', userData.profilePicture);
    }

    if (userData.interests && Array.isArray(userData.interests)) {
      userData.interests.forEach(interest => {
        formData.append('interests[]', interest);
      });
    }



    const response = await apiRequest("/register", {
      method: "POST",
      body: formData, // apiRequest handles FormData
    });

    // Save token and user data if registration successful
    const token = response.token || (response.data && response.data.token);
    if (token) {
      localStorage.setItem("token", token);
    }

    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response;
  },

  // Login
  login: async (credentials) => {
    const response = await apiRequest("/login", {
      method: "POST",
      body: credentials, // apiRequest handles JSON.stringify
    });

    // Save token and user data if login successful
    const token = response.token || (response.data && response.data.token);
    if (token) {
      localStorage.setItem("token", token);
    }

    // Save user data from response.data
    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response;
  },

  // Forgot Password
  forgotPassword: async (email) => {
    return await apiRequest("/password/forgot", {
      method: "POST",
      body: { email },
    });
  },

  // Resend Verification Email
  resendVerification: async (email) => {
    return await apiRequest("/email/resend", {
      method: "POST",
      body: { email },
    });
  },

  // Verify Phone
  verifyPhone: async (phone) => {
    return await apiRequest("/phone/verify", {
      method: "POST",
      body: { phone_no: phone },
    });
  },

  // Reset Password (with token)
  resetPassword: async (data) => {
    return await apiRequest("/password/reset", {
      method: "POST",
      body: data,
    });
  },

  // Update Password (logged in)
  updatePassword: async (data) => {
    return await apiRequest("/password/update", {
      method: "POST",
      body: data,
    });
  },

  // Logout
  logout: async () => {
    try {
      await apiRequest("/logout", { method: "POST" });
    } catch (error) {
      // Logout error
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  }
};
