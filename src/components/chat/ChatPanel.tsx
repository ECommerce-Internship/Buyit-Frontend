import { useState, useRef, useEffect, type KeyboardEvent, type CSSProperties } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';
import { sendChatMessage } from '../../api/chat';
import { BuyitBot } from './BuyitBot';
import type { ChatMessage } from '../../types/chat';

// --- Brand styling (dark violet-glass overlay + coral/violet gradients, now with a live bg) ---
const panelStyle: CSSProperties = {
    position: 'relative',
    width: '22rem',
    height: '32rem',
    display: 'flex',
    flexDirection: 'column',
    // Fully opaque so page content can't bleed through; the "alive" feel comes from the blobs.
    background: 'linear-gradient(168deg, #1b1832 0%, #0c0b18 100%)',
    border: '1px solid rgba(255,255,255,0.13)',
    borderRadius: 22,
    boxShadow: '0 40px 100px -30px rgba(124,58,237,0.55)',
    overflow: 'hidden',
    animation: 'fadeInScale .18s ease-out',
};

// A drifting, blurred glow orb — several of these float behind the content to keep it lively.
function blob(base: CSSProperties): CSSProperties {
    return { position: 'absolute', borderRadius: '50%', filter: 'blur(16px)', ...base };
}

const userBubble: CSSProperties = {
    alignSelf: 'flex-end',
    maxWidth: '82%',
    padding: '9px 13px',
    borderRadius: '14px 14px 4px 14px',
    fontSize: 13.5,
    lineHeight: 1.5,
    color: '#fff',
    background: 'linear-gradient(120deg,#ff8a4c,#ff4d6d)',
    boxShadow: '0 8px 20px -10px rgba(255,77,109,.7)',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
};

const botBubble: CSSProperties = {
    alignSelf: 'flex-start',
    maxWidth: '82%',
    padding: '9px 13px',
    borderRadius: '14px 14px 14px 4px',
    fontSize: 13.5,
    lineHeight: 1.5,
    color: '#eceaf2',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.09)',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
};

const dot: CSSProperties = { width: 6, height: 6, borderRadius: '50%', background: '#b9b4cc' };
const row: CSSProperties = { position: 'relative', zIndex: 1 };   // keeps content above the blobs

export function ChatPanel({ onClose }: { onClose: () => void }) {
    // --- State: everything the panel remembers between renders ---
    const [messages, setMessages] = useState<ChatMessage[]>([]);           // the on-screen thread
    const [conversationId, setConversationId] = useState<string | null>(null); // session thread id
    const [input, setInput] = useState('');                                // the text box contents
    const [isLoading, setIsLoading] = useState(false);                     // true while awaiting a reply

    // A handle to an empty div at the bottom of the thread, used to auto-scroll into view.
    const bottomRef = useRef<HTMLDivElement>(null);
    // A handle to the text input so we can move focus into it when the panel opens (a11y).
    const inputRef = useRef<HTMLInputElement>(null);

    // Move keyboard focus into the input as soon as the panel opens.
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // After every render where messages or loading changed, scroll the newest into view.
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Send the current input to the backend.
    async function handleSend() {
        const text = input.trim();
        if (text === '' || isLoading) return;   // ignore empty sends and double-sends

        // Optimistic UI: show the user's message immediately, clear the box, start loading.
        setMessages((prev) => [...prev, { role: 'user', text }]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await sendChatMessage({ message: text, conversationId });
            setConversationId(res.conversationId);   // first reply sets it; keep it after
            setMessages((prev) => [...prev, { role: 'bot', text: res.reply }]);
        } catch (err) {
            // Map each failure to a clear toast (AC #5).
            let message = 'Something went wrong. Please try again.';
            if (axios.isAxiosError(err)) {
                if (!err.response) message = 'Could not reach the server. Check your connection.';
                else if (err.response.status === 429) message = 'The assistant is busy — please wait a moment and try again.';
                else if (err.response.status === 401) message = 'Your session has expired. Please sign in again.';
            }
            toast.error(message);
        } finally {
            setIsLoading(false);   // always stop loading, success or failure
        }
    }

    // Enter sends the message — but NOT while an IME composition is in progress (CJK input).
    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSend();
    }

    // Escape closes the panel (and returns focus to the launcher — handled by the parent).
    function handlePanelKeyDown(e: KeyboardEvent<HTMLDivElement>) {
        if (e.key === 'Escape') onClose();
    }

    const canSend = !isLoading && input.trim() !== '';

    return (
        <div style={panelStyle} role="dialog" aria-label="Buyit Assistant" onKeyDown={handlePanelKeyDown}>
            {/* Alive background: slow-drifting neon glow orbs behind everything (decorative). */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
                <div style={blob({ top: -34, left: -24, width: 150, height: 150, background: 'radial-gradient(circle, rgba(139,92,246,.5), transparent 70%)', animation: 'blobDrift 11s ease-in-out infinite' })} />
                <div style={blob({ bottom: 30, right: -30, width: 170, height: 170, background: 'radial-gradient(circle, rgba(255,77,109,.38), transparent 70%)', animation: 'blobDrift 15s ease-in-out infinite reverse' })} />
                <div style={blob({ top: '42%', left: '32%', width: 130, height: 130, background: 'radial-gradient(circle, rgba(93,242,255,.22), transparent 70%)', animation: 'blobDrift 18s ease-in-out infinite' })} />
            </div>

            {/* Header */}
            <div style={{ ...row, display: 'flex', alignItems: 'center', gap: 11, padding: '15px 17px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(125% 125% at 30% 22%, #38345a, #0d0c1a)', border: '1px solid rgba(120,240,255,.4)', boxShadow: '0 0 14px -3px rgba(93,242,255,.5)' }}>
                    <BuyitBot size={26} />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontFamily: 'Outfit', fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>Buyit Assistant</h2>
                    <p style={{ margin: 0, fontSize: 11.5, color: '#9b95b4' }}>Ask about products, your cart, or orders</p>
                </div>
            </div>

            {/* Scrollable message thread (announced to screen readers as replies arrive) */}
            <div aria-live="polite" style={{ ...row, flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {messages.length === 0 && (
                    <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '88%' }}>
                        {/* The same bot, sneaking in to greet the user. */}
                        <div className="bot-sneak" style={{ marginBottom: 6 }}>
                            <BuyitBot size={78} />
                        </div>
                        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: '#8b86a3' }}>
                            👋 Hi! I'm your shopping assistant. Ask me to find products, check your cart, or look up one of your orders.
                        </p>
                    </div>
                )}

                {messages.map((m, i) => (
                    <div key={i} style={m.role === 'user' ? userBubble : botBubble}>{m.text}</div>
                ))}

                {isLoading && (
                    <div style={{ ...botBubble, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ ...dot, animation: 'bpulse 1s ease-in-out infinite' }} />
                        <span style={{ ...dot, animation: 'bpulse 1s ease-in-out .2s infinite' }} />
                        <span style={{ ...dot, animation: 'bpulse 1s ease-in-out .4s infinite' }} />
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input row */}
            <div style={{ ...row, display: 'flex', gap: 8, padding: 12, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <input
                    ref={inputRef}
                    className="buyit-input"
                    type="text"
                    aria-label="Message the assistant"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message…"
                    disabled={isLoading}
                    style={{ flex: 1, padding: '10px 13px', fontFamily: 'inherit', fontSize: 13.5, color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, outline: 'none', opacity: isLoading ? 0.6 : 1 }}
                />
                <button
                    onClick={handleSend}
                    disabled={!canSend}
                    aria-label="Send message"
                    className="transition-transform hover:scale-105 active:scale-95"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 42, border: 'none', borderRadius: 12, color: '#fff', cursor: canSend ? 'pointer' : 'not-allowed', background: 'linear-gradient(120deg,#8b5cf6,#6366f1)', boxShadow: '0 8px 20px -8px rgba(124,58,237,.7)', opacity: canSend ? 1 : 0.5 }}
                >
                    <Send size={17} />
                </button>
            </div>
        </div>
    );
}
