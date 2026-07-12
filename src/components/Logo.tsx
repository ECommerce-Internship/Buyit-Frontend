// src/components/Logo.tsx
import { Link } from 'react-router-dom';
import logo from '../assets/buyit-logo.png';
interface LogoProps {
    /** Pixel height of the wordmark image. Default 36. */
    height?: number;
    /**
     * Where clicking the logo navigates. Default "/".
     * Pass `null` to render the logo with no link (e.g. inside another link).
     */
    to?: string | null;
    /** Extra classes applied to the image. */
    className?: string;
}

/**
 * The Buyit brand mark. The source artwork is cropped tight with a transparent
 * background, so it's rendered directly with no wrapping badge — it reads
 * cleanly on both light pages (e.g. the auth screens) and dark sections
 * (e.g. the landing nav) on its own.
 * Use this everywhere instead of dropping the <img> in by hand.
 */
export default function Logo({ height = 36, to = '/', className = '' }: LogoProps) {
    const image = (
        <img
            src={logo}
            alt="Buyit — Multi-Seller E-commerce Marketplace"
            style={{ height }}
            className={`block w-auto select-none ${className}`}
            draggable={false}
        />
    );

    if (to === null) return image;

    return (
        <Link
            to={to}
            aria-label="Buyit home"
            className="inline-flex rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
            {image}
        </Link>
    );
}
