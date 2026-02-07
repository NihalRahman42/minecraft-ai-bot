import { useEffect, useRef, useState } from 'react';

function App() {
  const ws = useRef(null);
  const [status, setStatus] = useState('Disconnected');
  const [botName, setBotName] = useState('Steve_Bot'); // Default name

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080');

    ws.current.onopen = () => setStatus('Connected');
    ws.current.onclose = () => setStatus('Disconnected');

    return () => ws.current.close();
  }, []);

  const sendCommand = (type) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: type,
        name: botName
      }));
    } else {
      alert('WebSocket not connected');
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '40px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Bot Commander</h1>
      <p>Server Status: <strong style={{ color: status === 'Connected' ? 'green' : 'red' }}>{status}</strong></p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px' }}>
        
        {/* Naming Column */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Target Bot Name:</label>
          <input 
            type="text" 
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            style={{ padding: '10px', width: '100%', fontSize: '16px' }}
          />
        </div>

        {/* Action Buttons */}
        <button 
          onClick={() => sendCommand('spawn')}
          style={{ padding: '15px', background: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px' }}
        >
          Spawn Bot
        </button>

        <button 
          onClick={() => sendCommand('chop')}
          style={{ padding: '15px', background: '#FF9800', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px' }}
        >
          Chop 1 Log & Stop
        </button>

      </div>
      
      <p style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
        <em>Note: Ensure you have `mineflayer-pathfinder` installed in the backend.</em>
      </p>
    </div>
  );
}

export default App;