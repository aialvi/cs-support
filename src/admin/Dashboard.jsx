import { useState, useEffect, useRef } from "react";
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
	SparklesIcon,
	CheckIcon,
	XCircleIcon,
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
	const [isGeneratingAIReply, setIsGeneratingAIReply] = useState(false);
	const [aiReply, setAiReply] = useState("");
	const [showAiReply, setShowAiReply] = useState(false);
	const [aiEnabled, setAiEnabled] = useState(false);
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
		// Check if AI is enabled
		const checkAISettings = async () => {
			try {
				const response = await fetch(CS_SUPPORT_HELPDESK_CONFIG.apiUrl + '/settings', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': CS_SUPPORT_HELPDESK_CONFIG.nonce,
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

	const generateAIReply = async () => {
		if (!selectedTicket) {
			toast.error('Please select a ticket first');
			return;
		}

		setIsGeneratingAIReply(true);
		setShowAiReply(false);
		setAiReply('');

		try {
			const response = await fetch(CS_SUPPORT_HELPDESK_CONFIG.apiUrl + '/ai/generate-reply', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': CS_SUPPORT_HELPDESK_CONFIG.nonce,
				},
				body: JSON.stringify({
					ticket_id: selectedTicket.id,
				}),
			});

			const data = await response.json();

			if (data.success) {
				setAiReply(data.reply);
				setShowAiReply(true);
			} else {
				toast.error(data.message || 'Failed to generate AI reply');
			}
		} catch (error) {
			toast.error('Error generating AI reply: ' + error.message);
			console.error('AI reply error:', error);
		} finally {
			setIsGeneratingAIReply(false);
		}
	};

	const acceptAIReply = () => {
		setReply(aiReply);
		setShowAiReply(false);
		setAiReply('');
	};

	const rejectAIReply = () => {
		setShowAiReply(false);
		setAiReply('');
	};

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
		<div className="h-screen flex overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
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
								<div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-4 text-center shadow-lg">
									<div className="flex flex-col items-center space-y-3">
										<div className="bg-white bg-opacity-20 rounded-full p-2">
											<LockClosedIcon className="h-6 w-6 text-white" />
										</div>
										<div className="text-white">
											<p className="text-sm font-semibold mb-1">Premium Features</p>
											<p className="text-xs opacity-90">More sections and reports available</p>
										</div>
										<button className="mt-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5">
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
								<div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 text-center shadow-lg border border-orange-200">
									<div className="flex flex-col items-center space-y-3">
										<div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-2">
											<LockClosedIcon className="h-6 w-6 text-white" />
										</div>
										<div>
											<p className="text-sm font-semibold text-orange-900 mb-1">
												Unlock Premium Features
											</p>
											<p className="text-xs text-orange-700 leading-relaxed">
												Advanced reporting, team collaboration tools, and priority support
											</p>
										</div>
										<button className="mt-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
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
					<div className="py-4">
						<div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
							{/* Dashboard Header */}
							{/* <div className="mb-8">
								<h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
								<p className="mt-2 text-gray-600">Welcome back! Here's what's happening with your support tickets today.</p>
							</div> */}

							{/* Stats Cards */}
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
								<div className="bg-white overflow-hidden shadow-lg shadow-rose-100 rounded-xl border border-rose-100 hover:shadow-xl transition-shadow duration-300">
									<div className="p-6">
										<div className="flex items-center">
											<div className="flex-shrink-0">
												<div className="bg-rose-500 rounded-lg p-3">
													<ExclamationTriangleIcon className="h-6 w-6 text-white" />
												</div>
											</div>
											<div className="ml-4 w-0 flex-1">
												<h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
													Tickets in Queue
												</h2>
												<p className="text-3xl font-bold text-gray-900">
													{
														supportTickets.filter(
															(ticket) => ticket.status === "NEW",
														).length
													}
												</p>
											</div>
										</div>
									</div>
								</div>

								<div className="bg-white overflow-hidden shadow-lg shadow-emerald-100 rounded-xl border border-emerald-100 hover:shadow-xl transition-shadow duration-300">
									<div className="p-6">
										<div className="flex items-center">
											<div className="flex-shrink-0">
												<div className="bg-emerald-500 rounded-lg p-3">
													<CheckIcon className="h-6 w-6 text-white" />
												</div>
											</div>
											<div className="ml-4 w-0 flex-1">
												<h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
													Resolved Tickets
												</h2>
												<p className="text-3xl font-bold text-gray-900">
													{
														supportTickets.filter(
															(ticket) => ticket.status === "RESOLVED",
														).length
													}
												</p>
											</div>
										</div>
									</div>
								</div>

								<div className="bg-white overflow-hidden shadow-lg shadow-blue-100 rounded-xl border border-blue-100 hover:shadow-xl transition-shadow duration-300">
									<div className="p-6">
										<div className="flex items-center">
											<div className="flex-shrink-0">
												<div className="bg-blue-500 rounded-lg p-3">
													<SparklesIcon className="h-6 w-6 text-white" />
												</div>
											</div>
											<div className="ml-4 w-0 flex-1">
												<h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
													In Progress
												</h2>
												<p className="text-3xl font-bold text-gray-900">
													{
														supportTickets.filter(
															(ticket) => ticket.status === "IN_PROGRESS",
														).length
													}
												</p>
											</div>
										</div>
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
							{/* Main Content Grid */}
							<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
								{/* Support Tickets */}
								<div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200">
									<div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
										<h2 className="text-lg font-semibold text-gray-900 flex items-center">
											<FolderIcon className="h-5 w-5 mr-2 text-purple-600" />
											Support Tickets
										</h2>
									</div>
									<div className="p-6 h-96 flex flex-col">
										{supportTickets.length ? (
											<ul className="overflow-y-auto flex-1 space-y-3">
												{supportTickets
													.sort((a, b) => b.id - a.id)
													.map((ticket) => (
														<li
															key={ticket.id}
															className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all duration-200"
															onClick={() => {
																setSelectedTicket(ticket);
																fetchReplies(ticket.id);
															}}
														>
															<div className="flex justify-between items-start">
																<span className="font-semibold text-sm text-gray-900 flex-1 mr-2">
																	{ticket.subject}
																</span>
																<div className="flex flex-col items-end space-y-1">
																	<span className={classNames(
																		"text-xs px-2 py-1 rounded-full font-medium",
																		ticket.priority === "high" ? "bg-red-100 text-red-800" :
																			ticket.priority === "normal" ? "bg-yellow-100 text-yellow-800" :
																				"bg-gray-100 text-gray-800"
																	)}>
																		{ticket.priority}
																	</span>
																</div>
															</div>
															<div className="mt-3 flex items-center justify-between">
																<div
																	className={classNames(
																		"text-xs px-3 py-1 rounded-full font-medium",
																		ticket.status === "NEW"
																			? "bg-rose-100 text-rose-800"
																			: ticket.status === "IN_PROGRESS"
																				? "bg-yellow-100 text-yellow-800"
																				: "bg-emerald-100 text-emerald-800",
																	)}
																>
																	{ticket.status === "NEW"
																		? "New"
																		: ticket.status === "IN_PROGRESS"
																			? "In Progress"
																			: "Resolved"}
																</div>
																<div className="flex items-center space-x-2 text-xs text-gray-500">
																	<span>{timeAgo(ticket.created_at)}</span>
																	<div className="flex items-center">
																		<UserCircleIcon className="h-4 w-4 mr-1" />
																		<span className="text-green-600 font-medium">John Doe</span>
																	</div>
																</div>
															</div>
														</li>
													))}
											</ul>
										) : (
											<div className="flex items-center justify-center h-full text-gray-500">
												<div className="text-center">
													<FolderIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
													<p>No tickets available</p>
												</div>
											</div>
										)}
									</div>
								</div>

								{/* Recent Activity */}
								<div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200">
									<div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
										<h2 className="text-lg font-semibold text-gray-900 flex items-center">
											<CalendarIcon className="h-5 w-5 mr-2 text-green-600" />
											Recent Activity
										</h2>
									</div>
									<div className="p-6 h-96 flex flex-col">
										<div className="overflow-y-auto flex-1">
											{recentActivity.length > 0 ? (
												<ul className="space-y-3">
													{recentActivity.map((activity) => {
														// Determine if this activity is a ticket creation and has not been replied to
														const isTicketCreated = activity.type === "ticket_created";
														const hasReplies = ticketReplies.some(
															(reply) => reply.ticket_id === activity.ticketId
														);
														const showOverlay = isTicketCreated && !hasReplies;

														return (
															<li
																key={activity.id}
																className={`p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-200
																	${activity.type === "system_note" ? "bg-gray-50 border-gray-300" : ""}
																	${showOverlay ? "bg-red-50" : ""}
																`}
																onClick={() => {
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
																<div className="flex justify-between items-start">
																	<span
																		className={`text-sm font-medium mr-2 
																		${activity.type === "system_note" ? "text-gray-600 italic" : "text-gray-800"}`}
																	>
																		{activity.activity}
																	</span>
																	<span className="text-xs text-gray-500 whitespace-nowrap">
																		{timeAgo(activity.date)}
																	</span>
																</div>
															</li>
														);
													})}
												</ul>
											) : (
												<div className="flex items-center justify-center h-full text-gray-500">
													<div className="text-center">
														<CalendarIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
														<p>No activity available</p>
													</div>
												</div>
											)}
										</div>
									</div>
								</div>

								{/* Charts and Priority Overview */}
								<div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200">
									<div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
										<h2 className="text-lg font-semibold text-gray-900 flex items-center">
											<ChartPieIcon className="h-5 w-5 mr-2 text-blue-600" />
											Tickets Overview
										</h2>
									</div>
									<div className="p-6 h-96 flex flex-col">
										<div className="flex-1 mb-4">
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
										<div className="grid grid-cols-3 gap-3">
											<div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-3 text-center">
												<h3 className="text-sm font-semibold text-red-800">High</h3>
												<p className="text-2xl font-bold text-red-900">
													{
														supportTickets.filter(
															(ticket) => ticket.priority === "high",
														).length
													}
												</p>
											</div>
											<div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-3 text-center">
												<h3 className="text-sm font-semibold text-yellow-800">Medium</h3>
												<p className="text-2xl font-bold text-yellow-900">
													{
														supportTickets.filter(
															(ticket) => ticket.priority === "normal",
														).length
													}
												</p>
											</div>
											<div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3 text-center">
												<h3 className="text-sm font-semibold text-gray-800">Low</h3>
												<p className="text-2xl font-bold text-gray-900">
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

							{/* Bottom Section - Quick Reply and Conversation */}
							<div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
								{/* Quick Reply */}
								<div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200">
									<div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
										<h2 className="text-lg font-semibold text-gray-900 flex items-center">
											<DocumentDuplicateIcon className="h-5 w-5 mr-2 text-indigo-600" />
											Quick Reply
										</h2>
									</div>
									<div className="p-6">
										<form
											className="space-y-4"
											onSubmit={(e) =>
												handleReplySubmit(e, selectedTicket.id)
											}
										>
											<div>
												<label
													htmlFor="ticket-select"
													className="block text-sm font-medium text-gray-700 mb-2"
												>
													Select Ticket
												</label>
												<select
													id="ticket-select"
													name="ticket-select"
													className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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

											<div>
												<div className="flex items-center justify-between mb-2">
													<label
														htmlFor="reply"
														className="block text-sm font-medium text-gray-700"
													>
														Reply
													</label>
													{aiEnabled && (
														<button
															type="button"
															onClick={generateAIReply}
															disabled={isGeneratingAIReply || !selectedTicket}
															className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
														>
															<SparklesIcon className="h-3 w-3 mr-1" />
															{isGeneratingAIReply ? "Generating..." : "AI Suggestion"}
														</button>
													)}
												</div>

												{showAiReply && (
													<div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
														<div className="flex items-center justify-between mb-3">
															<span className="text-sm font-medium text-blue-700 flex items-center">
																<SparklesIcon className="h-4 w-4 mr-1" />
																AI Suggestion
															</span>
															<div className="flex space-x-2">
																<button
																	type="button"
																	onClick={acceptAIReply}
																	className="inline-flex items-center p-1.5 text-sm font-medium rounded-full text-green-700 bg-green-100 hover:bg-green-200 transition-colors duration-200"
																	title="Accept suggestion"
																>
																	<CheckIcon className="h-4 w-4" />
																</button>
																<button
																	type="button"
																	onClick={rejectAIReply}
																	className="inline-flex items-center p-1.5 text-sm font-medium rounded-full text-red-700 bg-red-100 hover:bg-red-200 transition-colors duration-200"
																	title="Reject suggestion"
																>
																	<XCircleIcon className="h-4 w-4" />
																</button>
															</div>
														</div>
														<div className="text-sm text-gray-700 p-3 bg-white border border-blue-100 rounded-lg">
															{aiReply}
														</div>
													</div>
												)}

												<textarea
													id="reply"
													name="reply"
													rows="4"
													onChange={(e) => setReply(e.target.value)}
													className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
													value={reply}
													placeholder="Type your reply here..."
													required
												/>
											</div>

											<button
												type="button"
												className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl"
												onClick={handleReplySubmit}
											>
												Send Reply
											</button>
										</form>
									</div>
								</div>

								{/* Conversation View */}
								<div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200">
									<div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
										<h2 className="text-lg font-semibold text-gray-900 flex items-center">
											<UserCircleIcon className="h-5 w-5 mr-2 text-gray-600" />
											{selectedTicket
												? `Conversation: ${selectedTicket.subject}`
												: "Select a ticket to view conversation"}
										</h2>
									</div>
									<div className="p-6 h-96 overflow-y-auto">
										{selectedTicket ? (
											<div className="space-y-4">
												{/* Original ticket message */}
												<div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg">
													<div className="flex items-center justify-between mb-3">
														<div className="flex items-center space-x-2">
															<div className="bg-blue-500 rounded-full p-1">
																<UserCircleIcon className="h-4 w-4 text-white" />
															</div>
															<span className="font-medium text-blue-900">Original Ticket</span>
														</div>
														<span className="text-sm text-blue-700">
															{timeAgo(selectedTicket.created_at)}
														</span>
													</div>
													<p className="text-gray-700 leading-relaxed">
														{selectedTicket.description}
													</p>
												</div>

												{/* Replies */}
												{ticketReplies.length > 0 ? (
													ticketReplies.map((reply) => (
														<div
															key={reply.id}
															className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
														>
															<div className="flex items-center justify-between mb-3">
																<div className="flex items-center space-x-2">
																	<div className={classNames(
																		"rounded-full p-1",
																		reply.user_id === selectedTicket.user_id
																			? "bg-green-500"
																			: "bg-purple-500"
																	)}>
																		<UserCircleIcon className="h-4 w-4 text-white" />
																	</div>
																	<span className="font-medium text-gray-900">
																		{reply.user_id === selectedTicket.user_id
																			? "Customer"
																			: "Support Agent"}
																	</span>
																</div>
																<span className="text-sm text-gray-500">
																	{timeAgo(reply.created_at)}
																</span>
															</div>
															<p className="text-gray-700 leading-relaxed">{reply.reply}</p>
														</div>
													))
												) : (
													<div className="text-center text-gray-500 py-8">
														<DocumentDuplicateIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
														<p>No replies yet</p>
													</div>
												)}
											</div>
										) : (
											<div className="flex items-center justify-center h-full text-gray-500">
												<div className="text-center">
													<UserCircleIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
													<p className="text-lg font-medium mb-2">Select a ticket</p>
													<p className="text-sm">Choose a ticket from the list or quick reply form to view the conversation</p>
												</div>
											</div>
										)}
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
