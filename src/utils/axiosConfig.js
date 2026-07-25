import axios from "axios";

let baseURL = import.meta.env.VITE_API_URL || "https://kirana-store-2ykl.onrender.com";
if (baseURL && !baseURL.endsWith('/api')) {
    baseURL += '/api';
}

const API = axios.create({
    baseURL,
});

API.interceptors.request.use((req) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.token) {
        req.headers.Authorization = `Bearer ${user.token}`;
    }
    return req;
});

// Response interceptor to handle 401 errors globally
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("user");
            const publicPaths = ["/", "/login", "/register", "/forgot-password", "/verify-otp", "/reset-password"];
            if (!publicPaths.includes(window.location.pathname)) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default API;
