import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ChatPanel } from './ChatPanel';
import { BuyitBot } from './BuyitBot';

export function ChatWidget() {
    const { isAuthenticated } = useAuth();   // only logged-in users get the assistant
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);   // so we can restore focus when closing

    // Render nothing for signed-out visitors (AC #1: logged-in users only).
    if (!isAuthenticated) return null;

    // Close the panel and return keyboard focus to the launcher button (a11y).
    function close() {
        setIsOpen(false);
        buttonRef.current?.focus();
    }

    return (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
            {isOpen && <ChatPanel onClose={close} />}

            <button
                ref={buttonRef}
                onClick={() => setIsOpen((open) => !open)}
                aria-label={isOpen ? 'Close chat' : 'Open chat assistant'}
                aria-expanded={isOpen}
                className="bot-fab-btn"
                style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#dfe6f2',
                    cursor: 'pointer',
                    background: 'radial-gradient(125% 125% at 30% 22%, #38345a, #0d0c1a)',
                }}
            >
                {/* The bot idles, and jumps with excitement on hover (see .bot-fab in index.css). */}
                <span className="bot-fab">
                    {isOpen ? <X size={26} /> : <BuyitBot size={40} />}
                </span>
            </button>
        </div>
    );
}
