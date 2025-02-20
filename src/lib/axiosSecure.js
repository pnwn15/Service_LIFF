// axiosInstance.js
import axios from 'axios';
import Cookies from 'js-cookie'; // Make sure to install js-cookie

const axiosSecure = axios.create({
    baseURL: process.env.API_URL, // Set your API base URL here
});

// Function to get the Bearer token from cookies
const getBearerToken = () => {
    return Cookies.get('token'); // Replace 'token' with your actual cookie name
};

// Interceptor to add the Authorization header
axiosSecure.interceptors.request.use(
    (config) => {
        const token = getBearerToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosSecure;
