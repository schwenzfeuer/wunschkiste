"use client";

import { useState } from "react";
import { Gift } from "lucide-react";

interface ProductImageProps {
  src: string | null;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className = "" }: ProductImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
        <Gift className="size-6 text-foreground/20" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}
