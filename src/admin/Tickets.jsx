import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import TicketAssignment from "./TicketAssignment";

import {
	EyeIcon,
	XMarkIcon,
	ChatBubbleLeftRightIcon,
	DocumentTextIcon,
	UserIcon,
	SparklesIcon,
	CheckIcon,
	XCircleIcon,
} from "@heroicons/react/24/outline";

export default function Tickets() {
	const [tickets, setTickets] = useState([]);
	const [selectedTicket, setSelectedTicket] = useState(null);
	const [replies, setReplies] = useState([]);
	const [newReply, setNewReply] = useState("");
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [updatingStatus, setUpdatingStatus] = useState(false);
	const [isGeneratingAIReply, setIsGeneratingAIReply] = useState(false);
	const [aiReply, setAiReply] = useState("");
	const [showAiReply, setShowAiReply] = useState(false);
	const [aiEnabled, setAiEnabled] = useState(false);

	// Fetch tickets on mount
	useEffect(() => {
		fetchTickets();
	}, []);

	// Check if AI is enabled
	useEffect(() => {
		const checkAISettings = async () => {
			try {
				const response = await fetch('/wp-json/cs-support/v1/settings', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': CS_SUPPORT_HELPDESK_TICKETS_CONFIG.nonce,
					},
				});
				
				if (response.ok) {
					const data = await response.json();
					setAiEnabled(data?.ai?.enabled && data?.ai?.apiKey);
				}
			} catch (error) {
				console.error('Failed to check AI settings:', error);
			}
		};
		
		checkAISettings();
	}, []);

	// Handle ticket_id URL parameter on initial load
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const ticketId = urlParams.get('ticket_id');
		
		if (ticketId) {
			// Fetch the specific ticket immediately
			fetchSingleTicket(ticketId).then(ticket => {
				if (ticket) {
					setSelectedTicket(ticket);
				}
			});
		}
	}, []); // Empty dependency array - runs only on mount

	// Check for ticket_id in URL parameters and auto-open ticket
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const ticketId = urlParams.get('ticket_id');
		
		if (ticketId) {
			// First try to find in existing tickets
			const ticket = tickets.find(t => t.id == ticketId);
			if (ticket) {
				setSelectedTicket(ticket);
			} else if (tickets.length > 0) {
				// If not found in existing tickets, try to fetch it individually
				fetchSingleTicket(ticketId).then(ticket => {
					if (ticket) {
						setSelectedTicket(ticket);
					}
				});
			}
		}
	}, [tickets]);

	// Fetch replies when ticket selected and update URL
	useEffect(() => {
		if (selectedTicket) {
			fetchReplies(selectedTicket.id);

			// Update URL to include ticket_id parameter
			const currentUrl = new URL(window.location);
			currentUrl.searchParams.set('ticket_id', selectedTicket.id);
			window.history.pushState({}, '', currentUrl.toString());

			// Add event listener for Escape key to close modal
			const handleEscapeKey = (e) => {
				if (e.key === "Escape") {
					setSelectedTicket(null);
				}
			};

			document.addEventListener("keydown", handleEscapeKey);

			// Focus the modal heading for screen readers
			const modalTitle = document.getElementById("ticket-modal-title");
			if (modalTitle) {
				modalTitle.focus();
			}

			// Clean up event listener
			return () => {
				document.removeEventListener("keydown", handleEscapeKey);
			};
		} else {
			// Remove ticket_id parameter from URL when modal is closed
			const currentUrl = new URL(window.location);
			if (currentUrl.searchParams.has('ticket_id')) {
				currentUrl.searchParams.delete('ticket_id');
				window.history.pushState({}, '', currentUrl.toString());
			}
		}
	}, [selectedTicket]);

	const fetchTickets = async () => {
		try {
			const response = await fetch("/wp-json/cs-support/v1/tickets", {
				headers: {
					"X-WP-Nonce": CS_SUPPORT_HELPDESK_TICKETS_CONFIG.nonce,
				},
			});
			const data = await response.json();
			setTickets(data);
		} catch (error) {
			console.error("Error fetching tickets:", error);
		} finally {
			setLoading(false);
		}
	};

	const notify = (message = "Added") =>
		toast(message, {
			autoClose: 2000,
			position: "bottom-right",
		});

	const fetchReplies = async (ticketId) => {
		try {
			const response = await fetch(
				`/wp-json/cs-support/v1/tickets/${ticketId}/replies`,
				{
					headers: {
						"X-WP-Nonce": CS_SUPPORT_HELPDESK_TICKETS_CONFIG.nonce,
					},
				},
			);
			const data = await response.json();
			setReplies(data);
		} catch (error) {
			console.error("Error fetching replies:", error);
		}
	};

	const handleSubmitReply = async (e) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			const response = await fetch(
				`/wp-json/cs-support/v1/tickets/${selectedTicket.id}/replies`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"X-WP-Nonce": CS_SUPPORT_HELPDESK_TICKETS_CONFIG.nonce,
					},
					body: JSON.stringify({ reply: newReply }),
				},
			);

			if (response.ok) {
				notify();
				setNewReply("");
				fetchReplies(selectedTicket.id);
			}
		} catch (error) {
			console.error("Error submitting reply:", error);
		} finally {
			setSubmitting(false);
		}
	};

	const handleStatusUpdate = async (newStatus) => {
		if (!selectedTicket || newStatus === selectedTicket.status) return;

		setUpdatingStatus(true);
		try {
			const response = await fetch(
				`/wp-json/cs-support/v1/tickets/${selectedTicket.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						"X-WP-Nonce": CS_SUPPORT_HELPDESK_TICKETS_CONFIG.nonce,
					},
					body: JSON.stringify({ status: newStatus }),
				},
			);

			if (response.ok) {
				const updatedTicket = await response.json();

				// Update the selected ticket with the new status
				setSelectedTicket((prevTicket) => ({
					...prevTicket,
					status: newStatus,
				}));

				// Update the ticket in the tickets list
				setTickets((prevTickets) =>
					prevTickets.map((ticket) =>
						ticket.id === selectedTicket.id
							? { ...ticket, status: newStatus }
							: ticket,
					),
				);

				// Add a system note about the status change
				const statusMessage = `System: Ticket status changed to "${
					newStatus === "NEW"
						? "New"
						: newStatus === "IN_PROGRESS"
						? "In Progress"
						: "Resolved"
				}"`;

				try {
					// Add a system note as a reply
					await fetch(
						`/wp-json/cs-support/v1/tickets/${selectedTicket.id}/replies`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								"X-WP-Nonce": CS_SUPPORT_HELPDESK_TICKETS_CONFIG.nonce,
							},
							body: JSON.stringify({
								reply: statusMessage,
								is_system_note: true,
							}),
						},
					);

					// Refresh replies to show the system note
					fetchReplies(selectedTicket.id);
				} catch (error) {
					console.error("Error adding system note:", error);
				}

				notify("Status updated");
			} else {
				console.error("Failed to update status");
				toast.error("Failed to update status", {
					autoClose: 2000,
					position: "bottom-right",
				});
			}
		} catch (error) {
			console.error("Error updating status:", error);
			toast.error("Error updating status", {
				autoClose: 2000,
				position: "bottom-right",
			});
		} finally {
			setUpdatingStatus(false);
		}
	};

	const handleAssignmentChange = (updatedTicket) => {
		// Update the ticket in the tickets list
		setTickets(tickets.map(ticket => 
			ticket.id === updatedTicket.id ? updatedTicket : ticket
		));
		
		// Update selected ticket if it's the same one
		if (selectedTicket && selectedTicket.id === updatedTicket.id) {
			setSelectedTicket(updatedTicket);
		}
	};

	const fetchSingleTicket = async (ticketId) => {
		try {
			const response = await fetch(
				`/wp-json/cs-support/v1/tickets/${ticketId}`,
				{
					headers: {
						"X-WP-Nonce": CS_SUPPORT_HELPDESK_TICKETS_CONFIG.nonce,
					},
				},
			);
			
			if (response.ok) {
				const ticket = await response.json();
				return ticket;
			} else if (response.status === 403) {
				toast.error("You don't have permission to access this ticket");
				return null;
			} else {
				toast.error("Ticket not found");
				return null;
			}
		} catch (error) {
			console.error("Error fetching ticket:", error);
			toast.error("Failed to load ticket");
			return null;
		}
	};

	// AI reply generation functions
	const generateAIReply = async () => {
		if (!selectedTicket || isGeneratingAIReply) return;

		setIsGeneratingAIReply(true);
		setShowAiReply(false);

		try {
			const response = await fetch('/wp-json/cs-support/v1/ai/generate-reply', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': CS_SUPPORT_HELPDESK_TICKETS_CONFIG.nonce,
				},
				body: JSON.stringify({
					ticket_id: selectedTicket.id,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				setAiReply(data.reply || '');
				setShowAiReply(true);
			} else {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to generate AI reply');
			}
		} catch (error) {
			console.error('Failed to generate AI reply:', error);
			toast.error(error.message || 'Failed to generate AI reply', {
				autoClose: 3000,
				position: "bottom-right",
			});
		} finally {
			setIsGeneratingAIReply(false);
		}
	};

	const acceptAIReply = () => {
		setNewReply(aiReply);
		setShowAiReply(false);
		setAiReply('');
		
		// Focus the textarea
		const textarea = document.getElementById('reply-textarea');
		if (textarea) {
			textarea.focus();
		}
		
		toast.success('AI reply accepted', {
			autoClose: 2000,
			position: "bottom-right",
		});
	};

	const rejectAIReply = () => {
		setShowAiReply(false);
		setAiReply('');
		
		toast.info('AI reply rejected', {
			autoClose: 2000,
			position: "bottom-right",
		});
	};

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold my-4" tabIndex="-1">
				Support Tickets
			</h1>

			{loading ? (
				<div aria-live="polite" role="status">
					Loading tickets...
				</div>
			) : (
				<div className="bg-white shadow-md rounded-lg overflow-hidden mt-2">
					<table
						className="min-w-full divide-y divide-gray-200"
						aria-label="Support tickets"
					>
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									ID
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Subject
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Priority
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Assigned To
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Created
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						{tickets.length > 0 ? (
							<tbody className="divide-y divide-gray-200">
								{tickets.map((ticket) => (
									<tr key={ticket.id}>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											#{ticket.id}
										</td>
										<td
											className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer hover:underline"
											onClick={() => setSelectedTicket(ticket)}
											tabIndex="0"
											role="button"
											aria-label={`View ticket: ${ticket.subject}`}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													setSelectedTicket(ticket);
												}
											}}
										>
											{ticket.subject}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
												ticket.status === "NEW"
													? "bg-yellow-100 text-yellow-800"
													: ticket.status === "IN_PROGRESS"
													? "bg-blue-100 text-blue-800"
													: "bg-green-100 text-green-800"
											}`}
											>
												{ticket.status === "NEW"
													? "New"
													: ticket.status === "IN_PROGRESS"
													? "In Progress"
													: "Resolved"}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											<span
												className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
												ticket.priority === "low"
													? "bg-gray-100 text-gray-800"
													: ticket.priority === "normal"
													? "bg-blue-100 text-blue-800"
													: ticket.priority === "high"
													? "bg-orange-100 text-orange-800"
													: "bg-red-100 text-red-800"
											}`}
											>
												{ticket.priority}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											<TicketAssignment 
												ticket={ticket} 
												onAssignmentChange={handleAssignmentChange}
											/>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{new Date(ticket.created_at).toLocaleDateString()}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<button
												onClick={() => setSelectedTicket(ticket)}
												className="text-emerald-600 hover:text-emerald-900 p-1 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
												aria-label={`View details of ticket: ${ticket.subject}`}
												title="View ticket details"
											>
												<EyeIcon className="h-5 w-5" aria-hidden="true" />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						) : (
							<tbody>
								<tr>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										No tickets found.
									</td>
								</tr>
							</tbody>
						)}
					</table>
				</div>
			)}

			{/* Reply Modal */}
			{selectedTicket && (
				<div
					className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby="ticket-modal-title"
					onClick={(e) => {
						// Close modal when clicking outside the modal content
						if (e.target === e.currentTarget) {
							setSelectedTicket(null);
						}
					}}
				>
					<div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
						<div className="p-4 shadow shadow-gray-200 flex justify-between items-center">
							<div className="flex items-center space-x-4">
								<h2 className="text-xl font-semibold" id="ticket-modal-title">
									Ticket #{selectedTicket.id}
								</h2>
								<div className="relative">
									<select
										value={selectedTicket.status}
										onChange={(e) => handleStatusUpdate(e.target.value)}
										disabled={updatingStatus}
										aria-label="Change ticket status"
										className={`text-sm font-medium py-1 px-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-offset-1
											${
												selectedTicket.status === "NEW"
													? "bg-yellow-100 text-yellow-800 border-yellow-200 focus:ring-yellow-300"
													: selectedTicket.status === "IN_PROGRESS"
													? "bg-blue-100 text-blue-800 border-blue-200 focus:ring-blue-300"
													: "bg-green-100 text-green-800 border-green-200 focus:ring-green-300"
											}`}
									>
										<option value="NEW">New</option>
										<option value="IN_PROGRESS">In Progress</option>
										<option value="RESOLVED">Resolved</option>
									</select>
									{updatingStatus && (
										<div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
											<svg
												className="animate-spin h-4 w-4 text-gray-500"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												></circle>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												></path>
											</svg>
										</div>
									)}
								</div>
							</div>
							<button
								onClick={() => setSelectedTicket(null)}
								className="text-gray-500 hover:text-gray-700 p-1 rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
								aria-label="Close ticket details"
								title="Close"
							>
								<XMarkIcon className="h-6 w-6" aria-hidden="true" />
							</button>
						</div>

						<div className="p-4 overflow-y-auto max-h-[60vh]">
							<div className="mb-4">
								<h3 className="font-medium text-gray-900">
									‟{selectedTicket.subject}”
								</h3>
								<p className="text-sm text-gray-500">
									{selectedTicket.user_name} &lt;{selectedTicket.user_email}&gt;
								</p>
							</div>

							<div className="mb-4 p-4 bg-indigo-50">
								<p>{selectedTicket.description}</p>
							</div>

							<div className="mb-4">
								{replies.map((reply) => (
									<div
										key={reply.id}
										className={`mb-3 p-3 rounded-lg ${
											reply.is_system_note
												? "bg-gray-100 border border-gray-200"
												: "bg-gray-50"
										}`}
									>
										<div className="flex items-start space-x-3">
											{reply.is_system_note ? (
												<DocumentTextIcon className="h-5 w-5 text-gray-400" />
											) : (
												<ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400" />
											)}
											<div>
												<p
													className={`text-sm ${
														reply.is_system_note
															? "text-gray-600 italic"
															: "text-gray-900"
													}`}
												>
													{reply.reply}
												</p>
												<p className="text-xs text-gray-500 mt-1">
													{new Date(reply.created_at).toLocaleString()}
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="p-4 shadow shadow-gray-600">
							{/* AI Suggestion Display */}
							{showAiReply && (
								<div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
									<div className="flex items-center gap-2 mb-3">
										<SparklesIcon className="h-5 w-5 text-blue-600" />
										<h4 className="text-sm font-medium text-blue-900">AI Suggestion</h4>
									</div>
									<div className="text-sm text-gray-800 whitespace-pre-wrap mb-3 p-3 bg-white rounded border">
										{aiReply}
									</div>
									<div className="flex justify-end gap-2">
										<button
											onClick={acceptAIReply}
											className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
											aria-label="Accept AI reply"
										>
											<CheckIcon className="h-4 w-4" />
											Accept
										</button>
										<button
											onClick={rejectAIReply}
											className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
											aria-label="Reject AI reply"
										>
											<XCircleIcon className="h-4 w-4" />
											Reject
										</button>
									</div>
								</div>
							)}

							<form onSubmit={handleSubmitReply}>
								<div className="relative">
									<label htmlFor="reply-textarea" className="sr-only">
										Type your reply
									</label>
									<textarea
										id="reply-textarea"
										value={newReply}
										onChange={(e) => setNewReply(e.target.value)}
										className="w-full p-3 border rounded-md resize-none"
										rows="4"
										placeholder="Type your reply..."
										required
										aria-label="Reply to support ticket"
									/>
									{aiEnabled && (
										<button
											type="button"
											onClick={generateAIReply}
											disabled={isGeneratingAIReply}
											className="absolute top-2 right-2 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
											title="Generate AI suggestion"
											aria-label="Generate AI reply suggestion"
										>
											{isGeneratingAIReply ? (
												<svg
													className="animate-spin h-5 w-5"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
												>
													<circle
														className="opacity-25"
														cx="12"
														cy="12"
														r="10"
														stroke="currentColor"
														strokeWidth="4"
													></circle>
													<path
														className="opacity-75"
														fill="currentColor"
														d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
													></path>
												</svg>
											) : (
												<SparklesIcon className="h-5 w-5" />
											)}
										</button>
									)}
								</div>
								<div className="flex gap-2 mt-3">
									<button
										type="submit"
										disabled={submitting}
										aria-busy={submitting}
										className="flex-1 shadow shadow-blue-500/100 px-4 py-2 rounded-md disabled:opacity-50 text-center hover:shadow-blue-600/100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
									>
										{submitting ? "Sending..." : "Reply"}
									</button>
									{aiEnabled && !showAiReply && (
										<button
											type="button"
											onClick={generateAIReply}
											disabled={isGeneratingAIReply}
											className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md shadow hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
											aria-label="Generate AI reply"
										>
											{isGeneratingAIReply ? (
												<>
													<svg
														className="animate-spin h-4 w-4 inline-block mr-2"
														xmlns="http://www.w3.org/2000/svg"
														fill="none"
														viewBox="0 0 24 24"
													>
														<circle
															className="opacity-25"
															cx="12"
															cy="12"
															r="10"
															stroke="currentColor"
															strokeWidth="4"
														></circle>
														<path
															className="opacity-75"
															fill="currentColor"
															d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
														></path>
													</svg>
													Generating...
												</>
											) : (
												<>
													<SparklesIcon className="h-4 w-4 inline-block mr-2" />
													AI Assist
												</>
											)}
										</button>
									)}
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
