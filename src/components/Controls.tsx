import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

interface ControlsProps {
  isMuted: boolean;
  toggleMute: () => void;
  isVideoOff: boolean;
  toggleVideo: () => void;
  endCall: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isMuted,
  toggleMute,
  isVideoOff,
  toggleVideo,
  endCall,
}) => {
  return (
    <div className="controls-container">
      <button
        className={`control-btn ${isMuted ? 'active' : ''}`}
        onClick={toggleMute}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <MicOff size={24} color="#ef4444" /> : <Mic size={24} />}
      </button>

      <button
        className={`control-btn ${isVideoOff ? 'active' : ''}`}
        onClick={toggleVideo}
        title={isVideoOff ? 'Turn on video' : 'Turn off video'}
      >
        {isVideoOff ? <VideoOff size={24} color="#ef4444" /> : <Video size={24} />}
      </button>

      <button className="control-btn danger" onClick={endCall} title="End call">
        <PhoneOff size={24} color="#ffffff" />
      </button>
    </div>
  );
};
