import apiRequest from "./api";

export const authService = {

  // Register
  register: async (userData) => {
    // Map form data to API expected format
   const apiData = {
      name: userData.username,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      password_confirmation: userData.confirmPassword,
      province: userData.province,
      district: userData.district,
      municipality_id: userData.municipality, // ← Changed from municipality
      ward_no: userData.ward, // ← Changed from ward
      street: userData.street,
      profile_picture: null, // ← API requires this (you can make it optional later)
      interests: [], // ← API requires this (empty for now, will be filled in select-interests page)
    };
    const response = await apiRequest("/register", {
      method: "POST",
      body: JSON.stringify(apiData),
    });

    // Save token and user data if registration successful
    if (response.token) {
      localStorage.setItem("token", response.token);
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
      body: JSON.stringify(credentials),
    });

    // Save token and user data if login successful
    if (response.token) {
      localStorage.setItem("token", response.token);
    }

    // Save user data from response.data
    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response;
  },

  // Logout
  logout: async () => {
    await apiRequest("/logout", { method: "POST" });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};
