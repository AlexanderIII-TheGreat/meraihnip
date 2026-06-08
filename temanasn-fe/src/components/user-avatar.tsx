import { imageLink } from '@/utils/image-link';
import { useState, useEffect } from 'react';

interface UserAvatarProps {
  name?: string;
  image?: string;
  size?: number | string;
  className?: string;
  roundedFull?: boolean;
}

export default function UserAvatar({ name = '', image, size = 48, className = '', roundedFull = false }: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  // Reset error state if image changes
  useEffect(() => {
    setHasError(false);
  }, [image]);

  const initials = name
    ?.split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const sizeStyle = typeof size === 'number' ? { width: size, height: size } : {};
  
  // Robust check for valid image
  const isValidImage = image && 
                       image !== '' && 
                       image !== 'null' && 
                       image !== 'undefined' && 
                       !hasError;

  // If we have a valid image and no error, show it
  if (isValidImage) {
    return (
      <div 
        className={`${roundedFull ? 'rounded-full' : 'rounded-xl'} overflow-hidden border-2 border-white/20 flex-shrink-0 ${className}`} 
        style={sizeStyle}
      >
        <img 
          src={image.startsWith('blob:') ? image : imageLink(image)} 
          alt={name} 
          className="w-full h-full object-cover" 
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  // Fallback to initials
  return (
    <div 
      className={`${roundedFull ? 'rounded-full' : 'rounded-xl'} flex items-center justify-center font-black text-white bg-gradient-to-br from-[#14B8A6] to-[#0F766E] border-2 border-white/20 flex-shrink-0 ${className}`}
      style={{
        ...sizeStyle,
        fontSize: typeof size === 'number' ? size * 0.4 : '1rem'
      }}
    >
      {initials || '?'}
    </div>
  );
}
