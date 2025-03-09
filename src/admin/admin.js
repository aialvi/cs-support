import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import './tailwind-style.css';

const config = window.CS_SUPPORT_HELPDESK_CONFIG;
const domNode = document.getElementById(config.containerId);

console.log(window.CS_SUPPORT_HELPDESK_CONFIG);
if (domNode) {
	createRoot(domNode).render(React.createElement(App, config));
}
