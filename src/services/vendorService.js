import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// Helper to get auth header
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.token) {
        return { Authorization: `Bearer ${user.token}` };
    }
    return {};
};

const getVendors = async () => {
    const response = await axios.get(`${API}/api/vendors`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

const vendorService = {
    getVendors,
};

export default vendorService;
