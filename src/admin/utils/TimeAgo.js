import { parseISO, formatDistanceToNow } from 'date-fns';

export function timeAgo( dateString ) {
	// Handle different date formats that might come from the server
	let date;

	if ( dateString.includes( 'T' ) || dateString.includes( 'Z' ) ) {
		// Already in ISO format
		date = new Date( dateString );
	} else {
		const isoString = dateString.replace( ' ', 'T' );
		date = new Date( isoString );
	}

	// Ensure we have a valid date
	if ( isNaN( date.getTime() ) ) {
		return 'Invalid date';
	}

	// formatDistanceToNow automatically uses the user's local timezone
	return formatDistanceToNow( date, { addSuffix: true } );
}
