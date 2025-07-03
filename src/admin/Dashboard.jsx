import { useState, useEffect } from "react";
import { timeAgo } from "./utils/TimeAgo";
import { ToastContainer, toast } from "react-toastify";
import {
	Dialog,
	DialogBackdrop,
	DialogPanel,
	TransitionChild,
} from "@headlessui/react";
import {
	Bars3Icon,
	CalendarIcon,
	ChartPieIcon,
	DocumentDuplicateIcon,
	FolderIcon,
	HomeIcon,
	XMarkIcon,
	UserCircleIcon,
	ExclamationTriangleIcon,
	LockClosedIcon,
} from "@heroicons/react/24/outline";
import { Bar } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip as ChartTooltip,
	Legend,
} from "chart.js";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	ChartTooltip,
	Legend,
);

const navigation = [
	{
		name: "Dashboard",
		href: "#",
		icon: HomeIcon,
		current: true,
		disabled: false,
	},
	// {
	// 	name: "Team",
	// 	href: "#",
	// 	icon: UserCircleIcon,
	// 	current: false,
	// 	disabled: true,
	// },
	// {
	// 	name: "Projects",
	// 	href: "#",
	// 	icon: FolderIcon,
	// 	current: false,
	// 	disabled: true,
	// },
	// {
	// 	name: "Calendar",
	// 	href: "#",
	// 	icon: CalendarIcon,
	// 	current: false,
	// 	disabled: true,
	// },
	// {
	// 	name: "Documents",
	// 	href: "#",
	// 	icon: DocumentDuplicateIcon,
	// 	current: false,
	// 	disabled: true,
	// },
	// {
	// 	name: "Reports",
	// 	href: "#",
	// 	icon: ChartPieIcon,
	// 	current: false,
	// 	disabled: true,
	// },
];

function classNames(...classes) {
	return classes.filter(Boolean).join(" ");
}

// Pro Feature Popover Component
function ProFeaturePopover({ children }) {
	return (
		<div className="group relative">
			{children}
			<div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-10">
				<div className="bg-gray-800 text-xs px-2 py-1 rounded whitespace-nowrap">
					Pro Feature
					<div className="absolute top-1/2 -left-1 -translate-y-1/2 transform rotate-45 w-2 h-2 bg-gray-800"></div>
				</div>
			</div>
		</div>
	);
}

export default function Dashboard({ navigate }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [selectedTicket, setSelectedTicket] = useState(null);
	const [reply, setReply] = useState("");
	const [supportTickets, setSupportTickets] = useState([]);
	const [ticketReplies, setTicketReplies] = useState([]);
	const [recentActivity, setRecentActivity] = useState([]);
	const [chartData, setChartData] = useState({
		labels: ["New", "In Progress", "Resolved"],
		datasets: [
			{
				data: [0, 0, 0],
				backgroundColor: [
					"rgba(244, 63, 94, 0.2)",
					"rgba(234, 179, 8, 0.2)",
					"rgba(16, 185, 129, 0.2)",
				],
				borderColor: [
					"rgba(244, 63, 94, 1)",
					"rgba(234, 179, 8, 1)",
					"rgba(16, 185, 129, 1)",
				],
				borderWidth: 1,
			},
		],
	});

	// Function to generate chart data based on tickets
	const generateChartData = (tickets) => {
		// Get counts by status
		const newTickets = tickets.filter(
			(ticket) => ticket.status === "NEW",
		).length;
		const inProgressTickets = tickets.filter(
			(ticket) => ticket.status === "IN_PROGRESS",
		).length;
		const resolvedTickets = tickets.filter(
			(ticket) => ticket.status === "RESOLVED",
		).length;

		return {
			labels: ["New", "In Progress", "Resolved"],
			datasets: [
				{
					label: "Support Tickets",
					data: [newTickets, inProgressTickets, resolvedTickets],
					backgroundColor: [
						"rgba(244, 63, 94, 0.2)", // rose for new
						"rgba(234, 179, 8, 0.2)", // yellow for in progress
						"rgba(16, 185, 129, 0.2)", // emerald for resolved
					],
					borderColor: [
						"rgba(244, 63, 94, 1)",
						"rgba(234, 179, 8, 1)",
						"rgba(16, 185, 129, 1)",
					],
					borderWidth: 1,
				},
			],
		};
	};

	const notify = () =>
		toast("Reply added", {
			autoClose: 2000,
			position: "bottom-right",
		});

	// Generate activity entries from tickets and replies
	const generateActivityEntries = (tickets, allReplies = []) => {
		const activities = [];

		// Add ticket creation activities
		tickets.forEach((ticket) => {
			activities.push({
				id: `ticket-${ticket.id}`,
				activity: `New ticket: "${ticket.subject}"`,
				date: ticket.created_at,
				type: "ticket_created",
				ticketId: ticket.id,
			});

			// Add status change activities if status is not NEW
			if (ticket.status === "RESOLVED") {
				activities.push({
					id: `status-${ticket.id}`,
					activity: `Ticket resolved: "${ticket.subject}"`,
					date: ticket.updated_at || ticket.created_at, // Use updated_at if available
					type: "ticket_resolved",
					ticketId: ticket.id,
				});
			} else if (ticket.status === "IN_PROGRESS") {
				activities.push({
					id: `status-${ticket.id}`,
					activity: `Ticket in progress: "${ticket.subject}"`,
					date: ticket.updated_at || ticket.created_at,
					type: "ticket_in_progress",
					ticketId: ticket.id,
				});
			}
		});

		// Add reply activities
		allReplies.forEach((reply) => {
			const ticket = tickets.find((t) => t.id === reply.ticket_id);
			if (ticket) {
				// Check if it's a system note about status change
				if (
					reply.is_system_note &&
					reply.reply.includes("System: Ticket status changed to")
				) {
					// Already handled by the ticket status logic above
				} else {
					activities.push({
						id: `reply-${reply.id}`,
						activity: reply.is_system_note
							? reply.reply
							: `New reply to: "${ticket.subject}"`,
						date: reply.created_at,
						type: reply.is_system_note ? "system_note" : "reply_added",
						ticketId: ticket.id,
						replyId: reply.id,
					});
				}
			}
		});

		// Sort by date (newest first)
		return activities.sort((a, b) => new Date(b.date) - new Date(a.date));
	};

	const fetchReplies = async (ticketId) => {
		try {
			const response = await fetch(
				`${CS_SUPPORT_HELPDESK_CONFIG.ticketsUrl}/${ticketId}/replies`,
				{
					headers: {
						"X-WP-Nonce": CS_SUPPORT_HELPDESK_CONFIG.nonce,
					},
				},
			);
			const data = await response.json();
			setTicketReplies(data);
		} catch (error) {
			console.log("Error fetching replies:", error);
		}
	};

	useEffect(() => {
		if (selectedTicket?.id) {
			fetchReplies(selectedTicket.id);
		}
	}, [selectedTicket]);

	useEffect(() => {
		const fetchTickets = async () => {
			try {
				const response = await fetch(CS_SUPPORT_HELPDESK_CONFIG.ticketsUrl, {
					headers: {
						"X-WP-Nonce": CS_SUPPORT_HELPDESK_CONFIG.nonce,
					},
				});
				const data = await response.json();
				setSupportTickets(data);

				// Update chart data
				setChartData(generateChartData(data));

				// Fetch all replies for activity generation
				const allReplies = [];
				for (const ticket of data) {
					try {
						const repliesResponse = await fetch(
							`${CS_SUPPORT_HELPDESK_CONFIG.ticketsUrl}/${ticket.id}/replies`,
							{
								headers: {
									"X-WP-Nonce": CS_SUPPORT_HELPDESK_CONFIG.nonce,
								},
							},
						);
						const repliesData = await repliesResponse.json();
						allReplies.push(...repliesData);
					} catch (error) {
						console.log(
							`Error fetching replies for ticket ${ticket.id}:`,
							error,
						);
					}
				}

				// Generate and set activity data
				const activities = generateActivityEntries(data, allReplies);
				setRecentActivity(activities);
			} catch (error) {
				console.log("There was an error fetching tickets.", error);
			}
		};

		fetchTickets();
	}, []);

	const handleReplySubmit = async (e) => {
		e.preventDefault();

		try {
			console.log("reply", reply);

			const url = `${CS_SUPPORT_HELPDESK_CONFIG.ticketsUrl}/${selectedTicket.id}/replies`;
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-WP-Nonce": CS_SUPPORT_HELPDESK_CONFIG.nonce,
				},
				body: JSON.stringify({ reply, ticket_id: selectedTicket.id }),
			});

			const data = await response.json();
			if (data.success) {
				notify();
				setReply("");
				// Fetch updated replies after successful submission
				fetchReplies(selectedTicket.id);

				// Add new activity entry for the reply
				const newActivity = {
					id: `reply-${Date.now()}`, // Temporary ID until we get the actual reply ID
					activity: `New reply to: "${selectedTicket.subject}"`,
					date: new Date().toISOString(),
					type: "reply_added",
					ticketId: selectedTicket.id,
				};
				setRecentActivity((prev) => [newActivity, ...prev]);

				// Update chart data when replies are added (may affect status counts)
				setChartData(generateChartData(supportTickets));
			} else {
				console.log(data);
			}
		} catch (error) {
			console.log();
			"There was an error adding your reply.", error;
		}
	};

	return (
		<div className="h-screen flex overflow-hidden bg-gray-100">
			{/* Sidebar for mobile */}
			<Dialog as="div" open={sidebarOpen} onClose={setSidebarOpen}>
				<DialogBackdrop className="fixed inset-0 bg-black bg-opacity-50" />
				<TransitionChild
					as={DialogPanel}
					enter="transform transition ease-in-out duration-500 sm:duration-700"
					enterFrom="-translate-x-full"
					enterTo="translate-x-0"
					leave="transform transition ease-in-out duration-500 sm:duration-700"
					leaveFrom="translate-x-0"
					leaveTo="-translate-x-full"
					className="fixed inset-y-0 z-10 flex-shrink-0 w-64 bg-white border-r border-gray-200"
				>
					{/* Mobile sidebar content */}
					<div className="flex flex-col h-full">
						<div className="flex items-center justify-between flex-shrink-0 p-2">
							<button
								type="button"
								className="rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
								onClick={() => setSidebarOpen(false)}
							>
								<span className="sr-only">Close sidebar</span>
								<XMarkIcon className="h-6 w-6" aria-hidden="true" />
							</button>
						</div>

						<div className="flex-1 h-0 overflow-y-auto">
							<nav className="flex-1 px-2 py-4 space-y-1">
								{navigation.map((item) =>
									item.disabled ? (
										<ProFeaturePopover key={item.name}>
											<div className="text-gray-300 group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-default">
												<item.icon
													className="text-gray-300 mr-3 h-6 w-6"
													aria-hidden="true"
												/>
												{item.name}
											</div>
										</ProFeaturePopover>
									) : (
										<a
											key={item.name}
											href={item.href}
											className={classNames(
												item.current
													? "bg-gray-100 text-gray-900"
													: "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
												"group flex items-center px-2 py-2 text-sm font-medium rounded-md",
											)}
										>
											<item.icon
												className={classNames(
													item.current
														? "text-gray-500"
														: "text-gray-400 group-hover:text-gray-500",
													"mr-3 h-6 w-6",
												)}
												aria-hidden="true"
											/>
											{item.name}
										</a>
									),
								)}
							</nav>

							{/* Pro Features Promotional Section - Mobile */}
							<div className="px-2 pb-4">
								<div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 text-center">
									<div className="flex flex-col items-center space-y-2">
										<LockClosedIcon className="h-8 w-8" aria-hidden="true" />
										<div className="text-white">
											<p className="text-sm font-medium">More sections and</p>
											<p className="text-sm font-medium">reports available</p>
											<p className="text-sm font-medium">on Pro</p>
										</div>
										<button className="mt-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-xs font-medium py-1 px-3 rounded-md transition-all duration-200">
											Upgrade Now
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</TransitionChild>
			</Dialog>

			{/* Desktop sidebar */}
			<div className="hidden md:flex md:flex-shrink-0">
				<div className="flex flex-col w-64">
					<div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
						<div className="md:hidden flex items-center justify-between flex-shrink-0 p-2">
							<button
								type="button"
								className="rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
								onClick={() => setSidebarOpen(true)}
							>
								<span className="sr-only">Open sidebar</span>
								<Bars3Icon className="h-6 w-6" aria-hidden="true" />
							</button>
						</div>

						<div className="flex-1 h-0 overflow-y-auto">
							<nav className="flex-1 px-2 py-4 space-y-1">
								{navigation.map((item) =>
									item.disabled ? (
										<ProFeaturePopover key={item.name}>
											<div className="text-gray-300 group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-default">
												<item.icon
													className="text-gray-300 mr-3 h-6 w-6"
													aria-hidden="true"
												/>
												{item.name}
											</div>
										</ProFeaturePopover>
									) : (
										<a
											key={item.name}
											href={item.href}
											className={classNames(
												item.current
													? "bg-gray-100 text-gray-900"
													: "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
												"group flex items-center px-2 py-2 text-sm font-medium rounded-md",
											)}
										>
											<item.icon
												className={classNames(
													item.current
														? "text-gray-500"
														: "text-gray-400 group-hover:text-gray-500",
													"mr-3 h-6 w-6",
												)}
												aria-hidden="true"
											/>
											{item.name}
										</a>
									),
								)}
							</nav>

							{/* Pro Features Promotional Section - Desktop */}
							<div className="mx-1 px-2 pb-4 mt-[100%]">
								<div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 text-center shadow-sm border border-gray-200">
									<div className="flex flex-col items-center space-y-2">
										<LockClosedIcon className="h-8 w-8" aria-hidden="true" />
										<div>
											<p className="text-sm font-medium">
												Unlock Premium Features
											</p>
											<p className="text-sm font-medium">Advanced reporting</p>
											<p className="text-sm font-medium">
												Team collaboration tools
											</p>
										</div>
										<button className="mt-2 bg-white hover:bg-gray-100 text-orange-700 text-xs font-semibold py-1.5 px-4 rounded-md transition-all duration-200 shadow-sm">
											Upgrade to Pro
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* Main content */}
			<div className="flex flex-col w-0 flex-1 overflow-hidden">
				<main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
					<div className="py-6">
						<div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
								<div className="bg-white overflow-hidden shadow shadow-rose-300/50 rounded-lg">
									<div className="p-5">
										<h2 className="text-lg font-medium text-gray-900">
											Tickets in Queue
										</h2>
										<p className="mt-1 text-3xl font-semibold text-gray-900">
											{
												supportTickets.filter(
													(ticket) => ticket.status === "NEW",
												).length
											}
										</p>
									</div>
								</div>
								<div className="bg-white overflow-hidden shadow shadow-emerald-300/50 rounded-lg">
									<div className="p-5">
										<h2 className="text-lg font-medium text-gray-900">
											Resolved Tickets
										</h2>
										<p className="mt-1 text-3xl font-semibold text-gray-900">
											{
												supportTickets.filter(
													(ticket) => ticket.status === "RESOLVED",
												).length
											}
										</p>
									</div>
								</div>
								<div className="bg-white overflow-hidden shadow shadow-blue-300/50 rounded-lg">
									<div className="p-5">
										<h2 className="text-lg font-medium text-gray-900">
											In Progress
										</h2>
										<p className="mt-1 text-3xl font-semibold text-gray-900">
											{
												supportTickets.filter(
													(ticket) => ticket.status === "IN_PROGRESS",
												).length
											}
										</p>
									</div>
								</div>
								{/* <div className='bg-white overflow-hidden shadow shadow-blue-300/50 rounded-lg'>
                  <div className='p-5'>
                    <h2 className='text-lg font-medium text-gray-900'>
                      Total Tickets
                    </h2>
                    <p className='mt-1 text-3xl font-semibold text-gray-900'>
                      {supportTickets.length}
                    </p>
                  </div>
                </div> */}
							</div>
							<div className="py-4">
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
									<div className="bg-white overflow-hidden shadow rounded-lg h-96">
										<div className="p-5 h-full flex flex-col">
											<h2 className="text-lg font-medium text-gray-900">
												Support Tickets
											</h2>
											{supportTickets.length ? (
												<ul className="mt-2 overflow-y-auto flex-1">
													{supportTickets
														.sort((a, b) => b.id - a.id)
														.map((ticket) => (
															<li
																key={ticket.id}
																className="py-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
																onClick={() => {
																	setSelectedTicket(ticket);
																	fetchReplies(ticket.id);
																}}
															>
																<div className="flex justify-between">
																	<span className="font-medium text-md text-purple-950">
																		{ticket.subject}
																	</span>
																	<span className="text-sm text-gray-500">
																		{ticket.priority}
																	</span>
																</div>
																<div className="mt-1 flex items-center justify-between">
																	<div
																		className={classNames(
																			"text-sm px-2 py-1 rounded-md w-fit",
																			ticket.status === "NEW"
																				? "shadow shadow-rose-300/50 bg-rose-50 text-rose-900"
																				: ticket.status === "IN_PROGRESS"
																				? "shadow shadow-yellow-300/50 bg-yellow-50 text-yellow-900"
																				: "shadow shadow-emerald-300/50 bg-emerald-50 text-emerald-900",
																		)}
																	>
																		{ticket.status === "NEW"
																			? "New"
																			: ticket.status === "IN_PROGRESS"
																			? "In Progress"
																			: "Resolved"}
																	</div>
																	<div className="text-sm text-gray-600 font-medium rounded-xl px-2 py-1 inline-flex">
																		{timeAgo(ticket.created_at)}
																	</div>
																	<p className="text-sm text-gray-500 inline-flex space-x-1">
																		<UserCircleIcon className="h-5 w-5 text-gray-500" />
																		<span className="text-green-500">
																			John Doe
																		</span>
																	</p>
																</div>
															</li>
														))}
												</ul>
											) : (
												<div className="text-gray-500 mt-4">
													No tickets available
												</div>
											)}
										</div>
									</div>
									<div className="bg-white overflow-hidden shadow rounded-lg h-96">
										<div className="p-5 h-full flex flex-col">
											<h2 className="text-lg font-medium text-gray-900 mb-2">
												Recent Activity
											</h2>
											<div className="overflow-y-auto flex-1 pr-1 -mr-1">
												{recentActivity.length > 0 ? (
													<ul className="space-y-2">
														{recentActivity.map((activity) => (
															<li
																key={activity.id}
																className={`py-2 px-1 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 
																	${activity.type === "system_note" ? "bg-gray-50" : ""}`}
																onClick={() => {
																	// Find and select the relevant ticket when clicking on activity
																	if (activity.ticketId) {
																		const ticket = supportTickets.find(
																			(t) => t.id === activity.ticketId,
																		);
																		if (ticket) {
																			setSelectedTicket(ticket);
																			fetchReplies(ticket.id);
																		}
																	}
																}}
															>
																<div className="flex justify-between">
																	<span
																		className={`font-medium text-sm mr-2 
																		${activity.type === "system_note" ? "text-gray-600 italic" : "text-gray-800"}`}
																	>
																		{activity.activity}
																	</span>
																	<span className="text-xs text-gray-500 whitespace-nowrap">
																		{timeAgo(activity.date)}
																	</span>
																</div>
															</li>
														))}
													</ul>
												) : (
													<div className="text-center text-gray-500 mt-4">
														No activity available
													</div>
												)}
											</div>
										</div>
									</div>
									<div className="bg-white overflow-hidden shadow rounded-lg h-96">
										<div className="p-5 h-full flex flex-col">
											<h2 className="text-lg font-medium text-gray-900">
												Tickets Overview ( Priority )
											</h2>
											<div className="flex-1">
												<Bar
													data={chartData}
													className="h-full"
													options={{
														responsive: true,
														maintainAspectRatio: false,
														plugins: {
															legend: {
																display: false,
															},
															tooltip: {
																callbacks: {
																	label: function (context) {
																		return `Count: ${context.raw}`;
																	},
																},
															},
														},
														scales: {
															y: {
																beginAtZero: true,
																ticks: {
																	precision: 0,
																},
															},
														},
													}}
												/>
											</div>
											<div className="grid grid-cols-3 gap-1 mt-2">
												<div className="bg-white overflow-hidden shadow rounded-lg p-1">
													<h3 className="text-lg font-medium text-center text-gray-900">
														High
													</h3>
													<p className="text-3xl text-center font-semibold text-gray-900">
														{
															supportTickets.filter(
																(ticket) => ticket.priority === "high",
															).length
														}
													</p>
												</div>
												<div className="bg-white overflow-hidden shadow rounded-lg p-1">
													<h3 className="text-lg font-medium text-center text-gray-900">
														Medium
													</h3>
													<p className="text-3xl text-center font-semibold text-gray-900">
														{
															supportTickets.filter(
																(ticket) => ticket.priority === "normal",
															).length
														}
													</p>
												</div>
												<div className="bg-white overflow-hidden shadow rounded-lg p-1">
													<h3 className="text-lg font-medium text-center text-gray-900">
														Low
													</h3>
													<p className="text-3xl text-center font-semibold text-gray-900">
														{
															supportTickets.filter(
																(ticket) => ticket.priority === "low",
															).length
														}
													</p>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="bg-white overflow-hidden shadow rounded-lg mt-2 p-5">
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
									<div className="bg-white overflow-hidden shadow rounded-lg h-96">
										<div className="p-5 h-full flex flex-col">
											<h2 className="text-lg font-medium text-gray-900">
												Quick Reply
											</h2>
											<form
												className="flex-1"
												onSubmit={(e) =>
													handleReplySubmit(e, selectedTicket.id)
												}
											>
												<div className="mt-2">
													<label
														htmlFor="ticket-select"
														className="block text-sm font-medium text-gray-700 mt-1"
													>
														Select Ticket
													</label>
													<select
														id="ticket-select"
														name="ticket-select"
														className="mt-1 block min-w-full h-10 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
														value={selectedTicket?.id || ""}
														onChange={(e) =>
															setSelectedTicket(
																supportTickets.find(
																	(ticket) => ticket.id === e.target.value,
																),
															)
														}
													>
														<option value="">Select a ticket</option>
														{supportTickets.map((ticket) => (
															<option key={ticket.id} value={ticket.id}>
																{ticket?.subject}
															</option>
														))}
													</select>
												</div>
												<div className="mt-3">
													<label
														htmlFor="reply"
														className="block text-sm font-medium text-gray-700"
													>
														Reply
													</label>
													<textarea
														id="reply"
														name="reply"
														rows="4"
														onChange={(e) => setReply(e.target.value)}
														className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
														value={reply}
														required
													/>
												</div>
												<div className="mt-5">
													<button
														type="button"
														className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm shadow-emerald-800/100 text-black hover:shadow-amber-500/100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 cursor-pointer"
														onClick={handleReplySubmit}
													>
														Reply
													</button>
												</div>
											</form>
										</div>
									</div>
									<div className="bg-white overflow-hidden shadow rounded-lg h-96">
										<div className="p-5 h-full flex flex-col overflow-y-scroll">
											<h2 className="text-lg font-medium text-gray-900">
												{selectedTicket
													? `Replies for: ${selectedTicket.subject}`
													: "Select a ticket to view replies"}
											</h2>
											<div className="flex-1 mt-4">
												{selectedTicket ? (
													<div className="space-y-4 overflow-y-auto h-full">
														{/* Original ticket message */}
														<div className="bg-gray-50 p-4 rounded-lg">
															<div className="flex items-center justify-between mb-2">
																<span className="font-medium text-gray-900">
																	Original Ticket
																</span>
																<span className="text-sm text-gray-500">
																	{timeAgo(selectedTicket.created_at)}
																</span>
															</div>
															<p className="text-gray-700">
																{selectedTicket.description}
															</p>
														</div>

														{/* Replies */}
														{ticketReplies.length > 0 ? (
															ticketReplies.map((reply) => (
																<div
																	key={reply.id}
																	className="bg-white border border-gray-200 p-4 rounded-lg"
																>
																	<div className="flex items-center justify-between mb-2">
																		<div className="flex items-center space-x-2">
																			<UserCircleIcon className="h-5 w-5 text-gray-500" />
																			<span className="font-medium text-gray-900">
																				{reply.user_id ===
																				selectedTicket.user_id
																					? "Customer"
																					: "Support Agent"}
																			</span>
																		</div>
																		<span className="text-sm text-gray-500">
																			{timeAgo(reply.created_at)}
																		</span>
																	</div>
																	<p className="text-gray-700">{reply.reply}</p>
																</div>
															))
														) : (
															<div className="text-center text-gray-500 mt-4">
																No replies yet
															</div>
														)}
													</div>
												) : (
													<div className="flex items-center justify-center h-full text-gray-500">
														<div className="text-center">
															<span className="block mb-2">👈</span>
															Select a ticket from the quick reply form to view
															the conversation
														</div>
													</div>
												)}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
			<ToastContainer />
		</div>
	);
}
