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

    // Reject request (admin)
    rejectRequest: async (id, rejectionReason) => {
        return await apiRequest(`/organizer-request/${id}/reject`, {
            method: "POST",
            body: { rejection_reason: rejectionReason },
        });
    },
};
