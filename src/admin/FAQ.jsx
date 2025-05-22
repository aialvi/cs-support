import { useState } from "react";
import {
	ChevronDownIcon,
	ChevronUpIcon,
	MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const DEFAULT_FAQS = [
	{
		id: 1,
		category: "general",
		question: "What is CS Support plugin?",
		answer:
			"CS Support is a WordPress plugin that provides a complete helpdesk and ticket management system for your website. It allows your users to submit support tickets directly from your site.",
	},
	{
		id: 2,
		category: "setup",
		question: "How do I install the CS Support plugin?",
		answer:
			"Upload the plugin to your WordPress site, activate it from the Plugins menu, and configure the basic settings from the CS Support menu in your WordPress admin dashboard.",
	},
	{
		id: 3,
		category: "tickets",
		question: "How do users create support tickets?",
		answer:
			"Users can create tickets through the support form on your website. They'll need to provide a subject, description of their issue, and can optionally set a priority level.",
	},
	{
		id: 4,
		category: "tickets",
		question: "How do I manage incoming support tickets?",
		answer:
			"All tickets can be managed from the CS Support dashboard. You can view, assign, respond to, and update the status of tickets from this central location.",
	},
	{
		id: 5,
		category: "settings",
		question: "Can I customize the support form?",
		answer:
			"Yes, you can customize the support form fields, required information, and appearance through the block editor page.",
	},
];

export default function FAQ() {
	const [searchTerm, setSearchTerm] = useState("");
	const [activeId, setActiveId] = useState(null);
	const [selectedCategory, setSelectedCategory] = useState("all");

	const categories = [
		"all",
		...new Set(DEFAULT_FAQS.map((faq) => faq.category)),
	];

	const filteredFAQs = DEFAULT_FAQS.filter((faq) => {
		const matchesSearch =
			faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
			faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory =
			selectedCategory === "all" || faq.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold text-gray-900 mb-8">
				Frequently Asked Questions
			</h1>

			{/* Search and Filter */}
			<div className="mb-8 space-y-4">
				<div className="relative">
					<MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
					<input
						type="text"
						placeholder="Search FAQs..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-10 pr-4 h-10 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
						style={{ textIndent: "1.8rem" }}
					/>
				</div>

				<div className="flex gap-2">
					{categories.map((category) => (
						<button
							key={category}
							onClick={() => setSelectedCategory(category)}
							className={`px-4 py-2 rounded-md capitalize cursor-pointer ${
								selectedCategory === category
									? "bg-gray-800 text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							{category}
						</button>
					))}
				</div>
			</div>

			{/* FAQ List */}
			<div className="space-y-4">
				{filteredFAQs.map((faq) => (
					<div
						key={faq.id}
						className="border border-gray-200 rounded-lg overflow-hidden"
					>
						<button
							onClick={() => setActiveId(activeId === faq.id ? null : faq.id)}
							className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-slate-50 bg-gray-50 cursor-pointer"
						>
							<span className="font-medium text-gray-900">{faq.question}</span>
							{activeId === faq.id ? (
								<ChevronUpIcon className="h-5 w-5 text-gray-500" />
							) : (
								<ChevronDownIcon className="h-5 w-5 text-gray-500" />
							)}
						</button>

						{activeId === faq.id && (
							<div className="px-6 py-4 bg-gray-50">
								<p className="text-gray-700">{faq.answer}</p>
							</div>
						)}
					</div>
				))}
			</div>

			{/* Contact Support */}
			<div className="mt-12 p-6 bg-gray-50 rounded-lg text-center">
				<h3 className="text-lg font-medium text-gray-900 mb-2">
					Can't find what you're looking for?
				</h3>
				<p className="text-gray-700 mb-4">Our support team is here to help.</p>
				<button
					onClick={() =>
						window.location.href = "mailto:support@cssupport.com"
					}
					className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 cursor-pointer"
				>
					Contact Support
				</button>
			</div>
		</div>
	);
}
