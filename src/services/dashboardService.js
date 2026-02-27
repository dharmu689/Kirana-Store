import API from "../utils/axiosConfig";

const getSummary = async () => {
    const response = await API.get("/dashboard/summary");
    return response.data;
};

const getDashboardProfit = async () => {
    const response = await API.get("/dashboard/profit");
    return response.data;
};

const dashboardService = {
    getSummary,
    getDashboardProfit
};

export default dashboardService;
