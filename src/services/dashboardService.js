import axios from 'axios';

const API_URL = 'http://localhost:5000/api/dashboard';

// Helper to get auth header
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` };
    }
    return {};
};

const getSummary = async () => {
    const config = {
        headers: getAuthHeader(),
    };
    const response = await axios.get(`${API_URL}/summary`, config);
    return response.data;
};

const dashboardService = {
    getSummary
};

export default dashboardService;
