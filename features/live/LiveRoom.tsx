import React from 'react';
import {
  LiveKitRoom,
  VideoConference,
  formatChatMessageLinks,
  LocalUserChoices,
  PreJoin,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { useLiveToken } from './useLiveToken';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface LiveRoomProps {
  roomName: string;
  participantName: string;
}

const LiveRoom: React.FC<LiveRoomProps> = ({ roomName, participantName }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { token, serverUrl, error, loading } = useLiveToken(roomName, participantName, user?.role);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-main">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-4 text-lg font-poppins text-white">Connecting to live class...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-bg-main text-white p-4">
        <h2 className="text-2xl font-bold text-danger mb-4">Connection Error</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-primary rounded-lg font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!token || !serverUrl) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-main">
        <p className="text-lg font-poppins text-white">Preparing your session...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-bg-main">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        onDisconnected={() => navigate(-1)}
        data-lk-theme="default"
        style={{ height: '100vh' }}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
};

export default LiveRoom;
