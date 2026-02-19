import axios from 'axios';

const API_URL = 'http://localhost:5000/api/sales';

// Create new sale
const createSale = async (saleData) => {
    const response = await axios.post(API_URL, saleData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : ''}`
        }
    });
    return response.data;
};

// Get all sales
const getSales = async () => {
    const response = await axios.get(API_URL, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : ''}`
        }
    });
    return response.data;
};

// Get sales summary
const getSalesSummary = async () => {
    const response = await axios.get(`${API_URL}/summary`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : ''}`
        }
    });
    return response.data;
};

const salesService = {
    createSale,
    getSales,
    getSalesSummary
};

export default salesService;
