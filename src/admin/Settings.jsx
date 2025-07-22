import { useState, useEffect } from "react";
import {
	Cog6ToothIcon,
	EnvelopeIcon,
	UserGroupIcon,
	BellIcon,
	SparklesIcon,
	ShieldCheckIcon,
	DocumentArrowDownIcon,
	TrashIcon,
	ClockIcon,
} from "@heroicons/react/24/outline";

export default function Settings() {
	const [settings, setSettings] = useState({
		general: {
			defaultPriority: "normal",
			redirectPage: "",
			// allowGuestTickets: false,
			// ticketsPerPage: 10,
		},
		ai: {
			enabled: false,
			provider: "openai",
			apiKey: "",
			model: "gpt-4o-mini",
			maxTokens: 500,
			temperature: 0.7,
		},
		gdpr: {
			dataRetention: {
				enabled: false,
				retentionDays: 730, // 2 years
				autoCleanup: false,
				notifyBeforeDays: 30,
				anonymizeInsteadDelete: true,
			},
		},
		// notifications: {
		// 	adminNewTicket: true,
		// 	adminNewReply: true,
		// 	userNewReply: true,
		// 	emailTemplate: "default",
		// },
		// roles: {
		// 	canCreateTickets: ["administrator", "editor", "author"],
		// 	canManageTickets: ["administrator"],
		// 	canViewAllTickets: ["administrator", "editor"],
		// },
		// email: {
		// 	fromName: "Support System",
		// 	fromEmail: "support@example.com",
		// 	replyTo: "support@example.com",
		// },
	});

	const [isSaving, setIsSaving] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [saveMessage, setSaveMessage] = useState("");
	const [pages, setPages] = useState([]);

	// GDPR-related state
	const [isExporting, setIsExporting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isRunningCleanup, setIsRunningCleanup] = useState(false);
	const [gdprMessage, setGdprMessage] = useState("");
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [deletionType, setDeletionType] = useState("anonymize");

	useEffect(() => {
		// Fetch current settings and pages
		const fetchSettings = async () => {
			try {
				const [settingsResponse, gdprResponse] = await Promise.all([
					fetch(CS_SUPPORT_HELPDESK_SETTINGS_CONFIG.apiUrl, {
						method: "GET",
						headers: {
							"X-WP-Nonce": CS_SUPPORT_HELPDESK_SETTINGS_CONFIG.nonce,
						},
					}),
					fetch(`${CS_SUPPORT_HELPDESK_SETTINGS_CONFIG.apiBaseUrl}/gdpr/data-retention`, {
						method: "GET",
						headers: {
							"X-WP-Nonce": CS_SUPPORT_HELPDESK_SETTINGS_CONFIG.nonce,
						},
					})
				]);

				if (settingsResponse.ok) {
					const data = await settingsResponse.json();
					if (data && Object.keys(data).length > 0) {
						setSettings(prev => ({
							...prev,
							...data
						}));
					}
				}

				if (gdprResponse.ok) {
					const gdprData = await gdprResponse.json();
					if (gdprData) {
						setSettings(prev => ({
							...prev,
							gdpr: {
								dataRetention: gdprData
							}
						}));
					}
				}
			} catch (error) {
				console.error("Error fetching settings:", error);
			}
		};

		const fetchPages = async () => {
			try {
				const response = await fetch("/wp-json/wp/v2/pages?per_page=100", {
					headers: {
						"X-WP-Nonce": CS_SUPPORT_HELPDESK_SETTINGS_CONFIG.nonce,
					},
				});

				if (response.ok) {
					const data = await response.json();
					setPages(data);
				}
			} catch (error) {
				console.error("Error fetching pages:", error);
			} finally {
				setIsLoading(false);
			}
		};

		Promise.all([fetchSettings(), fetchPages()]);
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSaving(true);
		setSaveMessage("");

		try {
			// Save general settings
			const generalSettingsResponse = await fetch(CS_SUPPORT_HELPDESK_SETTINGS_CONFIG.apiUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-WP-Nonce": CS_SUPPORT_HELPDESK_SETTINGS_CONFIG.nonce,
				},
				body: JSON.stringify({
					general: settings.general,
					ai: settings.ai
				}),
			});

			// Save GDPR settings
			const gdprSettingsResponse = await fetch(`${CS_SUPPORT_HELPDESK_SETTINGS_CONFIG.apiBaseUrl}/gdpr/data-retention`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-WP-Nonce": CS_SUPPORT_HELPDESK_SETTINGS_CONFIG.nonce,
				},
				body: JSON.stringify(settings.gdpr.dataRetention),
			});

			const [generalData, gdprData] = await Promise.all([
				generalSettingsResponse.json(),
				gdprSettingsResponse.json()
			]);

			if (generalData.success && gdprData.success) {
				setSaveMessage("✅ All settings saved successfully!");
			} else {
				setSaveMessage("❌ Failed to save some settings. Please try again.");
			}
		} catch (error) {
			setSaveMessage("❌ An error occurred while saving settings.");
			console.error("Settings save error:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleChange = (category, setting, value) => {
		setSettings((prev) => ({
			...prev,
			[category]: {
				...prev[category],
				[setting]: value,
			},
		}));
	};

	// GDPR Data Management Functions
	const handleExportData = async () => {
		setIsExporting(true);
		setGdprMessage("");
		
		try {
			const response = await fetch(
				`${CS_SUPPORT_HELPDESK_SETTINGS_CONFIG.apiBaseUrl}/gdpr/my-data`,
				{
					method: "GET",
					headers: {
						"X-WP-Nonce": CS_SUPPORT_HELPDESK_SETTINGS_CONFIG.nonce,
					},
				}
			);
			
			const data = await response.json();
			
			if (data.success) {
				// Create and download the file
				const blob = new Blob([JSON.stringify(data.data, null, 2)], {
					type: "application/json"
				});
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = data.filename || "my-support-data.json";
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				
				setGdprMessage("✅ Your data has been exported successfully!");
			} else {
				setGdprMessage("❌ Failed to export data. Please try again.");
			}
		} catch (error) {
			setGdprMessage("❌ An error occurred while exporting data.");
			console.error("Export error:", error);
		} finally {
			setIsExporting(false);
		}
	};

	const handleDeleteData = async (type) => {
		setIsDeleting(true);
		setGdprMessage("");
		
		try {
			const response = await fetch(
				`${CS_SUPPORT_HELPDESK_SETTINGS_CONFIG.apiBaseUrl}/gdpr/my-data?type=${type}`,
				{
					method: "DELETE",
					headers: {
						"X-WP-Nonce": CS_SUPPORT_HELPDESK_SETTINGS_CONFIG.nonce,
					},
				}
			);
			
			const data = await response.json();
			
			if (data.success) {
				setGdprMessage(`✅ Your data has been ${type === 'delete' ? 'deleted' : 'anonymized'} successfully!`);
				setShowDeleteConfirm(false);
			} else {
				setGdprMessage("❌ Failed to process request. Please try again.");
			}
		} catch (error) {
			setGdprMessage("❌ An error occurred while processing your request.");
			console.error("Delete error:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleRunCleanup = async () => {
		setIsRunningCleanup(true);
		setGdprMessage("");
		
		try {
			const response = await fetch(
				`${CS_SUPPORT_HELPDESK_SETTINGS_CONFIG.apiBaseUrl}/gdpr/cleanup`,
				{
					method: "POST",
					headers: {
						"X-WP-Nonce": CS_SUPPORT_HELPDESK_SETTINGS_CONFIG.nonce,
					},
				}
			);
			
			const data = await response.json();
			
			if (data.success) {
				setGdprMessage(`✅ Cleanup completed: ${data.stats.tickets_deleted} tickets and ${data.stats.replies_deleted} replies removed.`);
			} else {
				setGdprMessage("❌ Failed to run cleanup. Please try again.");
			}
		} catch (error) {
			setGdprMessage("❌ An error occurred during cleanup.");
			console.error("Cleanup error:", error);
		} finally {
			setIsRunningCleanup(false);
		}
	};

	const handleGdprSettingsChange = (setting, value) => {
		setSettings((prev) => ({
			...prev,
			gdpr: {
				...prev.gdpr,
				dataRetention: {
					...prev.gdpr.dataRetention,
					[setting]: value,
				},
			},
		}));
	};

	if (isLoading) {
		return <div className="p-8 text-center">Loading settings...</div>;
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-3xl font-bold mb-8">ClientSync Support Settings</h1>

				<form onSubmit={handleSubmit} className="space-y-8">
					{/* General Settings */}
					<div className="bg-white shadow rounded-lg p-6">
						<div className="flex items-center mb-4">
							<Cog6ToothIcon className="h-6 w-6 text-gray-500 mr-2" />
							<h2 className="text-xl font-semibold">General Settings</h2>
						</div>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Default Priority
								</label>
								<select
									value={settings.general.defaultPriority || "normal"}
									onChange={(e) =>
										handleChange("general", "defaultPriority", e.target.value)
									}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								>
									<option value="low">Low</option>
									<option value="normal">Normal</option>
									<option value="high">High</option>
									<option value="urgent">Urgent</option>
								</select>
								<p className="mt-1 text-sm text-gray-500">
									This will be the default priority for all new tickets
								</p>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">
									Redirect Page After Ticket Creation
								</label>
								<select
									value={settings.general.redirectPage || ""}
									onChange={(e) =>
										handleChange("general", "redirectPage", e.target.value)
									}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								>
									<option value="">No redirect (stay on current page)</option>
									{pages.map((page) => (
										<option key={page.id} value={page.id}>
											{page.title.rendered}
										</option>
									))}
								</select>
								<p className="mt-1 text-sm text-gray-500">
									Select a page where users will be redirected after creating a ticket. This page should contain the cs-support-frontend block to display their tickets.
								</p>
							</div>

							{/* <div className="flex items-center">
								<input
									type="checkbox"
									id="allowGuestTickets"
									checked={settings.general.allowGuestTickets}
									onChange={(e) =>
										handleChange(
											"general",
											"allowGuestTickets",
											e.target.checked,
										)
									}
									className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								<label
									htmlFor="allowGuestTickets"
									className="ml-2 block text-sm text-gray-900"
								>
									Allow guest ticket submissions
								</label>
							</div> */}
						</div>
					</div>

					{/* AI Assistant Settings */}
					<div className="bg-white shadow rounded-lg p-6">
						<div className="flex items-center mb-4">
							<SparklesIcon className="h-6 w-6 text-gray-500 mr-2" />
							<h2 className="text-xl font-semibold">AI Assistant Settings</h2>
						</div>

						<div className="space-y-4">
							<div className="flex items-center">
								<input
									type="checkbox"
									id="aiEnabled"
									checked={settings.ai?.enabled || false}
									onChange={(e) =>
										handleChange("ai", "enabled", e.target.checked)
									}
									className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								<label
									htmlFor="aiEnabled"
									className="ml-2 block text-sm text-gray-900"
								>
									Enable AI-powered reply suggestions
								</label>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">
									AI Provider
								</label>
								<select
									value={settings.ai?.provider || "openai"}
									onChange={(e) =>
										handleChange("ai", "provider", e.target.value)
									}
									disabled={!settings.ai?.enabled}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
								>
									<option value="openai">OpenAI</option>
									<option value="gemini">Google Gemini</option>
									<option value="anthropic">Anthropic Claude</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">
									API Key
								</label>
								<input
									type="password"
									value={settings.ai?.apiKey || ""}
									onChange={(e) =>
										handleChange("ai", "apiKey", e.target.value)
									}
									disabled={!settings.ai?.enabled}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
									placeholder="Enter your API key"
								/>
								<p className="mt-1 text-sm text-gray-500">
									{settings.ai?.provider === "openai" && "Get your API key from https://platform.openai.com/api-keys"}
									{settings.ai?.provider === "gemini" && "Get your API key from https://aistudio.google.com/app/apikey"}
									{settings.ai?.provider === "anthropic" && "Get your API key from https://console.anthropic.com/"}
								</p>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">
									AI Model
								</label>
								<select
									value={settings.ai?.model || "gpt-3.5-turbo"}
									onChange={(e) => handleChange("ai", "model", e.target.value)}
									disabled={!settings.ai?.enabled}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
								>
									{settings.ai?.provider === "openai" && (
										<>
											<option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
											<option value="gpt-4">GPT-4</option>
											<option value="gpt-4-turbo">GPT-4 Turbo</option>
											<option value="gpt-4o">GPT-4o</option>
											<option value="gpt-4o-mini">GPT-4o Mini</option>
											<option value="o1-preview">o1-preview</option>
											<option value="o1-mini">o1-mini</option>
										</>
									)}
									{settings.ai?.provider === "gemini" && (
										<>
											<option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
											<option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
											<option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Experimental)</option>
											<option value="gemini-exp-1206">Gemini Experimental 1206</option>
											<option value="gemini-1.0-pro">Gemini 1.0 Pro</option>
										</>
									)}
									{settings.ai?.provider === "anthropic" && (
										<>
											<option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
											<option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
											<option value="claude-3-opus-20240229">Claude 3 Opus</option>
											<option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
											<option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
										</>
									)}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">
									Temperature (Creativity)
								</label>
								<input
									type="range"
									min="0"
									max="1"
									step="0.1"
									value={settings.ai?.temperature || 0.7}
									onChange={(e) =>
										handleChange("ai", "temperature", parseFloat(e.target.value))
									}
									disabled={!settings.ai?.enabled}
									className="mt-1 block w-full disabled:opacity-50"
								/>
								<div className="flex justify-between mt-1">
									<span className="text-xs text-gray-500">Professional (0)</span>
									<span className="text-xs text-gray-500">
										{settings.ai?.temperature || 0.7}
									</span>
									<span className="text-xs text-gray-500">Creative (1)</span>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">
									Max Response Length
								</label>
								<input
									type="number"
									min="100"
									max="2000"
									value={settings.ai?.maxTokens || 500}
									onChange={(e) =>
										handleChange("ai", "maxTokens", parseInt(e.target.value))
									}
									disabled={!settings.ai?.enabled}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
								/>
								<p className="mt-1 text-sm text-gray-500">
									Maximum length of AI-generated responses
								</p>
							</div>
						</div>
					</div>

					{/* GDPR & Privacy Settings */}
					<div className="bg-white shadow rounded-lg p-6">
						<div className="flex items-center mb-4">
							<ShieldCheckIcon className="h-6 w-6 text-gray-500 mr-2" />
							<h2 className="text-xl font-semibold">GDPR & Privacy Settings</h2>
						</div>

						<div className="space-y-6">
							{/* Data Retention Settings */}
							<div className="border-b pb-4">
								<h3 className="text-lg font-medium mb-3 flex items-center">
									<ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
									Data Retention
								</h3>
								
								<div className="space-y-4">
									<div className="flex items-center">
										<input
											type="checkbox"
											id="dataRetentionEnabled"
											checked={settings.gdpr.dataRetention.enabled}
											onChange={(e) =>
												handleGdprSettingsChange("enabled", e.target.checked)
											}
											className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
										/>
										<label
											htmlFor="dataRetentionEnabled"
											className="ml-2 block text-sm text-gray-900"
										>
											Enable automatic data retention management
										</label>
									</div>

									<div className={`space-y-4 ${!settings.gdpr.dataRetention.enabled ? 'opacity-50' : ''}`}>
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Data Retention Period (days)
											</label>
											<input
												type="number"
												min="30"
												max="3650"
												value={settings.gdpr.dataRetention.retentionDays}
												onChange={(e) =>
													handleGdprSettingsChange("retentionDays", parseInt(e.target.value))
												}
												disabled={!settings.gdpr.dataRetention.enabled}
												className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
											/>
											<p className="mt-1 text-sm text-gray-500">
												Data older than this will be automatically cleaned up (minimum 30 days)
											</p>
										</div>

										<div className="flex items-center">
											<input
												type="checkbox"
												id="autoCleanup"
												checked={settings.gdpr.dataRetention.autoCleanup}
												onChange={(e) =>
													handleGdprSettingsChange("autoCleanup", e.target.checked)
												}
												disabled={!settings.gdpr.dataRetention.enabled}
												className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
											/>
											<label
												htmlFor="autoCleanup"
												className="ml-2 block text-sm text-gray-900"
											>
												Enable automatic daily cleanup
											</label>
										</div>

										<div className="flex items-center">
											<input
												type="checkbox"
												id="anonymizeInsteadDelete"
												checked={settings.gdpr.dataRetention.anonymizeInsteadDelete}
												onChange={(e) =>
													handleGdprSettingsChange("anonymizeInsteadDelete", e.target.checked)
												}
												disabled={!settings.gdpr.dataRetention.enabled}
												className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
											/>
											<label
												htmlFor="anonymizeInsteadDelete"
												className="ml-2 block text-sm text-gray-900"
											>
												Anonymize data instead of deleting
											</label>
										</div>
									</div>
								</div>
							</div>

							{/* User Data Management */}
							<div className="border-b pb-4">
								<h3 className="text-lg font-medium mb-3 flex items-center">
									<DocumentArrowDownIcon className="h-5 w-5 mr-2 text-gray-500" />
									My Data Management
								</h3>
								
								<div className="space-y-4">
									<div className="bg-blue-50 p-4 rounded-lg">
										<p className="text-sm text-blue-800 mb-3">
											🔒 <strong>Privacy Rights:</strong> You have the right to export or delete your personal data from our support system.
										</p>
										
										<div className="flex flex-wrap gap-3">
											<button
												onClick={handleExportData}
												disabled={isExporting}
												className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
											>
												<DocumentArrowDownIcon className="h-4 w-4 mr-2" />
												{isExporting ? "Exporting..." : "Export My Data"}
											</button>

											<button
												onClick={() => setShowDeleteConfirm(true)}
												disabled={isDeleting}
												className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
											>
												<TrashIcon className="h-4 w-4 mr-2" />
												{isDeleting ? "Processing..." : "Delete My Data"}
											</button>
										</div>
									</div>

									{gdprMessage && (
										<div className={`p-3 rounded-md ${
											gdprMessage.includes("✅") 
												? "bg-green-50 text-green-800 border border-green-200" 
												: "bg-red-50 text-red-800 border border-red-200"
										}`}>
											{gdprMessage}
										</div>
									)}
								</div>
							</div>

							{/* Admin Data Management */}
							<div>
								<h3 className="text-lg font-medium mb-3 flex items-center">
									<TrashIcon className="h-5 w-5 mr-2 text-gray-500" />
									Admin Data Management
								</h3>
								
								<div className="space-y-4">
									<div className="bg-yellow-50 p-4 rounded-lg">
										<p className="text-sm text-yellow-800 mb-3">
											⚠️ <strong>Admin Only:</strong> Run data cleanup based on retention settings. This will permanently remove old data.
										</p>
										
										<button
											onClick={handleRunCleanup}
											disabled={isRunningCleanup}
											className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
										>
											<TrashIcon className="h-4 w-4 mr-2" />
											{isRunningCleanup ? "Running Cleanup..." : "Run Data Cleanup"}
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Delete Confirmation Modal */}
					{showDeleteConfirm && (
						<div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
							<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
								<h3 className="text-lg font-medium text-gray-900 mb-4">
									Delete Your Data
								</h3>
								<p className="text-sm text-gray-600 mb-4">
									Choose how you'd like to handle your data:
								</p>
								
								<div className="space-y-3 mb-6">
									<label className="flex items-center">
										<input
											type="radio"
											name="deletionType"
											value="anonymize"
											checked={deletionType === "anonymize"}
											onChange={(e) => setDeletionType(e.target.value)}
											className="h-4 w-4 text-blue-600"
										/>
										<span className="ml-2 text-sm">
											<strong>Anonymize</strong> - Remove personal identifiers but keep ticket content for support quality
										</span>
									</label>
									
									<label className="flex items-center">
										<input
											type="radio"
											name="deletionType"
											value="delete"
											checked={deletionType === "delete"}
											onChange={(e) => setDeletionType(e.target.value)}
											className="h-4 w-4 text-blue-600"
										/>
										<span className="ml-2 text-sm">
											<strong>Delete</strong> - Permanently remove all your tickets and data
										</span>
									</label>
								</div>
								
								<div className="flex justify-end space-x-3">
									<button
										onClick={() => setShowDeleteConfirm(false)}
										className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
									>
										Cancel
									</button>
									<button
										onClick={() => handleDeleteData(deletionType)}
										className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
									>
										Confirm {deletionType === "delete" ? "Deletion" : "Anonymization"}
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Save Button */}
					<div className="flex items-center justify-end space-x-4">
						{saveMessage && (
							<p
								className={`text-sm ${
									saveMessage.includes("success")
										? "text-green-600"
										: "text-red-600"
								}`}
							>
								{saveMessage}
							</p>
						)}
						<button
							type="submit"
							disabled={isSaving}
							className="inline-flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
						>
							{isSaving ? "Saving..." : "Save Settings"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
