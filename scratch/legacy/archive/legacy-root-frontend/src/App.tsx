import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RetroDashboard from './components/RetroDashboard';
import './styles.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RetroDashboard />} />
        <Route path="/search" element={<RetroDashboard />} />
        <Route path="/browse" element={<RetroDashboard />} />
        <Route path="/library" element={<RetroDashboard />} />
        <Route path="/liked-songs" element={<RetroDashboard />} />
        <Route path="*" element={<RetroDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
