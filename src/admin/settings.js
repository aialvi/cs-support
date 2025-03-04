import { createRoot } from 'react-dom/client';
import Settings from './Settings.jsx';
import './admin.css';

const container = document.getElementById('cs-settings');
if (container) {
    const root = createRoot(container);
    root.render(<Settings />);
}