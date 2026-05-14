import { useEffect, useState, useRef } from 'react';
import Peer, { type MediaConnection } from 'peerjs';
import { VideoPlayer } from './components/VideoPlayer';
import { Controls } from './components/Controls';
import { Phone, Copy, CheckCircle2, Video } from 'lucide-react';
import './index.css';

function App() {
  const [peerId, setPeerId] = useState<string>('');
  const [remotePeerId, setRemotePeerId] = useState<string>('');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'receiving' | 'connected'>('idle');
  const [incomingCall, setIncomingCall] = useState<MediaConnection | null>(null);
  const [copied, setCopied] = useState(false);

  const peerInstance = useRef<Peer | null>(null);
  const currentCall = useRef<MediaConnection | null>(null);

  useEffect(() => {
    // Initialize PeerJS
    const peer = new Peer();
    
    peer.on('open', (id) => {
      setPeerId(id);
    });

    peer.on('call', (call) => {
      setIncomingCall(call);
      setCallStatus('receiving');
    });

    peerInstance.current = peer;

    // Cleanup
    return () => {
      peer.destroy();
    };
  }, []);

  useEffect(() => {
    // Get local media stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
      })
      .catch((err) => {
        console.error('Failed to get local stream', err);
      });
  }, []);

  const handleCall = () => {
    if (!remotePeerId || !localStream || !peerInstance.current) return;

    setCallStatus('calling');
    const call = peerInstance.current.call(remotePeerId, localStream);
    currentCall.current = call;

    call.on('stream', (userVideoStream) => {
      setRemoteStream(userVideoStream);
      setCallStatus('connected');
    });

    call.on('close', () => {
      endCall();
    });
  };

  const answerCall = () => {
    if (!incomingCall || !localStream) return;

    incomingCall.answer(localStream);
    currentCall.current = incomingCall;

    incomingCall.on('stream', (userVideoStream) => {
      setRemoteStream(userVideoStream);
      setCallStatus('connected');
    });

    setIncomingCall(null);
  };

  const rejectCall = () => {
    if (incomingCall) {
      incomingCall.close();
      setIncomingCall(null);
      setCallStatus('idle');
    }
  };

  const endCall = () => {
    if (currentCall.current) {
      currentCall.current.close();
      currentCall.current = null;
    }
    setRemoteStream(null);
    setCallStatus('idle');
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const copyPeerId = () => {
    navigator.clipboard.writeText(peerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="app-container">
      <header>
        <h1>
          <Video size={28} color="#3b82f6" />
          Nexus Call
        </h1>
        <div className="peer-info">
          <span>Your ID: <strong>{peerId || 'Connecting...'}</strong></span>
          <button className="copy-btn" onClick={copyPeerId} title="Copy ID" disabled={!peerId}>
            {copied ? <CheckCircle2 size={18} color="#10b981" /> : <Copy size={18} />}
          </button>
        </div>
      </header>

      <main className="main-content">
        {callStatus === 'idle' || callStatus === 'calling' ? (
          <div className="call-modal">
            <h2>Start a Call</h2>
            <p>Share your ID with a friend or enter theirs below</p>
            
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter Peer ID to call"
                value={remotePeerId}
                onChange={(e) => setRemotePeerId(e.target.value)}
              />
            </div>
            
            <button 
              className="btn-primary" 
              style={{ width: '100%' }}
              onClick={handleCall}
              disabled={!remotePeerId || !localStream || callStatus === 'calling'}
            >
              {callStatus === 'calling' ? 'Calling...' : (
                <>
                  <Phone size={20} />
                  Call Peer
                </>
              )}
            </button>
          </div>
        ) : null}

        {callStatus === 'receiving' && (
          <div className="incoming-call">
            <div>
              <h3 style={{ margin: 0 }}>Incoming Call</h3>
              <p style={{ margin: '0.5rem 0 0', color: '#94a3b8', fontSize: '0.875rem' }}>
                Someone is trying to reach you
              </p>
            </div>
            <div className="incoming-call-actions">
              <button className="btn-success" onClick={answerCall}>Answer</button>
              <button className="btn-danger" onClick={rejectCall}>Decline</button>
            </div>
          </div>
        )}

        {callStatus === 'connected' && (
          <>
            <div className="video-grid">
              {remoteStream && (
                <VideoPlayer stream={remoteStream} label="Remote Video" />
              )}
            </div>
            <Controls
              isMuted={isMuted}
              toggleMute={toggleMute}
              isVideoOff={isVideoOff}
              toggleVideo={toggleVideo}
              endCall={endCall}
            />
          </>
        )}

        {/* Local Video - always visible at bottom right */}
        {(callStatus === 'idle' || callStatus === 'connected' || callStatus === 'calling') && (
          <VideoPlayer stream={localStream} isLocal label="You" />
        )}
      </main>
    </div>
  );
}

export default App;
