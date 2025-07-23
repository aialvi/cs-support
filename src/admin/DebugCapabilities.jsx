import { useState, useEffect } from 'react';
import { BugAntIcon } from '@heroicons/react/24/outline';

export default function DebugCapabilities() {
	const [ debugInfo, setDebugInfo ] = useState( null );
	const [ loading, setLoading ] = useState( true );

	useEffect( () => {
		fetchDebugInfo();
	}, [] );

	const fetchDebugInfo = async () => {
		try {
			const response = await fetch(
				'/wp-json/cs-support/v1/debug/user-capabilities',
				{
					headers: {
						'X-WP-Nonce': CS_SUPPORT_HELPDESK_TICKETS_CONFIG.nonce,
					},
				}
			);
			const data = await response.json();
			setDebugInfo( data );
		} catch ( error ) {
			console.error( 'Error fetching debug info:', error );
		} finally {
			setLoading( false );
		}
	};

	if ( loading ) {
		return (
			<div className="animate-pulse">
				<div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
				<div className="h-64 bg-gray-200 rounded"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center space-x-2">
				<BugAntIcon className="h-6 w-6 text-yellow-600" />
				<h2 className="text-2xl font-bold text-gray-900">
					Debug Information
				</h2>
			</div>

			<div className="bg-white shadow rounded-lg">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-medium text-gray-900">
						Current User Capabilities
					</h3>
					<p className="text-sm text-gray-500">
						Debug information for current user's permissions and
						roles
					</p>
				</div>

				<div className="p-6">
					{ debugInfo ? (
						<div className="space-y-4">
							<div>
								<h4 className="font-medium text-gray-900">
									User Information
								</h4>
								<div className="mt-2 space-y-1">
									<p>
										<strong>User ID:</strong>{ ' ' }
										{ debugInfo.user_id }
									</p>
									<p>
										<strong>Username:</strong>{ ' ' }
										{ debugInfo.username }
									</p>
								</div>
							</div>

							<div>
								<h4 className="font-medium text-gray-900">
									User Roles
								</h4>
								<div className="mt-2 flex flex-wrap gap-2">
									{ debugInfo.roles &&
									debugInfo.roles.length > 0 ? (
										debugInfo.roles.map( ( role ) => (
											<span
												key={ role }
												className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
											>
												{ role
													.replace( '_', ' ' )
													.replace( /\b\w/g, ( l ) =>
														l.toUpperCase()
													) }
											</span>
										) )
									) : (
										<span className="text-gray-500">
											No roles assigned
										</span>
									) }
								</div>
							</div>

							<div>
								<h4 className="font-medium text-gray-900">
									Support Capabilities
								</h4>
								<div className="mt-2 space-y-2">
									{ Object.entries(
										debugInfo.capabilities
									).map(
										( [ capability, hasCapability ] ) => (
											<div
												key={ capability }
												className="flex items-center justify-between"
											>
												<span className="text-sm font-medium">
													{ capability
														.replace( '_', ' ' )
														.replace(
															/\b\w/g,
															( l ) =>
																l.toUpperCase()
														) }
												</span>
												<span
													className={ `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
														hasCapability
															? 'bg-green-100 text-green-800'
															: 'bg-red-100 text-red-800'
													}` }
												>
													{ hasCapability
														? 'Yes'
														: 'No' }
												</span>
											</div>
										)
									) }
								</div>
							</div>

							<div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
								<h4 className="font-medium text-yellow-800">
									Permission Issues?
								</h4>
								<p className="mt-1 text-sm text-yellow-700">
									If you're seeing "Sorry, you are not allowed
									to access this page" errors:
								</p>
								<ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
									<li>
										Ensure you have the "view_all_tickets"
										or "edit_tickets" capability
									</li>
									<li>
										Check if you're assigned as "Support
										Agent" or "Support Manager" role
									</li>
									<li>
										Administrators should have
										"manage_options" capability
									</li>
								</ul>
							</div>
						</div>
					) : (
						<div className="text-center text-gray-500">
							Failed to load debug information
						</div>
					) }
				</div>
			</div>
		</div>
	);
}
