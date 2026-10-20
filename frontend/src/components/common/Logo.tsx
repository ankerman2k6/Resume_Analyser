import React from 'react';

export type LogoVariant = 'light' | 'dark';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  iconOnly?: boolean;
  withoutIcon?: boolean;
  withBackground?: boolean;
  alt?: string;
}

const SIZE_MAP: Record<LogoSize, { width: number; height: number }> = {
  xs: { width: 80, height: 20 },
  sm: { width: 104, height: 24 },
  md: { width: 132, height: 30 },
  lg: { width: 168, height: 38 },
  xl: { width: 208, height: 46 },
  '2xl': { width: 256, height: 56 },
};

export const Logo: React.FC<LogoProps> = ({
  variant,
  size = 'md',
  className = '',
  iconOnly = false,
  alt = 'KONEK',
}) => {
  const [isDarkMode, setIsDarkMode] = React.useState(
    typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark',
  );

  React.useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => setIsDarkMode(root.dataset.theme === 'dark');
    const observer = new MutationObserver(updateTheme);
    updateTheme();
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const resolvedVariant = variant ?? (isDarkMode ? 'dark' : 'light');
  const dimensions = SIZE_MAP[size] ?? SIZE_MAP.md;
  const source = iconOnly
    ? '/assets/logo/konek-icon.svg'
    : resolvedVariant === 'dark'
      ? '/assets/logo/konek-logo-dark.svg'
      : '/assets/logo/konek-logo-light.svg';

  if (iconOnly) {
    return (
      <span
        className={`konek-logo konek-logo--icon ${className}`}
        style={{ width: dimensions.height, height: dimensions.height }}
      >
        <img src={source} alt={alt} draggable="false" />
      </span>
    );
  }

  return (
    <span
      className={`konek-logo ${className}`}
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <img src={source} alt={alt} draggable="false" />
    </span>
  );
};

export default Logo;
