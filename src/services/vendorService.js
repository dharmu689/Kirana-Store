import API from "../utils/axiosConfig";

const getVendors = async () => {
    const response = await API.get("/vendors");
    return response.data;
};

const addVendor = async (vendorData) => {
    const response = await API.post("/vendors", vendorData);
    return response.data;
};

const updateVendor = async (id, vendorData) => {
    const response = await API.put(`/vendors/${id}`, vendorData);
    return response.data;
};

const deleteVendor = async (id) => {
    const response = await API.delete(`/vendors/${id}`);
    return response.data;
};

const getBestVendorsForProduct = async (productId) => {
    const response = await API.get(`/vendors/best/${productId}`);
    return response.data;
};

const vendorService = {
    getVendors,
    addVendor,
    updateVendor,
    deleteVendor,
    getBestVendorsForProduct
};

export default vendorService;
