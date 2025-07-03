/**
 * Frontend script for the CS Support ticket form
 */
document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("cs-support-form");
	if (!form) return;

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		// Get form elements
		const submitButton = form.querySelector(".cs-form-submit");
		const messageContainer = form.querySelector(".cs-form-message");
		const successMessage =
			submitButton.dataset.successMessage || "Ticket created successfully!";
		const errorMessage =
			submitButton.dataset.errorMessage ||
			"Failed to create ticket. Please try again.";

		// Get form data
		const subject = form.querySelector("#cs-subject").value;
		const category = form.querySelector("#cs-category").value;
		const priority = form.querySelector("#cs-priority").value;
		const description = form.querySelector("#cs-description").value;
        const status = "NEW";

		// Validate form
		if (!subject || !category || !description) {
			showMessage("Please fill in all required fields.", "error");
			return;
		}

		// Disable form while submitting
		submitButton.disabled = true;
		submitButton.innerText = "Creating...";

		try {
			const response = await fetch("/wp-json/cs-support/v1/tickets", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-WP-Nonce": wpApiSettings.nonce,
				},
				body: JSON.stringify({
					subject,
					category,
					priority,
					description,
                    status,
				}),
			});

			const data = await response.json();

			if (data.success) {
				showMessage(successMessage, "success");
				form.reset();
				
				// Check for block-level redirect override first, then global setting
				const blockRedirectUrl = form.dataset.redirectUrl;
				const redirectUrl = blockRedirectUrl || data.redirect_url;
				
				// Handle redirect if specified
				if (redirectUrl) {
					// Add a delay to show the success message briefly before redirecting
					setTimeout(() => {
						window.location.href = redirectUrl;
					}, 1500);
				}
			} else {
				showMessage(errorMessage, "error");
			}
		} catch (error) {
			console.error("Error creating ticket:", error);
			showMessage(
				"An unexpected error occurred. Please try again later.",
				"error",
			);
		} finally {
			submitButton.disabled = false;
			submitButton.innerText = submitButton.innerText.replace(
				"Creating...",
				"Create Ticket",
			);
		}
	});

	function showMessage(text, type) {
		const messageContainer = form.querySelector(".cs-form-message");
		messageContainer.innerText = text;
		messageContainer.className = "cs-form-message " + type;
		messageContainer.style.display = "block";

		// Scroll to the message
		messageContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
	}
});
