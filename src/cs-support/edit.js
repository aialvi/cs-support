/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from "@wordpress/i18n";

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import {
	useBlockProps,
	InspectorControls,
	PanelColorSettings,
	RichText,
	__experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
	__experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients,
} from "@wordpress/block-editor";

import {
	PanelBody,
	TextControl,
	ToggleControl,
	SelectControl,
	__experimentalUnitControl as UnitControl,
} from "@wordpress/components";

import { useSelect } from "@wordpress/data";

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import "./editor.scss";

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit({ attributes, setAttributes }) {
	const {
		title,
		showTitle,
		submitButtonText,
		successMessage,
		errorMessage,
		backgroundColor,
		textColor,
		buttonColor,
		buttonTextColor,
		formWidth,
		maxWidth,
		padding,
		borderWidth,
		borderColor,
		borderRadius,
		boxShadow,
		boxShadowColor,
		inputBorderColor,
		inputBorderRadius,
		buttonBorderRadius,
		buttonPadding,
		buttonAlign,
		buttonFullWidth,
		redirectPage,
	} = attributes;

	const blockProps = useBlockProps();
	const colorSettings = useMultipleOriginColorsAndGradients();

	// Get all pages for the redirect dropdown
	const pages = useSelect((select) => {
		return select('core').getEntityRecords('postType', 'page');
	}, []);

	// Form style for preview
	const formStyle = {
		display: "block",
		backgroundColor,
		color: textColor,
		cursor: "pointer",
		padding,
		borderRadius,
		width: formWidth,
		maxWidth,
		marginTop: "10px",
		borderWidth,
		borderColor,
		borderStyle: borderWidth === "0px" ? "none" : "solid",
		boxShadow: boxShadow ? `0 4px 8px ${boxShadowColor}` : "none",
	};

	// Input style for preview
	const inputStyle = {
		borderColor: inputBorderColor,
		borderRadius: inputBorderRadius,
	};

	// Button style for preview
	const buttonStyle = {
		backgroundColor: buttonColor,
		color: buttonTextColor,
		border: "none",
		padding: buttonPadding,
		borderRadius: buttonBorderRadius,
		cursor: "pointer",
		marginTop: "10px",
		width: buttonFullWidth ? "100%" : "auto",
		display: "block",
		marginLeft:
			buttonAlign === "center"
				? "auto"
				: buttonAlign === "right"
				? "auto"
				: "0",
		marginRight:
			buttonAlign === "center" ? "auto" : buttonAlign === "left" ? "auto" : "0",
	};

	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody title={__("Form Content", "clientsync-support")} initialOpen={true}>
					<ToggleControl
						label={__("Show Title", "clientsync-support")}
						checked={showTitle}
						onChange={(value) => setAttributes({ showTitle: value })}
					/>
					<TextControl
						label={__("Form Title", "clientsync-support")}
						value={title}
						onChange={(value) => setAttributes({ title: value })}
					/>
					<TextControl
						label={__("Submit Button Text", "clientsync-support")}
						value={submitButtonText}
						onChange={(value) => setAttributes({ submitButtonText: value })}
					/>
					<TextControl
						label={__("Success Message", "clientsync-support")}
						value={successMessage}
						onChange={(value) => setAttributes({ successMessage: value })}
					/>
					<TextControl
						label={__("Error Message", "clientsync-support")}
						value={errorMessage}
						onChange={(value) => setAttributes({ errorMessage: value })}
					/>
				</PanelBody>

				<PanelBody title={__("Behavior", "clientsync-support")} initialOpen={false}>
					<SelectControl
						label={__("Redirect Page After Ticket Creation", "clientsync-support")}
						value={redirectPage}
						options={[
							{ label: __("No redirect (stay on current page)", "clientsync-support"), value: "" },
							...(pages || []).map((page) => ({
								label: page.title.rendered,
								value: page.id.toString(),
							})),
						]}
						onChange={(value) => setAttributes({ redirectPage: value })}
						help={__("Select a page where users will be redirected after creating a ticket. This page should contain the cs-support-frontend block to display their tickets.", "clientsync-support")}
					/>
				</PanelBody>

				<PanelBody title={__("Form Layout", "clientsync-support")} initialOpen={false}>
					<UnitControl
						label={__("Form Width", "clientsync-support")}
						value={formWidth}
						onChange={(value) => setAttributes({ formWidth: value })}
						units={[
							{ value: "px", label: "px" },
							{ value: "%", label: "%" },
							{ value: "em", label: "em" },
							{ value: "rem", label: "rem" },
						]}
					/>
					<UnitControl
						label={__("Maximum Width", "clientsync-support")}
						value={maxWidth}
						onChange={(value) => setAttributes({ maxWidth: value })}
						units={[
							{ value: "px", label: "px" },
							{ value: "%", label: "%" },
							{ value: "em", label: "em" },
							{ value: "rem", label: "rem" },
						]}
					/>
					<UnitControl
						label={__("Padding", "clientsync-support")}
						value={padding}
						onChange={(value) => setAttributes({ padding: value })}
						units={[
							{ value: "px", label: "px" },
							{ value: "em", label: "em" },
							{ value: "rem", label: "rem" },
						]}
					/>
				</PanelBody>

				<PanelBody title={__("Form Border", "clientsync-support")} initialOpen={false}>
					<UnitControl
						label={__("Border Width", "clientsync-support")}
						value={borderWidth}
						onChange={(value) => setAttributes({ borderWidth: value })}
						units={[
							{ value: "px", label: "px" },
							{ value: "em", label: "em" },
							{ value: "rem", label: "rem" },
						]}
					/>
					<UnitControl
						label={__("Border Radius", "clientsync-support")}
						value={borderRadius}
						onChange={(value) => setAttributes({ borderRadius: value })}
						units={[
							{ value: "px", label: "px" },
							{ value: "em", label: "em" },
							{ value: "rem", label: "rem" },
							{ value: "%", label: "%" },
						]}
					/>

					<PanelColorSettings
						title={__("Border Color", "clientsync-support")}
						initialOpen={false}
						colorSettings={[
							{
								value: borderColor,
								onChange: (value) => setAttributes({ borderColor: value }),
								label: __("Border Color", "clientsync-support"),
								disableCustomColors: false,
								clearable: true,
							},
						]}
						colorPalette={colorSettings}
					/>

					<ToggleControl
						label={__("Box Shadow", "clientsync-support")}
						checked={boxShadow}
						onChange={(value) => setAttributes({ boxShadow: value })}
					/>

					{boxShadow && (
						<PanelColorSettings
							title={__("Shadow Color", "clientsync-support")}
							initialOpen={false}
							colorSettings={[
								{
									value: boxShadowColor,
									onChange: (value) => setAttributes({ boxShadowColor: value }),
									label: __("Shadow Color", "clientsync-support"),
									disableCustomColors: false,
									clearable: true,
								},
							]}
							colorPalette={colorSettings}
						/>
					)}
				</PanelBody>

				<PanelBody title={__("Input Fields", "clientsync-support")} initialOpen={false}>
					<UnitControl
						label={__("Input Border Radius", "clientsync-support")}
						value={inputBorderRadius}
						onChange={(value) => setAttributes({ inputBorderRadius: value })}
						units={[
							{ value: "px", label: "px" },
							{ value: "%", label: "%" },
							{ value: "em", label: "em" },
							{ value: "rem", label: "rem" },
						]}
					/>

					<PanelColorSettings
						title={__("Input Border Color", "clientsync-support")}
						initialOpen={false}
						colorSettings={[
							{
								value: inputBorderColor,
								onChange: (value) => setAttributes({ inputBorderColor: value }),
								label: __("Input Border Color", "clientsync-support"),
								disableCustomColors: false,
								clearable: true,
							},
						]}
						colorPalette={colorSettings}
					/>
				</PanelBody>

				<PanelBody
					title={__("Button Styling", "clientsync-support")}
					initialOpen={false}
				>
					<SelectControl
						label={__("Button Alignment", "clientsync-support")}
						value={buttonAlign}
						options={[
							{ label: __("Left", "clientsync-support"), value: "left" },
							{ label: __("Center", "clientsync-support"), value: "center" },
							{ label: __("Right", "clientsync-support"), value: "right" },
						]}
						onChange={(value) => setAttributes({ buttonAlign: value })}
					/>

					<ToggleControl
						label={__("Full Width Button", "clientsync-support")}
						checked={buttonFullWidth}
						onChange={(value) => setAttributes({ buttonFullWidth: value })}
					/>
					<UnitControl
						label={__("Button Border Radius", "clientsync-support")}
						value={buttonBorderRadius}
						onChange={(value) => setAttributes({ buttonBorderRadius: value })}
						units={[
							{ value: "px", label: "px" },
							{ value: "%", label: "%" },
							{ value: "em", label: "em" },
							{ value: "rem", label: "rem" },
						]}
					/>

					<TextControl
						label={__("Button Padding", "clientsync-support")}
						value={buttonPadding}
						onChange={(value) => setAttributes({ buttonPadding: value })}
						help={__(
							"Format: vertical horizontal (e.g. 10px 15px)",
							"clientsync-support",
						)}
					/>
				</PanelBody>

				<PanelColorSettings
					title={__("Color Settings", "clientsync-support")}
					initialOpen={false}
					colorSettings={[
						{
							value: backgroundColor,
							onChange: (value) => setAttributes({ backgroundColor: value }),
							label: __("Background Color", "clientsync-support"),
							disableCustomColors: false,
							clearable: true,
						},
						{
							value: textColor,
							onChange: (value) => setAttributes({ textColor: value }),
							label: __("Text Color", "clientsync-support"),
							disableCustomColors: false,
							clearable: true,
						},
						{
							value: buttonColor,
							onChange: (value) => setAttributes({ buttonColor: value }),
							label: __("Button Color", "clientsync-support"),
							disableCustomColors: false,
							clearable: true,
						},
						{
							value: buttonTextColor,
							onChange: (value) => setAttributes({ buttonTextColor: value }),
							label: __("Button Text Color", "clientsync-support"),
							disableCustomColors: false,
							clearable: true,
						},
					]}
					colorPalette={colorSettings}
				/>
			</InspectorControls>

			<div className="cs-support-form-preview" style={formStyle}>
				{showTitle && (
					<RichText
						tagName="h2"
						value={title}
						onChange={(value) => setAttributes({ title: value })}
						placeholder={__("Form Title", "clientsync-support")}
						style={{ marginBottom: "20px" }}
					/>
				)}

				<div className="cs-form-field">
					<label htmlFor="cs-subject">{__("Subject", "clientsync-support")}</label>
					<input
						type="text"
						id="cs-subject"
						placeholder={__("Enter subject", "clientsync-support")}
						disabled
						style={inputStyle}
					/>
				</div>

				<div className="cs-form-field">
					<label htmlFor="cs-category">{__("Category", "clientsync-support")}</label>
					<select id="cs-category" disabled style={inputStyle}>
						<option>{__("Select a category", "clientsync-support")}</option>
						<option>{__("Technical", "clientsync-support")}</option>
						<option>{__("Billing", "clientsync-support")}</option>
						<option>{__("General", "clientsync-support")}</option>
					</select>
				</div>

				<div className="cs-form-field">
					<label htmlFor="cs-priority">{__("Priority", "clientsync-support")}</label>
					<select id="cs-priority" disabled style={inputStyle}>
						<option>{__("Low", "clientsync-support")}</option>
						<option>{__("Normal", "clientsync-support")}</option>
						<option>{__("High", "clientsync-support")}</option>
						<option>{__("Urgent", "clientsync-support")}</option>
					</select>
				</div>

				<div className="cs-form-field">
					<label htmlFor="cs-description">
						{__("Description", "clientsync-support")}
					</label>
					<textarea
						id="cs-description"
						rows="4"
						placeholder={__("Describe your issue", "clientsync-support")}
						disabled
						style={inputStyle}
					></textarea>
				</div>

				<button style={buttonStyle}>{submitButtonText}</button>

				<div className="cs-support-note">
					<p>
						<em>
							{__(
								"This is a preview. The form will be functional on the frontend.",
								"clientsync-support",
							)}
						</em>
					</p>
				</div>
			</div>
		</div>
	);
}
