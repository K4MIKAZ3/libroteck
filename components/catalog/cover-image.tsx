import Image from "next/image";

type CoverImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function CoverImage({
  src,
  alt,
  className = "object-cover",
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority = false,
}: CoverImageProps) {
  const isSvg = src.endsWith(".svg");

  if (isSvg) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full ${className}`}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={src.includes("blob.vercel-storage.com")}
    />
  );
}
