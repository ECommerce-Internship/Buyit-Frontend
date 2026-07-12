// src/components/Logo.tsx
import { Link } from 'react-router-dom';
import logo from '../assets/buyit-logo.png';
interface LogoProps {
    /** Pixel height of the wordmark image. Default 36. */
    height?: number;
    /**
     * Where clicking the logo navigates. Default "/".
     * Pass `null` to render the badge with no link (e.g. inside another link).
     */
    to?: string | null;
    /** Extra classes applied to the badge wrapper. */
    className?: string;
}

/**
 * The Buyit brand mark. The source artwork ships on its native near-black
 * background, so we sit it on a matching dark rounded "badge": the image's
 * rectangular edges blend into the badge, which keeps it looking clean on both
 * light pages (e.g. the auth screens) and dark sections (e.g. the landing nav).
 * Use this everywhere instead of dropping the <img> in by hand.
 */
export default function Logo({ height = 36, to = '/', className = '' }: LogoProps) {
    const badge = (
        <span
            className={`inline-flex items-center rounded-xl bg-[#0d0e14] px-3 py-1.5 ring-1 ring-white/10 ${className}`}
        >
            <img
                src={logo}
                alt="Buyit — Multi-Seller E-commerce Marketplace"
                style={{ height }}
                className="block w-auto select-none"
                draggable={false}
            />
        </span>
    );

    if (to === null) return badge;

    return (
        <Link
            to={to}
            aria-label="Buyit home"
            className="inline-flex rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
            {badge}
        </Link>
    );
}
