import React, { useState } from 'react';

const AVATAR_TONES = [
  { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' }, // emerald
  { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' }, // sky
  { bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE' }, // indigo
  { bg: '#FDF2F8', text: '#BE185D', border: '#FBCFE8' }, // pink
  { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' }, // amber
  { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' }, // violet
  { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' }, // green
  { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' }, // blue
];

function getAvatarTone(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length];
}

function getInitial(name = '') {
  if (!name || typeof name !== 'string') return 'U';
  const trimmed = name.trim();
  if (!trimmed) return 'U';
  return trimmed.charAt(0).toLocaleUpperCase('vi');
}

/**
 * Avatar component chuẩn UI/UX
 * - Có ảnh: hiển thị ảnh tròn, viền mỏng
 * - Không ảnh / lỗi ảnh: chữ cái đầu trên nền pastel đồng sắc
 */
const Avatar = ({
  src,
  name = 'User',
  seed,
  size = 'md', // 'sm' (32px), 'md' (36px), 'lg' (48px), 'xl' (80px)
  className = '',
  alt,
  status = null, // 'online' | 'busy' | 'offline'
}) => {
  const [imageError, setImageError] = useState(false);

  const tone = getAvatarTone(seed || name || 'default');
  const initial = getInitial(name);

  const sizeStyles = {
    sm: { width: 32, height: 32, fontSize: 13 },
    md: { width: 36, height: 36, fontSize: 14 },
    lg: { width: 48, height: 48, fontSize: 18 },
    xl: { width: 80, height: 80, fontSize: 30 },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  const showImage = src && !imageError;

  return (
    <div
      className={`avatar-wrapper ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: currentSize.width,
        height: currentSize.height,
        borderRadius: '9999px',
        flexShrink: 0,
      }}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || name}
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '9999px',
            objectFit: 'cover',
            border: '1px solid var(--border-subtle, rgba(0, 0, 0, 0.08))',
          }}
        />
      ) : (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            borderRadius: '9999px',
            backgroundColor: tone.bg,
            color: tone.text,
            border: `1px solid ${tone.border}`,
            fontSize: currentSize.fontSize,
            fontWeight: 600,
            userSelect: 'none',
          }}
        >
          {initial}
        </span>
      )}

      {status && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: Math.max(8, currentSize.width * 0.22),
            height: Math.max(8, currentSize.height * 0.22),
            borderRadius: '9999px',
            backgroundColor:
              status === 'online'
                ? 'var(--status-success, #10B981)'
                : status === 'busy'
                ? 'var(--status-warning, #F59E0B)'
                : 'var(--text-secondary, #6B7280)',
            border: '2px solid var(--bg-surface, #ffffff)',
          }}
        />
      )}
    </div>
  );
};

export default Avatar;
