// src/components/OtimizadaImagem.js
'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';

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
  fallbackSrc = null,
  ...props
}) {
  const [tentativaFallback, setTentativaFallback] = useState(false);
  const [falhouDeVez, setFalhouDeVez] = useState(false);

  // Reseta o estado de erro sempre que a imagem solicitada mudar,
  // para não "travar" no estado de erro ao reaproveitar o componente
  // com um item diferente (ex: lista de itens do carrinho).
  useEffect(() => {
    setTentativaFallback(false);
    setFalhouDeVez(false);
  }, [src]);

  const handleError = () => {
    if (fallbackSrc && !tentativaFallback) {
      // Primeira falha: tenta a imagem de fallback antes de desistir
      setTentativaFallback(true);
    } else {
      // Fallback também falhou (ou não foi fornecido): desiste de vez
      setFalhouDeVez(true);
    }
  };

  if (falhouDeVez) {
    return (
      <div className={`bg-tupaGrey border border-tupaWood rounded flex items-center justify-center ${className}`}>
        <span className="text-tupaSilver text-xs text-center px-2">Imagem indisponível</span>
      </div>
    );
  }

  const srcFinal = tentativaFallback ? fallbackSrc : src;

  // Se for SVG, usa img normal (next/image não otimiza SVG por padrão)
  if (srcFinal?.endsWith('.svg')) {
    return <img src={srcFinal} alt={alt} className={className} onError={handleError} />;
  }

  return (
    <Image
      src={srcFinal}
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
