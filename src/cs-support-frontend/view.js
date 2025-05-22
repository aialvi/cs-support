/**
 * Frontend script for the CS Support Frontend block
 */
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.cs-support-frontend-container');
    if (!container) return;

    const content = document.getElementById('cs-support-frontend-content');
    const ticketsPerPage = parseInt(container.dataset.ticketsPerPage) || 10;
    let currentPage = 1;
    let totalPages = 0;
    let allTickets = [];
    let currentTicketId = null;

    // Templates
    const ticketsTemplate = document.getElementById('cs-support-tickets-template');
    const noTicketsTemplate = document.getElementById('cs-support-no-tickets-template');
    const ticketDetailsTemplate = document.getElementById('cs-support-ticket-details-template');
    const errorTemplate = document.getElementById('cs-support-error-template');

    /**
     * Format a date string
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(document.documentElement.lang || 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit'
        }).format(date);
    }

    /**
     * Format the status display
     */
    function formatStatus(status) {
        switch(status) {
            case 'NEW':
                return '<span class="cs-ticket-status status-new">New</span>';
            case 'IN_PROGRESS':
                return '<span class="cs-ticket-status status-in-progress">In Progress</span>';
            case 'RESOLVED':
                return '<span class="cs-ticket-status status-resolved">Resolved</span>';
            default:
                return '<span class="cs-ticket-status">' + status + '</span>';
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
        content.innerHTML = '';
        const errorElement = document.importNode(errorTemplate.content, true);
        errorElement.querySelector('#cs-error-message').textContent = message;
        content.appendChild(errorElement);
    }

    /**
     * Fetch and display all tickets
     */
    async function fetchTickets() {
        try {
            const response = await fetch('/wp-json/cs-support/v1/tickets', {
                method: 'GET',
                headers: {
                    'X-WP-Nonce': wpApiSettings.nonce,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tickets');
            }

            allTickets = await response.json();
            
            if (allTickets.length === 0) {
                renderNoTickets();
            } else {
                totalPages = calculatePagination();
                renderTicketsList();
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
            showError('There was an error fetching your tickets. Please try again later.');
        }
    }

    /**
     * Render the no tickets message
     */
    function renderNoTickets() {
        content.innerHTML = '';
        const noTicketsElement = document.importNode(noTicketsTemplate.content, true);
        content.appendChild(noTicketsElement);
    }

    /**
     * Render the tickets list
     */
    function renderTicketsList() {
        content.innerHTML = '';
        const ticketsElement = document.importNode(ticketsTemplate.content, true);
        const ticketsList = ticketsElement.querySelector('#cs-support-tickets-list');
        
        // Filter tickets for current user only
        const pageTickets = getPageTickets();
        
        pageTickets.forEach(ticket => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ticket.id}</td>
                <td>
                    <a href="#" class="cs-ticket-link" data-ticket-id="${ticket.id}">
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
        document.querySelectorAll('.cs-ticket-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const ticketId = link.dataset.ticketId;
                showTicketDetails(ticketId);
            });
        });
    }

    /**
     * Render pagination
     */
    function renderPagination() {
        const paginationContainer = document.getElementById('cs-support-pagination');
        paginationContainer.innerHTML = '';
        
        if (totalPages <= 1) return;
        
        // Previous button
        const prevButton = document.createElement('button');
        prevButton.className = 'cs-pagination-button prev';
        prevButton.textContent = '←';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
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
            const pageButton = document.createElement('button');
            pageButton.className = `cs-pagination-button page ${i === currentPage ? 'active' : ''}`;
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => {
                currentPage = i;
                renderTicketsList();
            });
            paginationContainer.appendChild(pageButton);
        }
        
        // Next button
        const nextButton = document.createElement('button');
        nextButton.className = 'cs-pagination-button next';
        nextButton.textContent = '→';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
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
            const ticket = allTickets.find(t => t.id == ticketId);
            
            if (!ticket) {
                throw new Error('Ticket not found');
            }
            
            content.innerHTML = '';
            const detailsElement = document.importNode(ticketDetailsTemplate.content, true);
            
            // Populate ticket details
            detailsElement.querySelector('#cs-ticket-subject').textContent = ticket.subject;
            detailsElement.querySelector('#cs-ticket-status').innerHTML = formatStatus(ticket.status);
            detailsElement.querySelector('#cs-ticket-priority').textContent = ticket.priority ? ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1) : 'Normal';
            detailsElement.querySelector('#cs-ticket-category').textContent = ticket.category ? ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1) : 'General';
            detailsElement.querySelector('#cs-ticket-created').textContent = formatDate(ticket.created_at);
            detailsElement.querySelector('#cs-ticket-description').textContent = ticket.description;
            
            content.appendChild(detailsElement);
            
            // Set up back button
            document.getElementById('cs-support-back-button').addEventListener('click', (e) => {
                e.preventDefault();
                renderTicketsList();
            });
            
            // Set up reply form
            document.getElementById('cs-support-reply-form').addEventListener('submit', (e) => {
                e.preventDefault();
                submitReply();
            });
            
            // Fetch replies
            await fetchReplies(ticketId);
            
        } catch (error) {
            console.error('Error showing ticket details:', error);
            showError('There was an error loading the ticket details. Please try again later.');
        }
    }

    /**
     * Fetch replies for a ticket
     */
    async function fetchReplies(ticketId) {
        try {
            const response = await fetch(`/wp-json/cs-support/v1/tickets/${ticketId}/replies`, {
                method: 'GET',
                headers: {
                    'X-WP-Nonce': wpApiSettings.nonce,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch replies');
            }

            const replies = await response.json();
            
            renderReplies(replies);
        } catch (error) {
            console.error('Error fetching replies:', error);
            const repliesContainer = document.getElementById('cs-support-replies-list');
            repliesContainer.innerHTML = '<p class="cs-support-error">Failed to load replies. Please try again later.</p>';
        }
    }

    /**
     * Render replies
     */
    function renderReplies(replies) {
        const repliesContainer = document.getElementById('cs-support-replies-list');
        repliesContainer.innerHTML = '';
        
        if (replies.length === 0) {
            repliesContainer.innerHTML = '<p>No replies yet.</p>';
            return;
        }
        
        // Get ticket info for user comparison
        const ticket = allTickets.find(t => t.id == currentTicketId);
        if (!ticket) return;
        
        // Sort replies by date (oldest first)
        const sortedReplies = [...replies].sort((a, b) => {
            return new Date(a.created_at) - new Date(b.created_at);
        });
        
        sortedReplies.forEach(reply => {
            const isCustomer = reply.user_id == ticket.user_id;
            const replyElement = document.createElement('div');
            replyElement.className = `cs-support-reply ${isCustomer ? 'is-customer' : ''}`;
            
            replyElement.innerHTML = `
                <div class="cs-reply-header">
                    <div class="cs-reply-author">
                        ${isCustomer ? 'You' : 'Support Agent'}
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
        const replyTextarea = document.getElementById('cs-reply-message');
        const submitButton = document.getElementById('cs-submit-reply');
        const replyText = replyTextarea.value.trim();
        
        if (!replyText) {
            return;
        }
        
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        try {
            const response = await fetch(`/wp-json/cs-support/v1/tickets/${currentTicketId}/replies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': wpApiSettings.nonce,
                },
                body: JSON.stringify({ reply: replyText }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit reply');
            }
            
            // Clear form and fetch updated replies
            replyTextarea.value = '';
            await fetchReplies(currentTicketId);
            
        } catch (error) {
            console.error('Error submitting reply:', error);
            showError('There was an error submitting your reply. Please try again later.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Reply';
        }
    }

    // Initialize by loading tickets
    fetchTickets();
});
