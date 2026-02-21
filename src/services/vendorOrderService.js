import API from "../utils/axiosConfig";

const placeOrder = async (orderData) => {
    const response = await API.post("/vendor-orders", orderData);
    return response.data;
};

const getOrders = async () => {
    const response = await API.get("/vendor-orders");
    return response.data;
};

const updateOrderStatus = async (id, status) => {
    const response = await API.put(`/vendor-orders/${id}/status`, { status });
    return response.data;
};

const vendorOrderService = {
    placeOrder,
    getOrders,
    updateOrderStatus,
};

export default vendorOrderService;
