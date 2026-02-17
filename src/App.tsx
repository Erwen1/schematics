/* ──────────────────────────────────────────────
   App — Root router configuration
   ────────────────────────────────────────────── */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainEditor from './pages/MainEditor';
import IoTValidationPlayground from './pages/IoTValidationPlayground';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainEditor />} />
                <Route path="/iot-test" element={<IoTValidationPlayground />} />
            </Routes>
        </Router>
    );
};

export default App;
