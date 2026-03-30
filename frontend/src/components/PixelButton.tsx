import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_STYLES: Record<Variant, string> = {
  primary:
    'bg-orange border-brown-dark text-cream hover:-translate-y-0.5 hover:shadow-pixel-hover active:translate-y-0 active:shadow-pixel-sm',
  secondary:
    'bg-cream-dark border-brown text-brown-dark hover:-translate-y-0.5 hover:shadow-pixel-hover active:translate-y-0 active:shadow-pixel-sm',
  danger:
    'bg-red-500 border-red-700 text-white hover:-translate-y-0.5 hover:shadow-pixel-hover active:translate-y-0 active:shadow-pixel-sm',
};

export default function PixelButton({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: PixelButtonProps) {
  return (
    <button
      className={`border-4 px-4 sm:px-6 py-3 font-pixel text-xs shadow-pixel transition-all min-h-[48px] disabled:opacity-50 disabled:pointer-events-none ${VARIANT_STYLES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
