import API from "../utils/axiosConfig";

const getSummary = async () => {
    const response = await API.get("/dashboard/summary");
    return response.data;
};

const dashboardService = {
    getSummary
};

export default dashboardService;
