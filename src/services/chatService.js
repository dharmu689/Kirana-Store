import API from '../utils/axiosConfig';

const sendMessage = async (message) => {
    const response = await API.post('/chat', { message });
    return response.data;
};

const chatService = {
    sendMessage
};

export default chatService;
