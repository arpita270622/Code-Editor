import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef('');
  const location = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);

  useEffect(() => {
    if (!location.state) return;

    const init = async () => {
      // Prevent duplicate sockets
      if (!socketRef.current) {
        socketRef.current = await initSocket();

        // Error handling
        const handleError = (err) => {
          console.error('Socket error:', err);
          toast.error('Socket connection failed. Try again later.');
          navigate('/');
        };

        socketRef.current.on('connect_error', handleError);
        socketRef.current.on('connect_failed', handleError);

        // Join room
        socketRef.current.emit(ACTIONS.JOIN, {
          roomId,
          username: location.state.username,
        });

        // Handle new clients joining
        socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
          if (username !== location.state.username) {
            toast.success(`${username} joined the room.`);
          }
          setClients(clients);

          // Sync code with the newly joined client
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        });

        // Handle clients leaving
        socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
          toast.success(`${username} left the room.`);
          setClients((prev) => prev.filter((client) => client.socketId !== socketId));
        });
      }
    };

    init();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, location.state?.username, navigate]);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy Room ID');
      console.error(err);
    }
  };

  const leaveRoom = () => navigate('/');

  if (!location.state) return <Navigate to="/" />;

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img className="logoImage" src="/code-sync.png" alt="logo" />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>
          Copy ROOM ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>
      <div className="editorWrap">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />
      </div>
    </div>
  );
};

export default EditorPage;
