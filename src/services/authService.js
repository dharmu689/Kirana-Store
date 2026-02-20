import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// Create axios instance
const axiosInstance = axios.create({
    baseURL: `${API}/api`,
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            logout();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// Register user
const register = async (userData) => {
    const response = await axiosInstance.post("/auth/register", userData);

    if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
};

// Login user
const login = async (userData) => {
    const response = await axiosInstance.post("/auth/login", userData);

    if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
};

// Logout user
const logout = () => {
    localStorage.removeItem("user");
};

// Get current user
const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("user"));
};

// Get profile
const getProfile = async () => {
    const response = await axiosInstance.get("/auth/profile");
    return response.data;
};

const authService = {
    register,
    login,
    logout,
    getCurrentUser,
    getProfile,
};

export default authService;

















// import axios from 'axios';

// const API_URL = 'http://localhost:5000/api/auth/';

// // Create axios instance with interceptor
// const axiosInstance = axios.create({
//     baseURL: 'http://localhost:5000/api',
// });

// // Request interceptor to add token
// axiosInstance.interceptors.request.use(
//     (config) => {
//         const user = JSON.parse(localStorage.getItem('user'));
//         if (user && user.token) {
//             config.headers.Authorization = `Bearer ${user.token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// // Response interceptor to handle 401s
// axiosInstance.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response && error.response.status === 401) {
//             logout();
//             window.location.href = '/login';
//         }
//         return Promise.reject(error);
//     }
// );

// // Register user
// const register = async (userData) => {
//     const response = await axios.post(API_URL + 'register', userData);

//     if (response.data) {
//         localStorage.setItem('user', JSON.stringify(response.data));
//     }

//     return response.data;
// };

// // Login user
// const login = async (userData) => {
//     const response = await axios.post(API_URL + 'login', userData);

//     if (response.data) {
//         localStorage.setItem('user', JSON.stringify(response.data));
//     }

//     return response.data;
// };

// // Logout user
// const logout = () => {
//     localStorage.removeItem('user');
// };

// // Get current user (from localStorage)
// const getCurrentUser = () => {
//     return JSON.parse(localStorage.getItem('user'));
// };

// // Get user profile (from API)
// const getProfile = async () => {
//     const response = await axiosInstance.get('/auth/profile');
//     return response.data;
// };

// const authService = {
//     register,
//     login,
//     logout,
//     getCurrentUser,
//     getProfile,
// };

// export default authService;
