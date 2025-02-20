import axiosSecure from "./axiosSecure";

// Function to get the user details
export const getUser = async () => {
    try {
        const response = await axiosSecure.get('/api/get-userdata');
        return response.data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
};