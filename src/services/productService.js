import axios from 'axios';

const API_URL = 'http://localhost:5000/api/products';
const CATEGORY_API_URL = 'http://localhost:5000/api/categories';

// Helper to get auth header
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` };
    }
    return {};
};

// Updated to accept query params
const getProducts = async (params = {}) => {
    const config = {
        headers: getAuthHeader(),
        params: params, // Axios handles object to query string conversion
    };
    const response = await axios.get(API_URL, config);
    return response.data;
};

const createProduct = async (productData) => {
    const config = {
        headers: getAuthHeader(),
    };
    const response = await axios.post(API_URL, productData, config);
    return response.data;
};

const updateProduct = async (id, productData) => {
    const config = {
        headers: getAuthHeader(),
    };
    const response = await axios.put(`${API_URL}/${id}`, productData, config);
    return response.data;
};

const deleteProduct = async (id) => {
    const config = {
        headers: getAuthHeader(),
    };
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
};

const adjustStock = async (id, adjustment) => {
    const config = {
        headers: getAuthHeader(),
    };
    const response = await axios.put(`${API_URL}/${id}/adjust`, { adjustment }, config);
    return response.data;
};

// Category Services
const getCategories = async () => {
    const config = {
        headers: getAuthHeader(),
    };
    const response = await axios.get(CATEGORY_API_URL, config);
    return response.data;
};

const createCategory = async (categoryData) => {
    const config = {
        headers: getAuthHeader(),
    };
    const response = await axios.post(CATEGORY_API_URL, categoryData, config);
    return response.data;
};

const deleteCategory = async (id) => {
    const config = {
        headers: getAuthHeader(),
    };
    const response = await axios.delete(`${CATEGORY_API_URL}/${id}`, config);
    return response.data;
};

const productService = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    getCategories,
    createCategory,
    deleteCategory
};

export default productService;
