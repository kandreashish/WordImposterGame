import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext.js';
import { Home } from './pages/Home.js';
import { CreateRoom } from './pages/CreateRoom.js';
import { JoinRoom } from './pages/JoinRoom.js';
import { Room } from './pages/Room.js';

export default function App() {
  return (
    <SocketProvider>
      <Router basename="/wordgame">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateRoom />} />
          <Route path="/join" element={<JoinRoom />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}
