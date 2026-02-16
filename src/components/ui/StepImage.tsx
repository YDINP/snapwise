import Image from 'next/image';

interface StepImageProps {
  src?: string;
  alt?: string;
  fallbackGradient?: string;
  overlay?: 'dark' | 'medium' | 'light';
  children?: React.ReactNode;
}

const overlayMap = {
  dark: 'step-overlay-dark',
  medium: 'step-overlay-medium',
  light: 'step-overlay-light',
};

export function StepImage({
  src,
  alt = '',
  fallbackGradient = 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900',
  overlay = 'medium',
  children
}: StepImageProps) {
  return (
    <div className="absolute inset-0">
      {/* Background Image or Gradient */}
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div className={`absolute inset-0 ${fallbackGradient}`} />
      )}

      {/* Overlay */}
      <div className={`absolute inset-0 ${overlayMap[overlay]}`} />

      {/* Content */}
      {children && (
        <div className="absolute inset-0">
          {children}
        </div>
      )}
    </div>
  );
}
