import { useId } from 'react';

// A cute silver robot with a neon-cyan contour + glow. Reused as the launcher (large),
// the header avatar (small) and the in-panel companion (medium) so it's always "the same bot".
// useId() keeps the SVG gradient/filter ids unique when several bots render at once.
export function BuyitBot({ size = 56 }: { size?: number }) {
    const id = useId();
    const silver = `bot-silver-${id}`;
    const glow = `bot-glow-${id}`;

    return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <defs>
                <linearGradient id={silver} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f7f9fd" />
                    <stop offset="0.5" stopColor="#d4dae7" />
                    <stop offset="1" stopColor="#a7b0c4" />
                </linearGradient>
                <filter id={glow} x="-60%" y="-60%" width="220%" height="220%">
                    <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#5df2ff" floodOpacity="0.9" />
                </filter>
            </defs>

            <g filter={`url(#${glow})`}>
                {/* antenna */}
                <line x1="32" y1="13" x2="32" y2="6" stroke="#5df2ff" strokeWidth="2" strokeLinecap="round" />
                <circle cx="32" cy="5" r="3" fill="#5df2ff" />

                {/* ears */}
                <rect x="7" y="26" width="6" height="12" rx="3" fill={`url(#${silver})`} stroke="#5df2ff" strokeWidth="1.4" />
                <rect x="51" y="26" width="6" height="12" rx="3" fill={`url(#${silver})`} stroke="#5df2ff" strokeWidth="1.4" />

                {/* head */}
                <rect x="12" y="13" width="40" height="39" rx="14" fill={`url(#${silver})`} stroke="#5df2ff" strokeWidth="2" />

                {/* face screen */}
                <rect x="17" y="20" width="30" height="23" rx="10" fill="#101120" opacity="0.9" />

                {/* eyes */}
                <circle cx="25" cy="30" r="4" fill="#5df2ff" />
                <circle cx="39" cy="30" r="4" fill="#5df2ff" />
                <circle cx="26.4" cy="28.6" r="1.2" fill="#ffffff" />
                <circle cx="40.4" cy="28.6" r="1.2" fill="#ffffff" />

                {/* smile */}
                <path d="M26 36 Q32 40.5 38 36" stroke="#5df2ff" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>
        </svg>
    );
}
