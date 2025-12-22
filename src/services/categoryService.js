import apiRequest from "./api";

export const categoryService = {
    // Get all categories (Reverted to GET as requested, supports pagination)
    // Get all categories (Public resource endpoint)
    getCategories: async (params = {}) => {
        const response = await apiRequest("/resources/categories", {
            method: "GET",
            body: params
        });
        return response;
    },

    // Get individual category details (GET)
    getCategory: async (id) => {
        const response = await apiRequest(`/category/${id}`, {
            method: "GET",
        });
        return response;
    },

    // Update category (POST)
    updateCategory: async (id, data) => {
        const response = await apiRequest(`/category/${id}`, {
            method: "POST",
            body: data,
        });
        return response;
    },

    // Delete category
    deleteCategory: async (id) => {
        const response = await apiRequest(`/category/${id}`, {
            method: "DELETE",
        });
        return response;
    },

    // Create category (supports bulk format as required by backend)
    createCategory: async (categoryData) => {
        const response = await apiRequest("/category", {
            method: "POST",
            body: {
                categories: [categoryData]
            },
        });
        return response;
    },
};
