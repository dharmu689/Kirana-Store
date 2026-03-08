import API from "../utils/axiosConfig";

const getSummary = async () => {
    const response = await API.get("/dashboard/summary");
    return response.data;
};

const getDashboardProfit = async () => {
    const response = await API.get("/dashboard/profit");
    return response.data;
};

const getTopProducts = async () => {
    const response = await API.get("/dashboard/top-products");
    return response.data;
};

const getLowSellingProducts = async () => {
    const response = await API.get("/dashboard/low-selling-products");
    return response.data;
};

const getProfitChartData = async (period = '1year') => {
    const response = await API.get(`/dashboard/profit-chart?period=${period}`);
    return response.data;
};

const dashboardService = {
    getSummary,
    getDashboardProfit,
    getTopProducts,
    getLowSellingProducts,
    getProfitChartData
};

export default dashboardService;
