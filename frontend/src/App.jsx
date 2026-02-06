import { useEffect, useRef } from 'react';

function App() {
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://PC_IP:8080');

    ws.current.onopen = () => {
      console.log('WS connected');
    };

    return () => ws.current.close();
  }, []);

  const send = (state) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'move',
        forward: state ? 1 : 0,
        strafe: 0
      }));
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Touch Test</h2>

      <div
        style={{
          width: 200,
          height: 200,
          background: 'lightgray',
          borderRadius: 20,
          textAlign: 'center',
          lineHeight: '200px',
          fontSize: 20,
          userSelect: 'none',
          touchAction: 'none'
        }}
        onTouchStart={() => {
          console.log('touch start');
          send(true);
        }}
        onTouchEnd={() => {
          console.log('touch end');
          send(false);
        }}
      >
        TOUCH ME
      </div>
    </div>
  );
}

export default App;
