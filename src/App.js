import React, { useEffect, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const APP_ID = 'YOUR_APP_ID'; // Replace with your Agora App ID
const TOKEN = null; // Replace with your token or set to null if not using tokens

const LiveStreaming = () => {
  const [client, setClient] = useState(null);
  const [localTracks, setLocalTracks] = useState({ videoTrack: null, audioTrack: null });
  const [joined, setJoined] = useState(false);
  const [roomID, setRoomID] = useState('');
  const [username, setUsername] = useState('');
  const [isHost, setIsHost] = useState(false); // Add state to track if the user is a host

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
      // Set the role based on the isHost state
      client.setClientRole(isHost ? 'host' : 'audience');

      // Join the channel
      await client.join(APP_ID, roomID, TOKEN, username);

      if (isHost) {
        // Create local tracks (audio and video) only if the user is a host
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

        // Publish local tracks to the channel
        await client.publish([audioTrack, videoTrack]);

        setLocalTracks({ videoTrack, audioTrack });

        // Display the local stream in a div with id 'local-stream'
        videoTrack.play('local-stream');
      }

      setJoined(true);
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
          <label>
            <input
              type="checkbox"
              checked={isHost}
              onChange={() => setIsHost(!isHost)}
            />
            Join as Host
          </label>
          <button onClick={handleJoin}>Start Stream</button>
        </div>
      ) : (
        <div>
          <p>Streaming in Room: {roomID} as {username} ({isHost ? 'Host' : 'Audience'})</p>
          {isHost && <div id="local-stream" style={{ width: '640px', height: '480px', backgroundColor: '#000' }}></div>}
        </div>
      )}
    </div>
  );
};

export default LiveStreaming;
