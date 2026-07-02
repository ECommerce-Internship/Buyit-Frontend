// What we POST to /api/v1/chat.
// conversationId is null on the very first message of a session; the backend then returns a real
// id which we send back on every subsequent message to keep the same conversation.
export interface ChatRequestBody {
    message: string;
    conversationId: string | null;
}

// What /api/v1/chat returns (matches the backend's ChatResponse).
export interface ChatResponse {
    reply: string;
    conversationId: string;
}

// One message as shown in the on-screen thread. 'user' = the person, 'bot' = the assistant.
// (This is a UI-only shape — the backend never sees it.)
export interface ChatMessage {
    role: 'user' | 'bot';
    text: string;
}
