import { createRoot } from "react-dom/client";
import TeamManagement from "./TeamManagement";

// Initialize the app
const container = document.getElementById("cs-support-team-management");
if (container) {
	const root = createRoot(container);
	root.render(<TeamManagement />);
}
