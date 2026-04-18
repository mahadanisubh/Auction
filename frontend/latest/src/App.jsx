import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuctionProvider } from './context/AuctionContext.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard.jsx';
import PlayerEntry from './pages/organizer/PlayerEntry.jsx';
import TeamEntry from './pages/organizer/TeamEntry.jsx';
import AuctionSetup from './pages/organizer/AuctionSetup.jsx';
import TeamDashboard from './pages/teams/TeamDashboard.jsx';
import TeamPlayers from './pages/teams/TeamPlayers.jsx';
import AuctionRoom from './pages/auction/AuctionRoom.jsx';
import AuctionWaiting from './pages/auction/AuctionWaiting.jsx';
import PrivateRoute from './components/helper/PrivateRoute.jsx';
import RoleRoute from './components/helper/RoleRoute.jsx';

import './App.css';

function App() {
  return (
    <AuctionProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

          {/* Organizer Routes */}
          <Route path="/organizer/dashboard" element={<PrivateRoute ><RoleRoute role="organizer"><OrganizerDashboard /></RoleRoute > </PrivateRoute>} />
          <Route path="/organizer/player-entry" element={<PrivateRoute><RoleRoute role="organizer"><PlayerEntry /></RoleRoute ></PrivateRoute>} />
          <Route path="/organizer/team-entry" element={<PrivateRoute><RoleRoute role="organizer"><TeamEntry /></RoleRoute ></PrivateRoute>} />
          <Route path="/organizer/setup/:auctionId" element={<PrivateRoute><RoleRoute role="organizer"><AuctionSetup /></RoleRoute ></PrivateRoute>} />
          <Route path="/organizer/team-entry/:auctionId" element={<PrivateRoute><RoleRoute role= "organizer"><TeamEntry /></RoleRoute></PrivateRoute>} />

          {/* Team Owner Routes */}
          <Route path="/teams/dashboard" element={<PrivateRoute><RoleRoute role="owner"><TeamDashboard /></RoleRoute ></PrivateRoute>} />
          <Route path="/teams/:teamId/players" element={<PrivateRoute><RoleRoute role="owner"><TeamPlayers /></RoleRoute ></PrivateRoute>} />

          {/* Auction Routes */}
          <Route path="/auction/waiting/:auctionId" element={<PrivateRoute><AuctionWaiting /></PrivateRoute>} />
          <Route path="/auction/room/:auctionId" element={<PrivateRoute><AuctionRoom /></PrivateRoute>} />

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/auth/login" replace />} />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuctionProvider>
  );
}

export default App;
