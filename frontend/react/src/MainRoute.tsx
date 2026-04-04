import { Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import InvitePage from './component/InvitePage';
import JoinchatPage from './component/JoinchatPage';

function MainRoute() {
  return (
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/invite/:token" element={<InvitePage />} />
        <Route path="/joinchat/:token" element={<JoinchatPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

export default MainRoute;