import { createRoot } from 'react-dom/client';
import CreateTicket from './CreateTicket';
import './admin.css';

const container = document.getElementById('cs-create-ticket-form');
if (container) {
    const root = createRoot(container);
    root.render(<CreateTicket />);
}