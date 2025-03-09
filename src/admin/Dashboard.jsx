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
} from "@heroicons/react/24/outline";
import { Bar } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
);

const navigation = [
	{ name: "Dashboard", href: "#", icon: HomeIcon, current: true },
	{ name: "Team", href: "#", icon: UserCircleIcon, current: false },
	{ name: "Projects", href: "#", icon: FolderIcon, current: false },
	{ name: "Calendar", href: "#", icon: CalendarIcon, current: false },
	{ name: "Documents", href: "#", icon: DocumentDuplicateIcon, current: false },
	{ name: "Reports", href: "#", icon: ChartPieIcon, current: false },
];
const teams = [
	{ id: 1, name: "Engineering", initial: "E" },
	{ id: 2, name: "Design", initial: "D" },
	{ id: 3, name: "Marketing", initial: "M" },
	{ id: 4, name: "Sales", initial: "S" },
	{ id: 5, name: "Customer Success", initial: "CS" },
	{ id: 6, name: "Product", initial: "P" },
];
const userNavigation = [
	{ name: "Your profile", href: "#" },
	{ name: "Sign out", href: "#" },
];

function classNames(...classes) {
	return classes.filter(Boolean).join(" ");
}

const recentActivity = [
	{ id: 1, activity: "User JohnDoe created a new ticket", date: "2023-10-01" },
	{ id: 2, activity: "Admin resolved ticket #2", date: "2023-09-28" },
	{
		id: 3,
		activity: "User JaneDoe commented on ticket #3",
		date: "2023-09-25",
	},
	{ id: 4, activity: "User JohnDoe updated ticket #1", date: "2023-09-20" },
	{ id: 5, activity: "Admin closed ticket #3", date: "2023-09-18" },
	{ id: 6, activity: "User JaneDoe reopened ticket #2", date: "2023-09-15" },
	{ id: 7, activity: "User JohnDoe created a new ticket", date: "2023-09-10" },
];

const sortedActivity = [...recentActivity].sort((a, b) => b.id - a.id);

const chartData = {
	labels: ["January", "February", "March", "April", "May", "June", "July"],
	datasets: [
		{
			label: "Support Tickets",
			data: [12, 19, 3, 5, 2, 3, 7],
			backgroundColor: "rgba(51, 160, 180, 0.2)",
			borderColor: "rgba(75, 192, 192, 1)",
			borderWidth: 1,
		},
	],
};

export default function Dashboard({ navigate }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [selectedTicket, setSelectedTicket] = useState(null);
	const [reply, setReply] = useState("");
	const [supportTickets, setSupportTickets] = useState([]);

	const notify = () =>
		toast("Reply added", {
			autoClose: 2000,
			position: "bottom-right",
		});

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
								{navigation.map((item) => (
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
								))}
							</nav>
						</div>
					</div>
				</TransitionChild>
			</Dialog>

			{/* Desktop sidebar */}
			<div className="hidden md:flex md:flex-shrink-0">
				<div className="flex flex-col w-64">
					<div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
						<div className="flex items-center justify-between flex-shrink-0 p-2">
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
								{navigation.map((item) => (
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
								))}
							</nav>
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
											<ul className="mt-2 overflow-y-auto flex-1">
												{supportTickets
													.sort((a, b) => b.id - a.id)
													.map((ticket) => (
														<li
															key={ticket.id}
															className="py-2 border-b border-gray-100"
														>
															<div className="flex justify-between">
																<span
																	className="font-medium text-md text-purple-950"
																	onClick={() => {
																		console.log("ticket", ticket);
																	}}
																>
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
																	<a href="#" className="text-green-500">
																		John Doe
																	</a>
																</p>
															</div>
														</li>
													))}
											</ul>
										</div>
									</div>
									<div className="bg-white overflow-hidden shadow rounded-lg h-96">
										<div className="p-5 h-full flex flex-col">
											<h2 className="text-lg font-medium text-gray-900">
												Recent Activity
											</h2>
											<ul className="mt-2 overflow-y-auto flex-1">
												{sortedActivity.map((activity) => (
													<li key={activity.id} className="py-2">
														<div className="flex justify-between">
															<span className="font-medium">
																{activity.activity}
															</span>
															<span className="text-sm text-gray-500">
																{activity.date}
															</span>
														</div>
													</li>
												))}
											</ul>
										</div>
									</div>
									<div className="bg-white overflow-hidden shadow rounded-lg h-96">
										<div className="p-5 h-full flex flex-col">
											<h2 className="text-lg font-medium text-gray-900">
												Tickets Overview
											</h2>
											<div className="flex-1">
												<Bar data={chartData} className="h-full" />
											</div>
											<div className="grid grid-cols-3 gap-1 mt-2">
												<div className="bg-white overflow-hidden shadow rounded-lg p-1">
													<h3 className="text-lg font-medium text-center text-gray-900">
														Billing
													</h3>
													<p className="text-3xl text-center font-semibold text-gray-900">
														12
													</p>
												</div>
												<div className="bg-white overflow-hidden shadow rounded-lg p-1">
													<h3 className="text-lg font-medium text-center text-gray-900">
														Technical
													</h3>
													<p className="text-3xl text-center font-semibold text-gray-900">
														19
													</p>
												</div>

												<div className="bg-white overflow-hidden shadow rounded-lg p-1">
													<h3 className="text-lg font-medium text-center text-gray-900">
														General
													</h3>
													<p className="text-3xl text-center font-semibold text-gray-900">
														5
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
										<div className="p-5 h-full flex flex-col">
											<h2 className="text-lg font-medium text-gray-900">
												Teams
											</h2>
											<div className="flex-1">
												<ul className="mt-2 overflow-y-auto flex-1">
													{teams.map((team) => (
														<li key={team.id} className="py-2">
															<div className="flex justify-between">
																<span className="font-medium">{team.name}</span>
																<span className="text-sm text-gray-500">
																	{team.initial}
																</span>
															</div>
														</li>
													))}
												</ul>
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
