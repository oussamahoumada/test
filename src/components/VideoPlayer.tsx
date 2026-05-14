import React, { useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  stream: MediaStream | null;
  isLocal?: boolean;
  label?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ stream, isLocal = false, label }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`video-container ${isLocal ? 'local' : ''}`}>
      {!stream && (
        <div className="loading-indicator">
          <Loader2 size={48} />
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Always mute local video to prevent echo
      />
      {label && <div className="video-label">{label}</div>}
    </div>
  );
};
