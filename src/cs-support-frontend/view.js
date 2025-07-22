/**
 * Frontend script for the ClientSync Support Frontend block
 */

import { __ } from '@wordpress/i18n';

// Enhanced styling and functionality support
class CSSupportFrontendEnhancer {
    constructor(container) {
        this.container = container;
        this.initializeEnhancements();
    }

    initializeEnhancements() {
        this.setupCustomColors();
        this.setupSearchAndFilters();
        this.setupSortableHeaders();
        this.setupResponsiveFeatures();
    }

    setupCustomColors() {
        const {
            successColor,
            warningColor,
            errorColor,
            primaryColor
        } = this.container.dataset;

        if (primaryColor) {
            this.container.style.setProperty('--cs-primary-color', primaryColor);
            this.container.style.setProperty('--cs-primary-color-hover', this.darkenColor(primaryColor, 10));
        }
        if (successColor) {
            this.container.style.setProperty('--cs-success-color', successColor);
            this.container.style.setProperty('--cs-success-color-rgb', this.hexToRgb(successColor));
        }
        if (warningColor) {
            this.container.style.setProperty('--cs-warning-color', warningColor);
            this.container.style.setProperty('--cs-warning-color-rgb', this.hexToRgb(warningColor));
        }
        if (errorColor) {
            this.container.style.setProperty('--cs-error-color', errorColor);
            this.container.style.setProperty('--cs-error-color-rgb', this.hexToRgb(errorColor));
        }
    }

    setupSearchAndFilters() {
        const showSearch = this.container.dataset.showSearch === 'true';
        const showFilters = this.container.dataset.showFilters === 'true';

        if (showSearch || showFilters) {
            this.createControlsContainer();
            
            if (showSearch) {
                this.createSearchInput();
            }
            
            if (showFilters) {
                this.createFilterButtons();
            }
        }
    }

    createControlsContainer() {
        const content = this.container.querySelector('#cs-support-frontend-content');
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'cs-support-controls';
        content.insertBefore(controlsContainer, content.firstChild);
        this.controlsContainer = controlsContainer;
    }

    createSearchInput() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'cs-support-search';
        
        const searchInput = document.createElement('input');
        searchInput.type = 'search';
        searchInput.placeholder = __('Search tickets...', 'clientsync-support');
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        searchContainer.appendChild(searchInput);
        this.controlsContainer.appendChild(searchContainer);
    }

    createFilterButtons() {
        const filtersContainer = document.createElement('div');
        filtersContainer.className = 'cs-support-filters';
        
        const filters = [
            { label: __('All', 'clientsync-support'), value: 'all' },
            { label: __('New', 'clientsync-support'), value: 'new' },
            { label: __('In Progress', 'clientsync-support'), value: 'in-progress' },
            { label: __('Resolved', 'clientsync-support'), value: 'resolved' }
        ];

        filters.forEach(filter => {
            const button = document.createElement('button');
            button.className = 'filter-button';
            button.textContent = filter.label;
            button.dataset.filter = filter.value;
            if (filter.value === 'all') button.classList.add('active');
            
            button.addEventListener('click', (e) => this.handleFilter(e.target.dataset.filter, e.target));
            filtersContainer.appendChild(button);
        });

        this.controlsContainer.appendChild(filtersContainer);
    }

    setupSortableHeaders() {
        const enableSorting = this.container.dataset.enableSorting === 'true';
        if (!enableSorting) return;

        // Add sortable functionality when table is rendered
        this.container.addEventListener('ticketsRendered', () => {
            const headers = this.container.querySelectorAll('.cs-support-tickets-table th');
            headers.forEach((header, index) => {
                header.classList.add('sortable-header');
                header.addEventListener('click', () => this.handleSort(index, header));
            });
        });
    }

    setupResponsiveFeatures() {
        const compactView = this.container.dataset.compactView === 'true';
        if (compactView) {
            this.container.classList.add('compact-view');
        }
    }

    handleSearch(query) {
        // Custom event for search functionality
        this.container.dispatchEvent(new CustomEvent('csSearchTickets', {
            detail: { query }
        }));
    }

    handleFilter(filterValue, button) {
        // Update active state
        this.controlsContainer.querySelectorAll('.filter-button').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        // Custom event for filter functionality
        this.container.dispatchEvent(new CustomEvent('csFilterTickets', {
            detail: { filter: filterValue }
        }));
    }

    handleSort(columnIndex, header) {
        const currentSort = header.dataset.sort || 'none';
        let newSort = 'asc';
        
        if (currentSort === 'asc') {
            newSort = 'desc';
        } else if (currentSort === 'desc') {
            newSort = 'none';
        }

        // Clear other headers
        this.container.querySelectorAll('.cs-support-tickets-table th').forEach(h => {
            h.classList.remove('sort-asc', 'sort-desc');
            h.dataset.sort = 'none';
        });

        // Set current header
        if (newSort !== 'none') {
            header.classList.add(`sort-${newSort}`);
            header.dataset.sort = newSort;
        }

        // Custom event for sort functionality
        this.container.dispatchEvent(new CustomEvent('csSortTickets', {
            detail: { column: columnIndex, direction: newSort }
        }));
    }

    // Utility functions
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
            '0, 0, 0';
    }

    darkenColor(hex, percent) {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
}

// Ensure WordPress API settings are available
const getApiSettings = () => {
	if (typeof wpApiSettings !== 'undefined') {
		return wpApiSettings;
	}
	
	// Fallback: try to get from WordPress REST API
	if (typeof wp !== 'undefined' && wp.api && wp.api.wpApiSettings) {
		return wp.api.wpApiSettings;
	}
	
	// Last fallback: construct from available WordPress globals
	return {
		nonce: document.querySelector('meta[name="wp-rest-nonce"]')?.getAttribute('content') || '',
		root: (typeof wpApiSettings !== 'undefined' && wpApiSettings.root) || '/wp-json/'
	};
};

document.addEventListener("DOMContentLoaded", () => {
	const container = document.querySelector(".cs-support-frontend-container");
	if (!container) return;

	// Initialize enhanced frontend functionality
	const enhancer = new CSSupportFrontendEnhancer(container);

	const content = document.getElementById("cs-support-frontend-content");
	const ticketsPerPage = parseInt(container.dataset.ticketsPerPage) || 10;
	let currentPage = 1;
	let totalPages = 0;
	let allTickets = [];
	let currentTicketId = null;

	// Templates
	const ticketsTemplate = document.getElementById(
		"cs-support-tickets-template",
	);
	const noTicketsTemplate = document.getElementById(
		"cs-support-no-tickets-template",
	);
	const ticketDetailsTemplate = document.getElementById(
		"cs-support-ticket-details-template",
	);
	const errorTemplate = document.getElementById("cs-support-error-template");

	/**
	 * Format a date string
	 */
	function formatDate(dateString) {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat(document.documentElement.lang || "en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	}

	/**
	 * Format the status display
	 */
	function formatStatus(status) {
		switch (status) {
			case "NEW":
				return '<span class="cs-ticket-status status-new">New</span>';
			case "IN_PROGRESS":
				return '<span class="cs-ticket-status status-in-progress">In Progress</span>';
			case "RESOLVED":
				return '<span class="cs-ticket-status status-resolved">Resolved</span>';
			default:
				return '<span class="cs-ticket-status">' + status + "</span>";
		}
	}

	/**
	 * Calculate pagination
	 */
	function calculatePagination() {
		return Math.ceil(allTickets.length / ticketsPerPage);
	}

	/**
	 * Get tickets to show on the current page
	 */
	function getPageTickets() {
		const startIndex = (currentPage - 1) * ticketsPerPage;
		const endIndex = startIndex + ticketsPerPage;
		return allTickets.slice(startIndex, endIndex);
	}

	/**
	 * Show error message
	 */
	function showError(message) {
		content.innerHTML = "";
		const errorElement = document.importNode(errorTemplate.content, true);
		const errorMessage = errorElement.querySelector("#cs-error-message");
		errorMessage.textContent = message;

		// Add accessibility attributes
		const errorContainer = errorElement.querySelector(".cs-support-error");
		errorContainer.setAttribute("role", "alert");
		errorContainer.setAttribute("aria-live", "assertive");

		content.appendChild(errorElement);
	}

	/**
	 * Fetch and display all tickets for the current user
	 */
	async function fetchTickets() {
		try {
			// Add current_user=true parameter to ensure we only get tickets for the current user
			const apiSettings = getApiSettings();
			const response = await fetch(
				"/wp-json/cs-support/v1/tickets?current_user=true",
				{
					method: "GET",
					headers: {
						"X-WP-Nonce": apiSettings.nonce,
						"Content-Type": "application/json",
					},
				},
			);

			if (!response.ok) {
				throw new Error("Failed to fetch tickets");
			}

			allTickets = await response.json();

			if (allTickets.length === 0) {
				renderNoTickets();
			} else {
				totalPages = calculatePagination();
				renderTicketsList();
			}
		} catch (error) {
			console.error("Error fetching tickets:", error);
			showError(
				"There was an error fetching your tickets. Please try again later.",
			);
		}
	}

	/**
	 * Render the no tickets message
	 */
	function renderNoTickets() {
		content.innerHTML = "";
		const noTicketsElement = document.importNode(
			noTicketsTemplate.content,
			true,
		);
		content.appendChild(noTicketsElement);
	}

	/**
	 * Render the tickets list
	 */
	function renderTicketsList() {
		content.innerHTML = "";
		const ticketsElement = document.importNode(ticketsTemplate.content, true);
		const ticketsList = ticketsElement.querySelector(
			"#cs-support-tickets-list",
		);

		// Filter tickets for current user only
		const pageTickets = getPageTickets();

		pageTickets.forEach((ticket) => {
			const row = document.createElement("tr");
			row.innerHTML = `
                <td>${ticket.id}</td>
                <td>
                    <a href="#" class="cs-ticket-link" data-ticket-id="${
											ticket.id
										}" aria-label="View details of ticket: ${ticket.subject}">
                        ${ticket.subject}
                    </a>
                </td>
                <td>${formatStatus(ticket.status)}</td>
                <td>${formatDate(ticket.created_at)}</td>
            `;
			ticketsList.appendChild(row);
		});

		content.appendChild(ticketsElement);
		renderPagination();

		// Add event listeners to ticket links
		document.querySelectorAll(".cs-ticket-link").forEach((link) => {
			link.addEventListener("click", (e) => {
				e.preventDefault();
				const ticketId = link.dataset.ticketId;
				showTicketDetails(ticketId);
			});
		});

		// Emit event for enhanced functionality
		container.dispatchEvent(new CustomEvent('ticketsRendered'));
	}

	/**
	 * Render pagination
	 */
	function renderPagination() {
		const paginationContainer = document.getElementById(
			"cs-support-pagination",
		);
		paginationContainer.innerHTML = "";

		if (totalPages <= 1) return;

		// Previous button
		const prevButton = document.createElement("button");
		prevButton.className = "cs-pagination-button prev";
		prevButton.textContent = "←";
		prevButton.disabled = currentPage === 1;
		prevButton.setAttribute("aria-label", "Previous page");
		prevButton.addEventListener("click", () => {
			if (currentPage > 1) {
				currentPage--;
				renderTicketsList();
			}
		});
		paginationContainer.appendChild(prevButton);

		// Page buttons
		const maxButtons = 5;
		let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
		let endPage = Math.min(totalPages, startPage + maxButtons - 1);

		if (endPage - startPage + 1 < maxButtons) {
			startPage = Math.max(1, endPage - maxButtons + 1);
		}

		for (let i = startPage; i <= endPage; i++) {
			const pageButton = document.createElement("button");
			pageButton.className = `cs-pagination-button page ${
				i === currentPage ? "active" : ""
			}`;
			pageButton.textContent = i;
			pageButton.setAttribute("aria-label", `Page ${i}`);
			pageButton.setAttribute(
				"aria-current",
				i === currentPage ? "page" : "false",
			);
			pageButton.addEventListener("click", () => {
				currentPage = i;
				renderTicketsList();
			});
			paginationContainer.appendChild(pageButton);
		}

		// Next button
		const nextButton = document.createElement("button");
		nextButton.className = "cs-pagination-button next";
		nextButton.textContent = "→";
		nextButton.disabled = currentPage === totalPages;
		nextButton.setAttribute("aria-label", "Next page");
		nextButton.addEventListener("click", () => {
			if (currentPage < totalPages) {
				currentPage++;
				renderTicketsList();
			}
		});
		paginationContainer.appendChild(nextButton);
	}

	/**
	 * Fetch and show ticket details
	 */
	async function showTicketDetails(ticketId) {
		try {
			currentTicketId = ticketId;

			// Find ticket in already loaded tickets
			const ticket = allTickets.find((t) => t.id == ticketId);

			if (!ticket) {
				throw new Error("Ticket not found");
			}

			content.innerHTML = "";
			const detailsElement = document.importNode(
				ticketDetailsTemplate.content,
				true,
			);

			// Populate ticket details
			detailsElement.querySelector("#cs-ticket-subject").textContent =
				ticket.subject;
			detailsElement.querySelector("#cs-ticket-status").innerHTML =
				formatStatus(ticket.status);
			detailsElement.querySelector("#cs-ticket-priority").textContent =
				ticket.priority
					? ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)
					: "Normal";
			detailsElement.querySelector("#cs-ticket-category").textContent =
				ticket.category
					? ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)
					: "General";
			detailsElement.querySelector("#cs-ticket-created").textContent =
				formatDate(ticket.created_at);
			detailsElement.querySelector("#cs-ticket-description").textContent =
				ticket.description;

			// Add ARIA live region for screen reader announcements
			const liveRegion = document.createElement("div");
			liveRegion.setAttribute("aria-live", "polite");
			liveRegion.setAttribute("class", "sr-only");
			liveRegion.textContent = `Ticket details for ${ticket.subject} loaded`;

			content.appendChild(detailsElement);
			content.appendChild(liveRegion);

			// Remove the announcement after it's been read
			setTimeout(() => {
				if (liveRegion.parentNode) {
					liveRegion.parentNode.removeChild(liveRegion);
				}
			}, 1000);

			// Set up back button
			const backButton = document.getElementById("cs-support-back-button");
			backButton.addEventListener("click", (e) => {
				e.preventDefault();
				renderTicketsList();
			});
			// Add keyboard support for back button
			backButton.addEventListener("keydown", (e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					renderTicketsList();
				}
			});

			// Set up reply form
			document
				.getElementById("cs-support-reply-form")
				.addEventListener("submit", (e) => {
					e.preventDefault();
					submitReply();
				});

			// Fetch replies
			await fetchReplies(ticketId);
		} catch (error) {
			console.error("Error showing ticket details:", error);
			showError(
				"There was an error loading the ticket details. Please try again later.",
			);
		}
	}

	/**
	 * Fetch replies for a ticket
	 */
	async function fetchReplies(ticketId) {
		try {
			const apiSettings = getApiSettings();
			const response = await fetch(
				`/wp-json/cs-support/v1/tickets/${ticketId}/replies`,
				{
					method: "GET",
					headers: {
						"X-WP-Nonce": apiSettings.nonce,
						"Content-Type": "application/json",
					},
				},
			);

			if (!response.ok) {
				throw new Error("Failed to fetch replies");
			}

			const replies = await response.json();

			renderReplies(replies);
		} catch (error) {
			console.error("Error fetching replies:", error);
			const repliesContainer = document.getElementById(
				"cs-support-replies-list",
			);
			repliesContainer.innerHTML =
				'<p class="cs-support-error">Failed to load replies. Please try again later.</p>';
		}
	}

	/**
	 * Render replies
	 */
	function renderReplies(replies) {
		const repliesContainer = document.getElementById("cs-support-replies-list");
		repliesContainer.innerHTML = "";

		if (replies.length === 0) {
			repliesContainer.innerHTML = "<p>No replies yet.</p>";
			return;
		}

		// Get ticket info for user comparison
		const ticket = allTickets.find((t) => t.id == currentTicketId);
		if (!ticket) return;

		// Sort replies by date (oldest first)
		const sortedReplies = [...replies].sort((a, b) => {
			return new Date(a.created_at) - new Date(b.created_at);
		});

		sortedReplies.forEach((reply) => {
			const isCustomer = reply.user_id == ticket.user_id;
			const replyElement = document.createElement("div");
			replyElement.className = `cs-support-reply ${
				isCustomer ? "is-customer" : ""
			}`;

			replyElement.innerHTML = `
                <div class="cs-reply-header">
                    <div class="cs-reply-author">
                        ${isCustomer ? "You" : "Support Agent"}
                    </div>
                    <div class="cs-reply-date">
                        ${formatDate(reply.created_at)}
                    </div>
                </div>
                <div class="cs-reply-content">
                    ${reply.reply}
                </div>
            `;

			repliesContainer.appendChild(replyElement);
		});
	}

	/**
	 * Submit a reply
	 */
	async function submitReply() {
		const replyTextarea = document.getElementById("cs-reply-message");
		const submitButton = document.getElementById("cs-submit-reply");
		const replyText = replyTextarea.value.trim();

		if (!replyText) {
			// Add accessible error message
			const errorMsg = document.createElement("div");
			errorMsg.className = "cs-form-error";
			errorMsg.setAttribute("role", "alert");
			errorMsg.textContent = "Please enter a reply before submitting.";

			// Insert error message after the textarea
			replyTextarea.parentNode.insertBefore(
				errorMsg,
				replyTextarea.nextSibling,
			);

			// Focus the textarea
			replyTextarea.focus();

			// Remove the error message after 5 seconds
			setTimeout(() => {
				if (errorMsg.parentNode) {
					errorMsg.parentNode.removeChild(errorMsg);
				}
			}, 5000);

			return;
		}

		submitButton.disabled = true;
		submitButton.setAttribute("aria-busy", "true");
		submitButton.textContent = "Sending...";

		try {				const apiSettings = getApiSettings();
				const response = await fetch(
					`/wp-json/cs-support/v1/tickets/${currentTicketId}/replies`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"X-WP-Nonce": apiSettings.nonce,
						},
						body: JSON.stringify({ reply: replyText }),
					},
			);

			if (!response.ok) {
				throw new Error("Failed to submit reply");
			}

			// Clear form and fetch updated replies
			replyTextarea.value = "";
			await fetchReplies(currentTicketId);
		} catch (error) {
			console.error("Error submitting reply:", error);
			showError(
				"There was an error submitting your reply. Please try again later.",
			);
		} finally {
			submitButton.disabled = false;
			submitButton.setAttribute("aria-busy", "false");
			submitButton.textContent = "Send Reply";
		}
	}

	// Initialize by loading tickets
	fetchTickets();

	// Initialize enhancements
	new CSSupportFrontendEnhancer(container);
});
