import React from 'react';

/**
 * Lightweight inline SVG icons (lucide-style, stroke-based).
 * Replaces all emoji / character glyphs in the welcome page & carousels.
 * Usage: <Icon.Overview size={24} /> or import { Icon } from '@site/src/components/icons';
 */

type IconProps = {
    size?: number;
    className?: string;
    strokeWidth?: number;
};

const base = (size: number, className?: string) => ({
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
});

export const Icon = {
    // ─── Platform cards ───
    Hardware: ({ size = 22, className, strokeWidth = 1.8 }: IconProps & { strokeWidth?: number }) => (
        <svg {...base(size, className)} strokeWidth={strokeWidth}>
            <rect x="3" y="4" width="18" height="6" rx="1" />
            <rect x="3" y="14" width="18" height="6" rx="1" />
            <path d="M7 7h.01M7 17h.01" />
            <path d="M11 7h6M11 17h6" />
        </svg>
    ),
    OS: ({ size = 22, className }: IconProps) => (
        <svg {...base(size, className)}>
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
        </svg>
    ),
    AITools: ({ size = 22, className }: IconProps) => (
        <svg {...base(size, className)}>
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <rect x="9" y="9" width="6" height="6" />
            <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
        </svg>
    ),
    EdgeRuntime: ({ size = 22, className }: IconProps) => (
        <svg {...base(size, className)}>
            <path d="M13 2 4 14h7l-2 8 9-12h-7l2-8z" />
        </svg>
    ),
    Connectivity: ({ size = 22, className }: IconProps) => (
        <svg {...base(size, className)}>
            <path d="M5 12.55a11 11 0 0 1 14 0" />
            <path d="M8.5 16.1a6 6 0 0 1 7 0" />
            <path d="M2 8.82a15 15 0 0 1 20 0" />
            <path d="M12 20h.01" />
        </svg>
    ),

    // ─── ProductCarousel resource links ───
    Overview: ({ size = 18, className }: IconProps) => (
        <svg {...base(size, className)}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M16 13H8M16 17H8M10 9H8" />
        </svg>
    ),
    Quickstart: ({ size = 18, className }: IconProps) => (
        <svg {...base(size, className)}>
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
    ),
    UserGuide: ({ size = 18, className }: IconProps) => (
        <svg {...base(size, className)}>
            <path d="M2 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2zM22 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z" />
        </svg>
    ),
    DevGuide: ({ size = 18, className }: IconProps) => (
        <svg {...base(size, className)}>
            <path d="m16 18 6-6-6-6" />
            <path d="m8 6-6 6 6 6" />
        </svg>
    ),
    HwGuide: ({ size = 18, className }: IconProps) => (
        <svg {...base(size, className)}>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        </svg>
    ),
    SwGuide: ({ size = 18, className }: IconProps) => (
        <svg {...base(size, className)}>
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4M7 9l3 3-3 3M17 9l-3 3 3 3" />
        </svg>
    ),
    AppGuide: ({ size = 18, className }: IconProps) => (
        <svg {...base(size, className)}>
            <path d="M9 18h6M10 21h4" />
            <path d="M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 3z" />
        </svg>
    ),
    UseCases: ({ size = 18, className }: IconProps) => (
        <svg {...base(size, className)}>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    ),

    // ─── Community cards ───
    Discord: ({ size = 40, className }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3c-.2.36-.43.84-.59 1.23-1.61-.24-3.22-.24-4.8 0-.16-.39-.4-.87-.6-1.23a19.7 19.7 0 0 0-3.76 1.37C2.46 9.04 1.7 13.58 2.04 18.06a19.9 19.9 0 0 0 6.02 3.05c.49-.66.92-1.36 1.29-2.1-.71-.27-1.39-.6-2.03-.99.17-.13.34-.26.5-.4 3.92 1.82 8.16 1.82 12.04 0 .17.14.33.27.5.4-.65.39-1.33.72-2.04.99.37.74.8 1.44 1.29 2.1a19.8 19.8 0 0 0 6.02-3.05c.43-5.2-.74-9.7-3.31-13.69zM8.02 15.33c-1.18 0-2.15-1.08-2.15-2.4 0-1.32.95-2.4 2.15-2.4 1.2 0 2.17 1.08 2.15 2.4 0 1.32-.95 2.4-2.15 2.4zm7.96 0c-1.18 0-2.15-1.08-2.15-2.4 0-1.32.95-2.4 2.15-2.4 1.2 0 2.17 1.08 2.15 2.4 0 1.32-.95 2.4-2.15 2.4z" />
        </svg>
    ),
    Mail: ({ size = 40, className }: IconProps) => (
        <svg {...base(size, className)}>
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-10 6L2 7" />
        </svg>
    ),
    Github: ({ size = 40, className }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
    ),

    // ─── Arrows & chevrons ───
    ArrowRight: ({ size = 18, className }: IconProps) => (
        <svg {...base(size, className)}>
            <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
    ),
    ChevronLeft: ({ size = 28, className }: IconProps) => (
        <svg {...base(size, className)}>
            <path d="m15 18-6-6 6-6" />
        </svg>
    ),
    ChevronRight: ({ size = 28, className }: IconProps) => (
        <svg {...base(size, className)}>
            <path d="m9 18 6-6-6-6" />
        </svg>
    ),
};

export type IconName = keyof typeof Icon;
export default Icon;
