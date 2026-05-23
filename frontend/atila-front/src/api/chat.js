import { api } from './authService';

export const chatService = {
    async sendMessage(sessionId, message) {
        try {
            const response = await api.post('ai/chat/', {
                session_id: sessionId,
                message: message
            });
            return response.data;
        } catch (error) {
            console.error('Error in chat service:', error);
            throw error;
        }
    }
};
