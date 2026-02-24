import axios from "axios";

let baseURL = import.meta.env.VITE_API_URL || "";
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

export default API;
