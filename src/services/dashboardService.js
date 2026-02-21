import API from "../utils/axiosConfig";

const getSummary = async () => {
    const response = await API.get("/dashboard/summary");
    return response.data;
};

const getAnalytics = async () => {
    const response = await API.get("/dashboard/analytics");
    return response.data;
};

const getSalesTrend = async () => {
    const response = await API.get("/dashboard/sales-trend");
    return response.data;
};

const getInventoryHealth = async () => {
    const response = await API.get("/dashboard/inventory-health");
    return response.data;
};

const dashboardService = {
    getSummary,
    getAnalytics,
    getSalesTrend,
    getInventoryHealth,
};

export default dashboardService;



// import axios from 'axios';

// const API_URL = 'http://localhost:5000/api/dashboard';

// // Helper to get auth header
// const getAuthHeader = () => {
//     const user = JSON.parse(localStorage.getItem('user'));
//     if (user && user.token) {
//         return { Authorization: `Bearer ${user.token}` };
//     }
//     return {};
// };

// const getSummary = async () => {
//     const config = {
//         headers: getAuthHeader(),
//     };
//     const response = await axios.get(`${API_URL}/summary`, config);
//     return response.data;
// };

// const dashboardService = {
//     getSummary
// };

// export default dashboardService;
