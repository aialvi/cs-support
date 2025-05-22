import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import {
	EyeIcon,
	XMarkIcon,
	ChatBubbleLeftRightIcon,
	DocumentTextIcon,
} from "@heroicons/react/24/outline";

export default function Tickets() {
	const [tickets, setTickets] = useState([]);
	const [selectedTicket, setSelectedTicket] = useState(null);
	const [replies, setReplies] = useState([]);
	const [newReply, setNewReply] = useState("");
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [updatingStatus, setUpdatingStatus] = useState(false);

	// Fetch tickets on mount
	useEffect(() => {
		fetchTickets();
	}, []);

	// Fetch replies when ticket selected
	useEffect(() => {
		if (selectedTicket) {
			fetchReplies(selectedTicket.id);
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
				setSelectedTicket(prevTicket => ({
					...prevTicket,
					status: newStatus
				}));

				// Update the ticket in the tickets list
				setTickets(prevTickets =>
					prevTickets.map(ticket =>
						ticket.id === selectedTicket.id
							? { ...ticket, status: newStatus }
							: ticket
					)
				);

				// Add a system note about the status change
				const statusMessage = `System: Ticket status changed to "${newStatus === 'NEW' ? 'New' : newStatus === 'IN_PROGRESS' ? 'In Progress' : 'Resolved'}"`;

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
								is_system_note: true
							}),
						}
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

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold my-4">Support Tickets</h1>

			{loading ? (
				<div>Loading tickets...</div>
			) : (
				<div className="bg-white shadow-md rounded-lg overflow-hidden mt-2">
					<table className="min-w-full divide-y divide-gray-200">
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
									Created
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									View
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
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{ticket.subject}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${ticket.status === "NEW"
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
											{ticket.priority}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{new Date(ticket.created_at).toLocaleDateString()}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<button
												onClick={() => setSelectedTicket(ticket)}
												className="text-emerald-600 hover:text-emerald-900"
											>
												<EyeIcon className="h-5 w-5" />
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
				<div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
					<div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
						<div className="p-4 shadow shadow-gray-200 flex justify-between items-center">
							<div className="flex items-center space-x-4">
								<h2 className="text-xl font-semibold">
									Ticket #{selectedTicket.id}
								</h2>
								<div className="relative">
									<select
										value={selectedTicket.status}
										onChange={(e) => handleStatusUpdate(e.target.value)}
										disabled={updatingStatus}
										className={`text-sm font-medium py-1 px-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-offset-1
											${selectedTicket.status === "NEW"
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
											<svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
										</div>
									)}
								</div>
							</div>
							<button
								onClick={() => setSelectedTicket(null)}
								className="text-gray-500 hover:text-gray-700"
							>
								<XMarkIcon className="h-6 w-6" />
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
										className={`mb-3 p-3 rounded-lg ${reply.is_system_note ? 'bg-gray-100 border border-gray-200' : 'bg-gray-50'}`}
									>
										<div className="flex items-start space-x-3">
											{reply.is_system_note ? (
												<DocumentTextIcon className="h-5 w-5 text-gray-400" />
											) : (
												<ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400" />
											)}
											<div>
												<p className={`text-sm ${reply.is_system_note ? 'text-gray-600 italic' : 'text-gray-900'}`}>{reply.reply}</p>
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
							<form onSubmit={handleSubmitReply}>
								<textarea
									value={newReply}
									onChange={(e) => setNewReply(e.target.value)}
									className="w-full p-2 border rounded-md"
									rows="3"
									placeholder="Type your reply..."
									required
								/>
								<button
									type="submit"
									disabled={submitting}
									className="w-full mt-2 shadow shadow-blue-500/100 px-4 py-2 rounded-md disabled:opacity-50 text-center hover:shadow-blue-600/100"
								>
									{submitting ? "Sending..." : "Reply"}
								</button>
							</form>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
