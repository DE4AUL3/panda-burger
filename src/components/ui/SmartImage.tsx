'use client';

import Image from 'next/image';
import { useState } from 'react';
import { imageService } from '@/lib/imageServiceDb';

interface SmartImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export default function SmartImage({ 
  src, 
  alt, 
  fill, 
  width, 
  height, 
  className, 
  sizes, 
  priority,
  placeholder,
  blurDataURL
}: SmartImageProps) {
  const [imageError, setImageError] = useState(false);
  
  // Получаем URL изображения через imageService
  const imageUrl = src.startsWith("http") ? src : (src.startsWith("/images/") ? src : `/images/${src}`);
  
  // Обработчик ошибок изображения
  const handleError = () => {
    console.warn(`Ошибка загрузки изображения: ${src}`);
    setImageError(true);
  };
  
  // Если это локальное base64 изображение или blob-ссылка, используем обычный img
  if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
    // Для blob обязательно width/height (или 100%)
    const imgStyle = fill
      ? { width: '100%', height: '100%', objectFit: 'cover' } as React.CSSProperties
      : { width: width || 200, height: height || 200 } as React.CSSProperties;
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={className}
        style={imgStyle}
        width={width || 200}
        height={height || 200}
        onError={handleError}
      />
    );
  }
  
  // Если это относительный путь к файлу без домена
  if (imageUrl.startsWith('/')) {
    // Используем обычный тег img для относительных путей
    // Это поможет избежать ошибок Next.js при работе с локальными файлами
    return (
      <img
        src={imageError ? '/images/placeholder.svg' : imageUrl}
        alt={alt}
        className={`${className} ${fill ? 'object-cover w-full h-full' : ''}`}
        style={fill ? { width: '100%', height: '100%', objectFit: 'cover' } as React.CSSProperties : undefined}
        width={!fill ? (width || 200) : undefined}
        height={!fill ? (height || 200) : undefined}
        onError={handleError}
      />
    );
  }
  
  // Для внешних URL используем next/Image
  return (
    <Image
      src={imageError ? '/images/placeholder.svg' : imageUrl}
      alt={alt}
      fill={fill}
      width={!fill ? (width || 200) : undefined}
      height={!fill ? (height || 200) : undefined}
      className={className}
      sizes={sizes || '100vw'}
      priority={priority}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      onError={handleError}
      unoptimized={imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1')}
    />
  );
}