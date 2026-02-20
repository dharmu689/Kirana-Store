import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const getReorderItems = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.get(
        `${API}/api/reorder`,
        config
    );

    return response.data;
};

const restockProduct = async (id, quantity, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.put(
        `${API}/api/reorder/restock/${id}`,
        { quantity },
        config
    );

    return response.data;
};

const reorderService = {
    getReorderItems,
    restockProduct,
};

export default reorderService;




// import axios from 'axios';

// const API_URL = 'http://localhost:5000/api/reorder';

// const getReorderItems = async (token) => {
//     const config = {
//         headers: {
//             Authorization: `Bearer ${token}`,
//         },
//     };

//     const response = await axios.get(API_URL, config);
//     return response.data;
// };

// const restockProduct = async (id, quantity, token) => {
//     const config = {
//         headers: {
//             Authorization: `Bearer ${token}`,
//         },
//     };

//     const response = await axios.put(`${API_URL}/restock/${id}`, { quantity }, config);
//     return response.data;
// };

// const reorderService = {
//     getReorderItems,
//     restockProduct,
// };

// export default reorderService;
