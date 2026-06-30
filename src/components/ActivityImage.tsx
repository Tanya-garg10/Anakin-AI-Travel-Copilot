import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface ActivityImageProps {
  title: string;
  locationName: string;
  destination: string;
  alt: string;
}

export default function ActivityImage({ title, locationName, destination, alt }: ActivityImageProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    const uniqueId = `${title}_${locationName}_${destination}`;
    const cacheKey = `activity_image_${uniqueId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      setImageUrl(cached);
      setIsLoading(false);
      return;
    }

    const queryParams = new URLSearchParams({
      title: title || '',
      locationName: locationName || '',
      destination: destination || ''
    });

    fetch(`/api/unsplash/image?${queryParams.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch image');
        return res.json();
      })
      .then((data) => {
        if (active && data.url) {
          setImageUrl(data.url);
          try {
            sessionStorage.setItem(cacheKey, data.url);
          } catch (e) {
            // Silently catch sessionStorage full quota errors
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching activity image:', err);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [title, locationName, destination]);

  const fallbackText = title || 'Activity';

  const handleImageError = () => {
    // If Wikipedia or external Unsplash fails to load, fall back to a curated robust Unsplash photo list based on the name hash
    const fallbackList = [
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=400&q=80"
    ];
    let hash = 0;
    const hashString = fallbackText || locationName || destination || "travel";
    for (let i = 0; i < hashString.length; i++) {
      hash = hashString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % fallbackList.length;
    setImageUrl(fallbackList[index]);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center animate-pulse" id={`loader-${fallbackText.replace(/\s+/g, '-')}`}>
        <Sparkles className="w-4 h-4 text-indigo-400/40 animate-pulse" />
      </div>
    );
  }

  return (
    <img
      id={`image-${fallbackText.replace(/\s+/g, '-')}`}
      src={imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80'}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={handleImageError}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
    />
  );
}
