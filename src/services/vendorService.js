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

const addVendor = async (vendorData) => {
    const response = await axios.post(`${API}/api/vendors`, vendorData, {
        headers: getAuthHeader(),
    });
    return response.data;
};

const updateVendor = async (id, vendorData) => {
    const response = await axios.put(`${API}/api/vendors/${id}`, vendorData, {
        headers: getAuthHeader(),
    });
    return response.data;
};

const deleteVendor = async (id) => {
    const response = await axios.delete(`${API}/api/vendors/${id}`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

const vendorService = {
    getVendors,
    addVendor,
    updateVendor,
    deleteVendor
};

export default vendorService;
