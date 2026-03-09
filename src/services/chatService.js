import API from "../utils/api";

const sendMessage = async (message) => {
    try {
        const response = await API.post("/chat", {
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
