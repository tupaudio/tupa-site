// src/components/OtimizadaImagem.js
'use client';
import Image from 'next/image';
import { useState } from 'react';

export default function OtimizadaImagem({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  sizes = '(max-width: 768px) 100vw, 33vw',
  priority = false,
  quality = 85,
  ...props
}) {
  const [erro, setErro] = useState(false);

  const handleError = () => {
    setErro(true);
  };

  // Fallback para imagens não otimizadas
  if (erro) {
    return (
      <div className={`bg-tupaGrey border border-tupaWood rounded ${className}`}>
        <div className="w-full h-full flex items-center justify-center text-tupaSilver text-sm">
          Imagem indisponível
        </div>
      </div>
    );
  }

  // Se for SVG, usa img normal
  if (src?.endsWith('.svg')) {
    return <img src={src} alt={alt} className={className} {...props} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      quality={quality}
      onError={handleError}
      loading={priority ? 'eager' : 'lazy'}
      {...props}
    />
  );
}