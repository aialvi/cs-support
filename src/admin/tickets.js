import { createRoot } from 'react-dom/client';
import Tickets from './Tickets.jsx';
import './tailwind-style.css';

const container = document.getElementById( 'cs-tickets-table' );
if ( container ) {
	const root = createRoot( container );
	root.render( <Tickets /> );
}
