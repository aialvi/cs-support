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
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const config = getConfig();
			const response = await fetch("/wp-json/wp/v2/users?per_page=100", {
				headers: {
					"X-WP-Nonce": config.nonce,
				},
			});
			if (!response.ok) throw new Error('Failed to fetch users');
			const data = await response.json();
			setUsers(data);
		} catch (error) {
			console.error("Error fetching users:", error);
			toast.error("Failed to load users");
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
				toast.success(
					role === 'remove' 
						? "Support role removed successfully" 
						: `${role.replace('_', ' ')} role assigned successfully`
				);
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

	// Filter users based on search term
	const filteredUsers = users.filter(user => 
		user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		user.slug.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const hasAssignableUsers = filteredUsers.length > 0;

	const getSupportRoles = (userRoles) => {
		if (!userRoles) return [];
		return userRoles.filter(role => 
			role.includes('support') || role === 'administrator'
		);
	};

	const getRoleColor = (role) => {
		switch (role) {
			case 'support_manager':
				return 'bg-purple-100 text-purple-800';
			case 'support_agent':
				return 'bg-blue-100 text-blue-800';
			case 'administrator':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	return (
		<div className="bg-white shadow-lg rounded-xl border border-gray-200">
			<div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
				<h3 className="text-lg font-semibold text-gray-900 flex items-center">
					<UserGroupIcon className="h-5 w-5 mr-2 text-indigo-600" />
					Assign Support Roles
				</h3>
				<p className="text-sm text-gray-600 mt-1">
					Assign support roles to users to give them access to the ticket system
				</p>
			</div>

			<div className="p-6">
				{/* Search Bar */}
				<div className="mb-6">
					<div className="relative">
						<input
							type="text"
							placeholder="Search users by name or username..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						/>
					</div>
				</div>

				{loading ? (
					<div className="animate-pulse space-y-4">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
						))}
					</div>
				) : hasAssignableUsers ? (
					<div className="space-y-4 max-h-96 overflow-y-auto">
						{filteredUsers.map((user) => {
							const supportRoles = getSupportRoles(user.roles);
							const hasSupportRole = supportRoles.length > 0;
							
							return (
								<div
									key={user.id}
									className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 hover:border-indigo-300"
								>
									<div className="flex items-center space-x-4">
										<img
											src={user.avatar_urls?.[48] || `https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y`}
											alt={user.name}
											className="h-12 w-12 rounded-full border-2 border-gray-200"
										/>
										<div>
											<div className="flex items-center space-x-2 mb-1">
												<p className="font-semibold text-gray-900">{user.name}</p>
												{supportRoles.length > 0 && (
													<div className="flex space-x-1">
														{supportRoles.map((role) => (
															<span
																key={role}
																className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role)}`}
															>
																{role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
															</span>
														))}
													</div>
												)}
											</div>
											<p className="text-sm text-gray-500">@{user.slug}</p>
										</div>
									</div>

									<div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
										<button
											onClick={() => assignRole(user.id, 'support_agent')}
											disabled={assigning[user.id]}
											className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
										>
											{assigning[user.id] ? (
												<div className="flex items-center">
													<div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
													Assigning...
												</div>
											) : (
												'Support Agent'
											)}
										</button>
										
										<button
											onClick={() => assignRole(user.id, 'support_manager')}
											disabled={assigning[user.id]}
											className="px-4 py-2 text-sm font-medium text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
										>
											{assigning[user.id] ? (
												<div className="flex items-center">
													<div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full mr-2"></div>
													Assigning...
												</div>
											) : (
												'Support Manager'
											)}
										</button>
										
										{hasSupportRole && (
											<button
												onClick={() => assignRole(user.id, 'remove')}
												disabled={assigning[user.id]}
												className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
											>
												{assigning[user.id] ? (
													<div className="flex items-center">
														<div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full mr-2"></div>
														Removing...
													</div>
												) : (
													'Remove Role'
												)}
											</button>
										)}
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="text-center py-12">
						<UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							{searchTerm ? 'No users found' : 'No users available'}
						</h3>
						<p className="text-sm text-gray-500">
							{searchTerm 
								? 'Try adjusting your search criteria' 
								: 'No users are available for role assignment'
							}
						</p>
						{searchTerm && (
							<button
								onClick={() => setSearchTerm("")}
								className="mt-4 text-sm text-indigo-600 hover:text-indigo-500"
							>
								Clear search
							</button>
						)}
					</div>
				)}

				{/* Role Descriptions */}
				<div className="mt-8 border-t border-gray-200 pt-6">
					<h4 className="text-sm font-semibold text-gray-900 mb-4">Role Descriptions</h4>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
							<h5 className="font-medium text-blue-900 mb-2">Support Agent</h5>
							<p className="text-sm text-blue-700">
								Can view, respond to, and update support tickets. Perfect for team members who handle customer inquiries.
							</p>
						</div>
						<div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
							<h5 className="font-medium text-purple-900 mb-2">Support Manager</h5>
							<p className="text-sm text-purple-700">
								Has all agent permissions plus the ability to manage team assignments, view analytics, and configure settings.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
