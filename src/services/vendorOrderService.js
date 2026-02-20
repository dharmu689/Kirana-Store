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

const placeOrder = async (orderData) => {
    const response = await axios.post(`${API}/api/vendor-orders`, orderData, {
        headers: getAuthHeader(),
    });
    return response.data;
};

const getOrders = async () => {
    const response = await axios.get(`${API}/api/vendor-orders`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

const updateOrderStatus = async (id, status) => {
    const response = await axios.put(
        `${API}/api/vendor-orders/${id}/status`,
        { status },
        { headers: getAuthHeader() }
    );
    return response.data;
};

const vendorOrderService = {
    placeOrder,
    getOrders,
    updateOrderStatus,
};

export default vendorOrderService;
