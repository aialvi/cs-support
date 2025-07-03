import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
	UserGroupIcon, 
	TicketIcon, 
	CheckCircleIcon,
	ClockIcon 
} from "@heroicons/react/24/outline";

// Helper function to get the correct config
const getConfig = () => {
	return window.CS_SUPPORT_HELPDESK_TEAM_CONFIG || 
		   window.CS_SUPPORT_HELPDESK_TICKETS_CONFIG || 
		   {
			   nonce: '',
			   apiUrl: '/wp-json/cs-support/v1'
		   };
};

export default function TeamManagement() {
	const [teamStats, setTeamStats] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchTeamStats();
	}, []);

	const fetchTeamStats = async () => {
		try {
			const config = getConfig();
			const response = await fetch("/wp-json/cs-support/v1/team-members/stats", {
				headers: {
					"X-WP-Nonce": config.nonce,
				},
			});
			const data = await response.json();
			setTeamStats(data);
		} catch (error) {
			console.error("Error fetching team stats:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="animate-pulse">
				<div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<div key={i} className="h-20 bg-gray-200 rounded"></div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center space-x-2">
				<UserGroupIcon className="h-6 w-6 text-blue-600" />
				<h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
			</div>

			<div className="bg-white shadow rounded-lg">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-medium text-gray-900">
						Support Team Statistics
					</h3>
					<p className="text-sm text-gray-500">
						Overview of team member workload and performance
					</p>
				</div>

				<div className="p-6">
					{teamStats.length === 0 ? (
						<div className="text-center py-8">
							<UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900">
								No team members found
							</h3>
							<p className="text-sm text-gray-500">
								Add users with support roles to see team statistics.
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{teamStats.map((member) => (
								<TeamMemberCard key={member.user.ID} member={member} />
							))}
						</div>
					)}
				</div>
			</div>

			<RoleAssignmentSection />

			<div className="bg-white shadow rounded-lg p-6">
				<h3 className="text-lg font-medium text-gray-900 mb-4">
					Team Summary
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="bg-blue-50 p-4 rounded-lg">
						<div className="flex items-center">
							<UserGroupIcon className="h-8 w-8 text-blue-600" />
							<div className="ml-3">
								<p className="text-sm font-medium text-blue-900">
									Total Team Members
								</p>
								<p className="text-2xl font-bold text-blue-600">
									{teamStats.length}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-yellow-50 p-4 rounded-lg">
						<div className="flex items-center">
							<ClockIcon className="h-8 w-8 text-yellow-600" />
							<div className="ml-3">
								<p className="text-sm font-medium text-yellow-900">
									Active Tickets
								</p>
								<p className="text-2xl font-bold text-yellow-600">
									{teamStats.reduce((sum, member) => sum + member.assigned_tickets, 0)}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-green-50 p-4 rounded-lg">
						<div className="flex items-center">
							<CheckCircleIcon className="h-8 w-8 text-green-600" />
							<div className="ml-3">
								<p className="text-sm font-medium text-green-900">
									Resolved This Month
								</p>
								<p className="text-2xl font-bold text-green-600">
									{teamStats.reduce((sum, member) => sum + member.resolved_this_month, 0)}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function TeamMemberCard({ member }) {
	const { user, assigned_tickets, resolved_this_month } = member;

	const getWorkloadColor = (count) => {
		if (count === 0) return "text-gray-500";
		if (count <= 3) return "text-green-600";
		if (count <= 6) return "text-yellow-600";
		return "text-red-600";
	};

	const getWorkloadBg = (count) => {
		if (count === 0) return "bg-gray-100";
		if (count <= 3) return "bg-green-100";
		if (count <= 6) return "bg-yellow-100";
		return "bg-red-100";
	};

	return (
		<div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<img
						src={user.avatar_url}
						alt={user.display_name}
						className="h-12 w-12 rounded-full"
					/>
					<div>
						<h4 className="text-lg font-medium text-gray-900">
							{user.display_name}
						</h4>
						<p className="text-sm text-gray-500">{user.user_email}</p>
						<div className="flex space-x-1 mt-1">
							{user.roles.map((role) => (
								<span
									key={role}
									className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
								>
									{role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
								</span>
							))}
						</div>
					</div>
				</div>

				<div className="flex items-center space-x-6">
					<div className="text-center">
						<div
							className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getWorkloadBg(
								assigned_tickets,
							)} ${getWorkloadColor(assigned_tickets)}`}
						>
							<TicketIcon className="h-4 w-4 mr-1" />
							{assigned_tickets}
						</div>
						<p className="text-xs text-gray-500 mt-1">Active Tickets</p>
					</div>

					<div className="text-center">
						<div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-600">
							<CheckCircleIcon className="h-4 w-4 mr-1" />
							{resolved_this_month}
						</div>
						<p className="text-xs text-gray-500 mt-1">Resolved This Month</p>
					</div>
				</div>
			</div>
		</div>
	);
}

// Role Assignment Section Component
function RoleAssignmentSection() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [assigning, setAssigning] = useState({});

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const config = getConfig();
			// Get all users (we'll filter on the backend)
			const response = await fetch("/wp-json/wp/v2/users", {
				headers: {
					"X-WP-Nonce": config.nonce,
				},
			});
			const data = await response.json();
			setUsers(data);
		} catch (error) {
			console.error("Error fetching users:", error);
		} finally {
			setLoading(false);
		}
	};

	const assignRole = async (userId, role) => {
		setAssigning(prev => ({ ...prev, [userId]: true }));
		
		try {
			const config = getConfig();
			const response = await fetch(
				`/wp-json/cs-support/v1/team-members/${userId}/assign-role`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"X-WP-Nonce": config.nonce,
					},
					body: JSON.stringify({ role }),
				}
			);

			const result = await response.json();
			
			if (result.success) {
				toast.success(`Role ${role} assigned successfully`);
				// Refresh users list
				fetchUsers();
			} else {
				toast.error(result.message || "Failed to assign role");
			}
		} catch (error) {
			console.error("Error assigning role:", error);
			toast.error("Failed to assign role");
		} finally {
			setAssigning(prev => ({ ...prev, [userId]: false }));
		}
	};

	return (
		<div className="bg-white shadow rounded-lg">
			<div className="px-6 py-4 border-b border-gray-200">
				<h3 className="text-lg font-medium text-gray-900">
					Assign Support Roles
				</h3>
				<p className="text-sm text-gray-500">
					Assign support roles to users to give them access to the ticket system
				</p>
			</div>

			<div className="p-6">
				{loading ? (
					<div className="animate-pulse space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-16 bg-gray-200 rounded"></div>
						))}
					</div>
				) : (
					<div className="space-y-4">
						{users.map((user) => (
							<div
								key={user.id}
								className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
							>
								<div className="flex items-center space-x-3">
									<img
										src={user.avatar_urls?.[48] || `https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y`}
										alt={user.name}
										className="h-10 w-10 rounded-full"
									/>
									<div>
										<p className="font-medium text-gray-900">{user.name}</p>
										<p className="text-sm text-gray-500">@{user.slug}</p>
										{user.roles && user.roles.length > 0 && (
											<div className="flex space-x-1 mt-1">
												{user.roles.map((role) => (
													<span
														key={role}
														className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
													>
														{role.replace('_', ' ')}
													</span>
												))}
											</div>
										)}
									</div>
								</div>

								<div className="flex space-x-2">
									<button
										onClick={() => assignRole(user.id, 'support_agent')}
										disabled={assigning[user.id]}
										className="px-3 py-1 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 disabled:opacity-50"
									>
										{assigning[user.id] ? 'Assigning...' : 'Support Agent'}
									</button>
									<button
										onClick={() => assignRole(user.id, 'support_manager')}
										disabled={assigning[user.id]}
										className="px-3 py-1 text-sm font-medium text-green-600 border border-green-600 rounded hover:bg-green-50 disabled:opacity-50"
									>
										{assigning[user.id] ? 'Assigning...' : 'Support Manager'}
									</button>
									<button
										onClick={() => assignRole(user.id, 'remove')}
										disabled={assigning[user.id]}
										className="px-3 py-1 text-sm font-medium text-red-600 border border-red-600 rounded hover:bg-red-50 disabled:opacity-50"
									>
										{assigning[user.id] ? 'Removing...' : 'Remove Role'}
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
