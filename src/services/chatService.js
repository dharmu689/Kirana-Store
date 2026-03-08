import axios from "axios";

const API_URL = "https://kirana-store-2ykl.onrender.com/api/chat";

const sendMessage = async (message) => {
    try {
        const response = await axios.post(API_URL, {
            message: message
        });
        // The previous AIChatAssistant depends on `{ reply: "string" }` or returning the object
        // For safety, return the exact data object { reply: string }
        return response.data;
    } catch (error) {
        console.error("Chat API error:", error);
        return { reply: "Server connection failed" };
    }
};

const chatService = {
    sendMessage
};

export default chatService;
