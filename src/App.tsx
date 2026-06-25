import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';

function App() {
    return (
        <Routes>
            {/* "/" is the marketing landing page; its CTAs open the global auth modal. */}
            <Route path="/" element={<LandingPage />} />
        </Routes>
    );
}

export default App;