import apiRequest from "./api";

export const organizerService = {
    // Submit organizer request
    createRequest: async (data) => {
        return await apiRequest("/organizer-request", {
            method: "POST",
            body: data,
        });
    },

    // Get specific request status
    getRequest: async (id) => {
        return await apiRequest(`/organizer-request/${id}`);
    },

    // Get all requests (for admin or user history)
    getAllRequests: async () => {
        return await apiRequest("/organizer-request");
    },

    // Get user's own requests
    getMyRequests: async () => {
        return await apiRequest("/organizer-request/my");
    },

    // Reject request (admin)
    rejectRequest: async (id, rejectionReason) => {
        return await apiRequest(`/organizer-request/${id}/reject`, {
            method: "POST",
            body: { rejection_reason: rejectionReason },
        });
    },

    // Approve request (admin)
    approveRequest: async (id) => {
        return await apiRequest(`/organizer-request/${id}/approve`, {
            method: "POST",
        });
    },
};
