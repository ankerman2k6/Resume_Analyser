import React from 'react';

// Transparent logos (Tách nền - khuyên dùng cho Navbar, Hero, v.v.)
import konekLogoLight from '../../assets/KONEK_LOGO/LOGO/logo_light/transparent-logo 1.svg';
import konekLogoDark from '../../assets/KONEK_LOGO/LOGO/logo_dark/transparent-dark.svg';

// Logos with solid background (Có nền đóng khung)
import konekLogoColoredLight from '../../assets/KONEK_LOGO/LOGO/logo_light/colored-logo 2.svg';
import konekLogoColoredDark from '../../assets/KONEK_LOGO/LOGO/logo_dark/colored-logo-dark.svg';

// Wordmarks without icon (Chỉ chữ KONEK tách nền)
import konekWordmarkLight from '../../assets/KONEK_LOGO/LOGO/light_without_icon/transparent_without_icon.svg';
import konekWordmarkDark from '../../assets/KONEK_LOGO/LOGO/dark_without_icon/darktransparent_without_icon.svg';

// Icon only (Chỉ biểu tượng KONEK tách nền)
import konekIcon from '../../assets/KONEK_LOGO/ICON/icon_light/transparent-icon.svg';

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

const SIZE_CLASSES: Record<LogoSize, string> = {
  xs: 'h-5',
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-12',
  xl: 'h-16',
  '2xl': 'h-20',
};

export const Logo: React.FC<LogoProps> = ({
  variant,
  size = 'md',
  className = '',
  iconOnly = false,
  withoutIcon = false,
  withBackground = false,
  alt = 'KONEK - AI-Powered ATS & Resume Screening Platform',
}) => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const checkDark = () => {
        const themeAttr = document.documentElement.getAttribute('data-theme');
        setIsDarkMode(
          themeAttr === 'dark' ||
          document.documentElement.classList.contains('dark') ||
          document.body.classList.contains('dark')
        );
      };
      checkDark();
      const observer = new MutationObserver(checkDark);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme']
      });
      return () => observer.disconnect();
    }
  }, []);

  const resolvedVariant = variant || (isDarkMode ? 'dark' : 'light');
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  let logoSrc = resolvedVariant === 'dark' ? konekLogoDark : konekLogoLight;

  if (iconOnly) {
    logoSrc = konekIcon;
  } else if (withoutIcon) {
    logoSrc = resolvedVariant === 'dark' ? konekWordmarkDark : konekWordmarkLight;
  } else if (withBackground) {
    logoSrc = resolvedVariant === 'dark' ? konekLogoColoredDark : konekLogoColoredLight;
  }

  return (
    <img
      src={logoSrc}
      alt={alt}
      className={`${sizeClass} ${iconOnly ? 'aspect-square' : 'w-auto'} object-contain shrink-0 select-none ${className}`}
      loading="eager"
    />
  );
};

export default Logo;
