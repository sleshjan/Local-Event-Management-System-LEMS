import apiRequest from "./api";

export const locationService = {
    // Get all addresses (Province -> District -> Municipality hierarchy)
    getAddresses: async () => {
        const response = await apiRequest("/resources/address", {
            method: "GET",
        });
        // The API returns { message: "...", data: [...] } or just [...]
        // We'll normalize it to return the array of provinces
        if (response.data && Array.isArray(response.data)) {
            return response.data;
        } else if (Array.isArray(response)) {
            return response;
        }
        return [];
    },
};
