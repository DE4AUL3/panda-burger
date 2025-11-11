'use client';

import React from 'react';
import Image from 'next/image';
import { imageService } from '@/lib/imageServiceDb'; // Переключаемся на новый imageServiceDb

interface SmartImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  style?: React.CSSProperties;
}

export function SmartImage({
  src,
  alt = '',
  width,
  height,
  className = '',
  fallbackSrc = '/images/placeholder.svg',
  fill = false,
  priority = false,
  quality = 75,
  style,
}: SmartImageProps) {
  // Получаем URL изображения из сервиса
  const imageUrl = src.startsWith("http") ? src : (src.startsWith("/images/") ? src : `/images/${src}`);
  
  // Обработчик ошибок загрузки изображения
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== fallbackSrc) {
      console.warn(`Ошибка загрузки изображения: ${src}, используем заглушку`);
      target.src = fallbackSrc;
    }
  };
  
  // Общие свойства для изображения
  const imageProps = {
    src: imageUrl,
    alt,
    onError: handleError,
    className,
    quality,
    style,
    priority
  };
  
  // Если задан fill, используем заполнение контейнера
  if (fill) {
    return (
      <div className={`relative w-full h-full ${className}`} style={style}>
        <Image
          {...imageProps}
          fill={true}
          className="object-cover"
        />
      </div>
    );
  }
  
  // В противном случае используем явные размеры
  return (
    <Image
      {...imageProps}
      width={width || 100}
      height={height || 100}
    />
  );
}

export default SmartImage;