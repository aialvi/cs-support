import { createRoot } from 'react-dom/client';
import FAQ from './FAQ.jsx';
import './tailwind-style.css';

const container = document.getElementById( 'cs-faq' );
if ( container ) {
	const root = createRoot( container );
	root.render( <FAQ /> );
}
