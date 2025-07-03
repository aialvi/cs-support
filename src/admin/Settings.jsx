import { useState, useEffect } from "react";
import {
	Cog6ToothIcon,
	EnvelopeIcon,
	UserGroupIcon,
	BellIcon,
	SparklesIcon,
} from "@heroicons/react/24/outline";

export default function Settings() {
	const [settings, setSettings] = useState({
		general: {
			defaultPriority: "normal",
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

	useEffect(() => {
		// Fetch current settings
		const fetchSettings = async () => {
			try {
				const response = await fetch(CS_SUPPORT_HELPDESK_SETTINGS_CONFIG.apiUrl, {
					method: "GET",
					headers: {
						"X-WP-Nonce": CS_SUPPORT_HELPDESK_SETTINGS_CONFIG.nonce,
					},
				});

				if (response.ok) {
					const data = await response.json();
					// If settings exist, update the state
					if (data && Object.keys(data).length > 0) {
						setSettings(data);
					}
				}
			} catch (error) {
				console.error("Error fetching settings:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSettings();
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSaving(true);
		setSaveMessage("");

		try {
			const response = await fetch(CS_SUPPORT_HELPDESK_SETTINGS_CONFIG.apiUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-WP-Nonce": CS_SUPPORT_HELPDESK_SETTINGS_CONFIG.nonce,
				},
				body: JSON.stringify(settings),
			});

			const data = await response.json();

			if (data.success) {
				setSaveMessage("Settings saved successfully!");
			} else {
				setSaveMessage("Failed to save settings. Please try again.");
			}
		} catch (error) {
			setSaveMessage("An error occurred while saving settings.");
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

	if (isLoading) {
		return <div className="p-8 text-center">Loading settings...</div>;
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-3xl font-bold mb-8">CS Support Settings</h1>

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

					{/* Email Settings */}
					{/* <div className="bg-white shadow rounded-lg p-6">
						<div className="flex items-center mb-4">
							<EnvelopeIcon className="h-6 w-6 text-gray-500 mr-2" />
							<h2 className="text-xl font-semibold">Email Settings</h2>
						</div>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">
									From Name
								</label>
								<input
									type="text"
									value={settings.email.fromName}
									onChange={(e) =>
										handleChange("email", "fromName", e.target.value)
									}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">
									From Email
								</label>
								<input
									type="email"
									value={settings.email.fromEmail}
									onChange={(e) =>
										handleChange("email", "fromEmail", e.target.value)
									}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								/>
							</div>
						</div>
					</div> */}

					{/* Notification Settings */}
					{/* <div className="bg-white shadow rounded-lg p-6">
						<div className="flex items-center mb-4">
							<BellIcon className="h-6 w-6 text-gray-500 mr-2" />
							<h2 className="text-xl font-semibold">Notification Settings</h2>
						</div>

						<div className="space-y-4">
							<div className="flex items-center">
								<input
									type="checkbox"
									id="adminNewTicket"
									checked={settings.notifications.adminNewTicket}
									onChange={(e) =>
										handleChange(
											"notifications",
											"adminNewTicket",
											e.target.checked,
										)
									}
									className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								<label
									htmlFor="adminNewTicket"
									className="ml-2 block text-sm text-gray-900"
								>
									Notify admin on new ticket
								</label>
							</div>

							<div className="flex items-center">
								<input
									type="checkbox"
									id="userNewReply"
									checked={settings.notifications.userNewReply}
									onChange={(e) =>
										handleChange(
											"notifications",
											"userNewReply",
											e.target.checked,
										)
									}
									className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								<label
									htmlFor="userNewReply"
									className="ml-2 block text-sm text-gray-900"
								>
									Notify users on new replies
								</label>
							</div>
						</div>
					</div> */}

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
