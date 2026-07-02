import axiosInstance from './axiosInstance';
import type { ChatRequestBody, ChatResponse } from '../types/chat';

// Send one chat message. The shared axiosInstance automatically attaches the JWT bearer token,
// so we don't set any headers here. Throws an AxiosError on network/HTTP failures (the caller
// catches it and shows a toast).
export async function sendChatMessage(body: ChatRequestBody): Promise<ChatResponse> {
    const res = await axiosInstance.post<ChatResponse>('/api/v1/chat', body);
    return res.data;
}
