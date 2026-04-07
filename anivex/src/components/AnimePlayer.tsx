// This component is no longer used - VideoPlayer is embedded in AnivexPlatform
// Keeping for backwards compatibility
import React from 'react';

interface AnimePlayerProps {
  anime: any;
  onClose: () => void;
}

export default function AnimePlayer({ onClose }: AnimePlayerProps) {
  return (
    <div className="fixed inset-0 z-[600] bg-black flex items-center justify-center">
      <button onClick={onClose} className="absolute top-4 right-4 text-white">
        Close
      </button>
      <p className="text-white">Player is integrated into AnivexPlatform</p>
    </div>
  );
}
