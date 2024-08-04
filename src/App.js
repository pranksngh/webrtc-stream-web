import React, { useEffect, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const APP_ID = '8c0ee362a4e7470cbbe167399223aa13'; // Replace with your Agora App ID
const TOKEN = '007eJxTYGi7uF2ppP6W2v611dcWPRSqvrz7tbi78q2PO7+veRn07pafAoNFskFqqrGZUaJJqrmJuUFyUlKqoZm5saWlkZFxYqKhcfae9WkNgYwMr7axMTIyQCCIz8pgaGRsYsrAAACcRiK6'; // Replace with your token or set to null if not using tokens

const LiveStreaming = () => {
  const [client, setClient] = useState(null);
  const [localTracks, setLocalTracks] = useState({ videoTrack: null, audioTrack: null });
  const [joined, setJoined] = useState(false);
  const [roomID, setRoomID] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const rtcClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
    setClient(rtcClient);

    return () => {
      if (joined) {
        rtcClient.leave();
        if (localTracks.videoTrack) {
          localTracks.videoTrack.stop();
          localTracks.videoTrack.close();
        }
        if (localTracks.audioTrack) {
          localTracks.audioTrack.stop();
          localTracks.audioTrack.close();
        }
      }
    };
  }, [joined]);

  const handleJoin = async () => {
    if (!roomID || !username) {
      alert('Please enter both Room ID and Username');
      return;
    }

    try {
      // Join the channel
      await client.join(APP_ID, roomID, TOKEN, username);

      // Create local tracks (audio and video)
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

      // Publish local tracks to the channel
      await client.publish([audioTrack, videoTrack]);

      setLocalTracks({ videoTrack, audioTrack });
      setJoined(true);

      // Display the local stream in a div with id 'local-stream'
      videoTrack.play('local-stream');
    } catch (error) {
      console.error('Failed to join the channel', error);
    }
  };

  return (
    <div>
      <h1>Agora Live Streaming</h1>
      {!joined ? (
        <div>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomID}
            onChange={(e) => setRoomID(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleJoin}>Start Stream</button>
        </div>
      ) : (
        <div>
          <p>Streaming in Room: {roomID} as {username}</p>
          <div id="local-stream" style={{ width: '640px', height: '480px', backgroundColor: '#000' }}></div>
        </div>
      )}
    </div>
  );
};

export default LiveStreaming;
