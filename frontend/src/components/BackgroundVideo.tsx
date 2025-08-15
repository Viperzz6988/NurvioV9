import React, { useEffect, useRef, useState } from 'react';

interface BackgroundVideoProps {
  src: string;
  poster?: string;
  className?: string;
  children?: React.ReactNode;
}

const BackgroundVideo: React.FC<BackgroundVideoProps> = ({ 
  src, 
  poster, 
  className = '',
  children 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setShowVideo(!prefersReducedMotion);

    // Lazy loading for mobile performance
    const video = videoRef.current;
    if (video && showVideo) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            video.load();
            observer.unobserve(video);
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(video);

      return () => observer.disconnect();
    }
  }, [showVideo]);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  if (!showVideo) {
    return (
      <div 
        className={`relative ${className}`}
        style={{ 
          backgroundImage: poster ? `url(${poster})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        poster={poster}
        onLoadedData={handleVideoLoad}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          videoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
        {poster && (
          <img 
            src={poster} 
            alt="Video fallback" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </video>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default BackgroundVideo;