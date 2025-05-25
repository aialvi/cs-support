import { parseISO, formatDistanceToNow } from "date-fns";

export function timeAgo(dateString) {
	const isoString = dateString.replace(" ", "T") + "Z"; // Make it UTC

	const date = parseISO(isoString); // parse ISO date in UTC
	return formatDistanceToNow(date, { addSuffix: true });
}
