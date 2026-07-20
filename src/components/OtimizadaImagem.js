// src/components/OtimizadaImagem.js
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

  // Fallback para imagem placeholder
  const handleError = () => {
    setErro(true);
  };

  // Se a imagem for SVG ou já estiver otimizada, pode usar img normal
  const isSvg = src?.endsWith('.svg');
  const isOptimized = src?.includes('_next/static');

  if (isSvg || isOptimized) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={fill ? { objectFit: 'contain' } : {}}
        {...props}
      />
    );
  }

  if (erro) {
    return (
      <div className={`bg-tupaGrey border border-tupaWood rounded ${className}`}>
        <div className="w-full h-full flex items-center justify-center text-tupaSilver text-sm">
          Imagem indisponível
        </div>
      </div>
    );
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