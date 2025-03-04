import { createRoot } from 'react-dom/client';
import Tickets from './Tickets.jsx';
import './admin.css';

const container = document.getElementById('cs-tickets-table');
if (container) {
    const root = createRoot(container);
    root.render(<Tickets />);
}