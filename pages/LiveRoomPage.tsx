import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LiveRoom from '../features/live/LiveRoom';

const LiveRoomPage: React.FC = () => {
  const { roomName } = useParams<{ roomName: string }>();
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roomName) {
    return <Navigate to="/" replace />;
  }

  return (
    <LiveRoom 
      roomName={roomName} 
      participantName={user.name || user.username} 
    />
  );
};

export default LiveRoomPage;
