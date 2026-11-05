import { cn } from '../../lib/cn';

interface BrandMarkProps {
  size?: number;
  className?: string;
}

export function BrandMark({ size = 32, className }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn('brand-mark', className)}
    >
      <rect width="32" height="32" rx="9" fill="var(--primary)" />
      <path
        d="M8.4 22.1V10.3l7.6 6.3 7.6-6.3v11.8"
        stroke="var(--on-primary)"
        strokeWidth="2.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8.4" cy="10.2" r="1.55" fill="var(--on-primary)" />
      <circle cx="23.6" cy="10.2" r="1.55" fill="var(--on-primary)" />
    </svg>
  );
}

interface LogoProps {
  compact?: boolean;
  className?: string;
}

export function Logo({ compact = false, className }: LogoProps) {
  return (
    <span className={cn('brand', compact && 'brand--compact', className)}>
      <BrandMark />
      {!compact && (
        <span className="brand-copy">
          <span className="brand-name">Messthon</span>
          <span className="brand-tagline">multi-protocol</span>
        </span>
      )}
    </span>
  );
}
