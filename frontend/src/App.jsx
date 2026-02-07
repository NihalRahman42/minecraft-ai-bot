import { useEffect, useRef, useState } from 'react';

function App() {
  const ws = useRef(null);
  const [status, setStatus] = useState('Disconnected');

  // Track currently pressed keys
  const keys = useRef({ w: false, a: false, s: false, d: false, space: false });

  useEffect(() => {
    // 1. Connect to localhost since you are on the same PC
    ws.current = new WebSocket('ws://localhost:8080');

    ws.current.onopen = () => {
      console.log('WS connected');
      setStatus('Connected');
    };
    
    ws.current.onclose = () => setStatus('Disconnected');

    // 2. Add Keyboard Listeners
    const handleKey = (e, isDown) => {
      const key = e.key.toLowerCase();
      if (key === ' ') keys.current.space = isDown;
      if (keys.current.hasOwnProperty(key)) {
        keys.current[key] = isDown;
        sendMovement();
      }
    };

    const onKeyDown = (e) => handleKey(e, true);
    const onKeyUp = (e) => handleKey(e, false);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      ws.current.close();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const sendMovement = () => {
    if (ws.current?.readyState !== WebSocket.OPEN) return;

    // Calculate movement vector
    // Forward: W=1, S=-1
    const forward = (keys.current.w ? 1 : 0) + (keys.current.s ? -1 : 0);
    
    // Strafe: D=1 (Right), A=-1 (Left)
    const strafe = (keys.current.d ? 1 : 0) + (keys.current.a ? -1 : 0);

    ws.current.send(JSON.stringify({
      type: 'move',
      forward: forward,
      strafe: strafe
    }));

    // Send jump state separately if needed, or handle in physics logic
    ws.current.send(JSON.stringify({
      type: 'jump',
      state: keys.current.space
    }));
  };

  return (
    <div style={{ padding: 20, textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Minecraft Bot Controller</h1>
      <p>Status: <strong>{status}</strong></p>
      
      <div style={{ marginTop: 50, padding: 20, background: '#eee', borderRadius: 10 }}>
        <p>Click here to focus, then use keys to control:</p>
        <div style={{ fontSize: 24, fontWeight: 'bold' }}>
          [W] Forward <br/>
          [A] Left &nbsp; [S] Back &nbsp; [D] Right <br/>
          [Space] Jump
        </div>
      </div>
    </div>
  );
}

export default App;