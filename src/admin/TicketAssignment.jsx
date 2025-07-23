import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { UserIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

export default function TicketAssignment( { ticket, onAssignmentChange } ) {
	const [ teamMembers, setTeamMembers ] = useState( [] );
	const [ isOpen, setIsOpen ] = useState( false );
	const [ loading, setLoading ] = useState( false );
	const [ assigning, setAssigning ] = useState( false );

	const buttonRef = useRef();
	const dropdownRef = useRef();
	const [ dropdownTop, setDropdownTop ] = useState( 0 );
	const [ dropdownLeft, setDropdownLeft ] = useState( 0 );

	useEffect( () => {
		fetchTeamMembers();
	}, [] );

	const fetchTeamMembers = async () => {
		setLoading( true );
		try {
			const response = await fetch(
				'/wp-json/cs-support/v1/team-members',
				{
					headers: {
						'X-WP-Nonce': CS_SUPPORT_HELPDESK_TICKETS_CONFIG.nonce,
					},
				}
			);
			const data = await response.json();
			setTeamMembers( data );
		} catch ( error ) {
			console.error( 'Error fetching team members:', error );
			toast.error( 'Failed to load team members' );
		} finally {
			setLoading( false );
		}
	};

	const handleAssignment = async ( assigneeId ) => {
		// Show confirmation for reassignments
		if ( ticket.assignee_id && ticket.assignee_id != assigneeId ) {
			const currentAssigneeName =
				currentAssignee?.display_name || 'Unknown';
			const newAssigneeName = assigneeId
				? teamMembers.find( ( m ) => m.ID == assigneeId )
						?.display_name || 'Unknown'
				: 'Unassigned';

			const confirmMessage = `Are you sure you want to reassign this ticket from ${ currentAssigneeName } to ${ newAssigneeName }?`;

			if ( ! confirm( confirmMessage ) ) {
				setIsOpen( false );
				return;
			}
		}

		setAssigning( true );
		setIsOpen( false );

		try {
			const response = await fetch(
				`/wp-json/cs-support/v1/tickets/${ ticket.id }/assign`,
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': CS_SUPPORT_HELPDESK_TICKETS_CONFIG.nonce,
					},
					body: JSON.stringify( {
						assignee_id: assigneeId,
					} ),
				}
			);

			const data = await response.json();

			if ( data.success ) {
				toast.success( 'Ticket assigned successfully' );
				onAssignmentChange && onAssignmentChange( data.ticket );
			} else {
				toast.error( data.message || 'Failed to assign ticket' );
			}
		} catch ( error ) {
			console.error( 'Error assigning ticket:', error );
			toast.error( 'Failed to assign ticket' );
		} finally {
			setAssigning( false );
		}
	};

	const currentAssignee = teamMembers.find(
		( member ) => member.ID == ticket.assignee_id
	);

	// Calculate dropdown position when opened
	useEffect( () => {
		if ( isOpen && buttonRef.current ) {
			const rect = buttonRef.current.getBoundingClientRect();
			setDropdownTop( rect.bottom + window.scrollY );
			setDropdownLeft( rect.left + window.scrollX );
		}
	}, [ isOpen ] );

	if ( loading ) {
		return (
			<div className="flex items-center space-x-2 text-gray-500">
				<UserIcon className="h-4 w-4" />
				<span className="text-sm">Loading team members...</span>
			</div>
		);
	}

	return (
		<div className="relative">
			<button
				ref={ buttonRef }
				onClick={ () => setIsOpen( ! isOpen ) }
				disabled={ assigning }
				className="w-full flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				<UserIcon className="h-4 w-4" />
				<span>
					{ assigning
						? 'Assigning...'
						: currentAssignee
						? currentAssignee.display_name
						: 'Unassigned' }
				</span>
				<ChevronDownIcon className="h-4 w-4" />
			</button>

			{ /* Dropdown rendered in portal */ }
			{ isOpen &&
				ReactDOM.createPortal(
					<div
						ref={ dropdownRef }
						className="absolute z-50 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg"
						style={ {
							left: dropdownLeft,
							top: dropdownTop,
							position: 'absolute',
						} }
					>
						<div className="py-1 max-h-60 overflow-y-auto z-50">
							{ /* Unassigned option */ }
							<button
								onClick={ () => handleAssignment( null ) }
								className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-3"
							>
								<div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
									<UserIcon className="h-4 w-4 text-gray-500" />
								</div>
								<div>
									<div className="font-medium text-gray-900">
										Unassigned
									</div>
									<div className="text-xs text-gray-500">
										Remove assignment
									</div>
								</div>
							</button>

							{ /* Team members */ }
							{ teamMembers.map( ( member ) => (
								<button
									key={ member.ID }
									onClick={ () =>
										handleAssignment( member.ID )
									}
									className={ `w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-3 ${
										member.ID == ticket.assignee_id
											? 'bg-blue-50'
											: ''
									}` }
								>
									<img
										src={ member.avatar_url }
										alt={ member.display_name }
										className="h-8 w-8 rounded-full"
									/>
									<div className="flex-1">
										<div className="font-medium text-gray-900">
											{ member.display_name }
										</div>
										<div className="text-xs text-gray-500">
											{ member.roles.join( ', ' ) }
										</div>
									</div>
									{ member.ID == ticket.assignee_id && (
										<div className="text-blue-600 text-xs">
											Current
										</div>
									) }
								</button>
							) ) }
						</div>
					</div>,
					document.body
				) }

			{ /* Overlay to close dropdown */ }
			{ isOpen && (
				<div
					className="fixed inset-0 z-40"
					onClick={ () => setIsOpen( false ) }
				/>
			) }
		</div>
	);
}
