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
	} = attributes;

	const blockProps = useBlockProps();
	const colorSettings = useMultipleOriginColorsAndGradients();

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
		marginLeft:
			buttonAlign === "center"
				? "auto"
				: buttonAlign === "right"
				? "auto"
				: "0",
		marginRight:
			buttonAlign === "center" ? "auto" : buttonAlign === "left" ? "auto" : "0",
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
	};

	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody title={__("Form Content", "cs-support")} initialOpen={true}>
					<ToggleControl
						label={__("Show Title", "cs-support")}
						checked={showTitle}
						onChange={(value) => setAttributes({ showTitle: value })}
					/>
					<TextControl
						label={__("Form Title", "cs-support")}
						value={title}
						onChange={(value) => setAttributes({ title: value })}
					/>
					<TextControl
						label={__("Submit Button Text", "cs-support")}
						value={submitButtonText}
						onChange={(value) => setAttributes({ submitButtonText: value })}
					/>
					<TextControl
						label={__("Success Message", "cs-support")}
						value={successMessage}
						onChange={(value) => setAttributes({ successMessage: value })}
					/>
					<TextControl
						label={__("Error Message", "cs-support")}
						value={errorMessage}
						onChange={(value) => setAttributes({ errorMessage: value })}
					/>
				</PanelBody>

				<PanelBody title={__("Form Layout", "cs-support")} initialOpen={false}>
					<UnitControl
						label={__("Form Width", "cs-support")}
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
						label={__("Maximum Width", "cs-support")}
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
						label={__("Padding", "cs-support")}
						value={padding}
						onChange={(value) => setAttributes({ padding: value })}
						units={[
							{ value: "px", label: "px" },
							{ value: "em", label: "em" },
							{ value: "rem", label: "rem" },
						]}
					/>
				</PanelBody>

				<PanelBody title={__("Form Border", "cs-support")} initialOpen={false}>
					<UnitControl
						label={__("Border Width", "cs-support")}
						value={borderWidth}
						onChange={(value) => setAttributes({ borderWidth: value })}
						units={[
							{ value: "px", label: "px" },
							{ value: "em", label: "em" },
							{ value: "rem", label: "rem" },
						]}
					/>
					<UnitControl
						label={__("Border Radius", "cs-support")}
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
						title={__("Border Color", "cs-support")}
						initialOpen={false}
						colorSettings={[
							{
								value: borderColor,
								onChange: (value) => setAttributes({ borderColor: value }),
								label: __("Border Color", "cs-support"),
								disableCustomColors: false,
								clearable: true,
							},
						]}
						colorPalette={colorSettings}
					/>

					<ToggleControl
						label={__("Box Shadow", "cs-support")}
						checked={boxShadow}
						onChange={(value) => setAttributes({ boxShadow: value })}
					/>

					{boxShadow && (
						<PanelColorSettings
							title={__("Shadow Color", "cs-support")}
							initialOpen={false}
							colorSettings={[
								{
									value: boxShadowColor,
									onChange: (value) => setAttributes({ boxShadowColor: value }),
									label: __("Shadow Color", "cs-support"),
									disableCustomColors: false,
									clearable: true,
								},
							]}
							colorPalette={colorSettings}
						/>
					)}
				</PanelBody>

				<PanelBody title={__("Input Fields", "cs-support")} initialOpen={false}>
					<UnitControl
						label={__("Input Border Radius", "cs-support")}
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
						title={__("Input Border Color", "cs-support")}
						initialOpen={false}
						colorSettings={[
							{
								value: inputBorderColor,
								onChange: (value) => setAttributes({ inputBorderColor: value }),
								label: __("Input Border Color", "cs-support"),
								disableCustomColors: false,
								clearable: true,
							},
						]}
						colorPalette={colorSettings}
					/>
				</PanelBody>

				<PanelBody
					title={__("Button Styling", "cs-support")}
					initialOpen={false}
				>
					<SelectControl
						label={__("Button Alignment", "cs-support")}
						value={buttonAlign}
						options={[
							{ label: __("Left", "cs-support"), value: "left" },
							{ label: __("Center", "cs-support"), value: "center" },
							{ label: __("Right", "cs-support"), value: "right" },
						]}
						onChange={(value) => setAttributes({ buttonAlign: value })}
					/>

					<ToggleControl
						label={__("Full Width Button", "cs-support")}
						checked={buttonFullWidth}
						onChange={(value) => setAttributes({ buttonFullWidth: value })}
					/>
					<UnitControl
						label={__("Button Border Radius", "cs-support")}
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
						label={__("Button Padding", "cs-support")}
						value={buttonPadding}
						onChange={(value) => setAttributes({ buttonPadding: value })}
						help={__(
							"Format: vertical horizontal (e.g. 10px 15px)",
							"cs-support",
						)}
					/>
				</PanelBody>

				<PanelColorSettings
					title={__("Color Settings", "cs-support")}
					initialOpen={false}
					colorSettings={[
						{
							value: backgroundColor,
							onChange: (value) => setAttributes({ backgroundColor: value }),
							label: __("Background Color", "cs-support"),
							disableCustomColors: false,
							clearable: true,
						},
						{
							value: textColor,
							onChange: (value) => setAttributes({ textColor: value }),
							label: __("Text Color", "cs-support"),
							disableCustomColors: false,
							clearable: true,
						},
						{
							value: buttonColor,
							onChange: (value) => setAttributes({ buttonColor: value }),
							label: __("Button Color", "cs-support"),
							disableCustomColors: false,
							clearable: true,
						},
						{
							value: buttonTextColor,
							onChange: (value) => setAttributes({ buttonTextColor: value }),
							label: __("Button Text Color", "cs-support"),
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
						placeholder={__("Form Title", "cs-support")}
						style={{ marginBottom: "20px" }}
					/>
				)}

				<div className="cs-form-field">
					<label htmlFor="cs-subject">{__("Subject", "cs-support")}</label>
					<input
						type="text"
						id="cs-subject"
						placeholder={__("Enter subject", "cs-support")}
						disabled
						style={inputStyle}
					/>
				</div>

				<div className="cs-form-field">
					<label htmlFor="cs-category">{__("Category", "cs-support")}</label>
					<select id="cs-category" disabled style={inputStyle}>
						<option>{__("Select a category", "cs-support")}</option>
						<option>{__("Technical", "cs-support")}</option>
						<option>{__("Billing", "cs-support")}</option>
						<option>{__("General", "cs-support")}</option>
					</select>
				</div>

				<div className="cs-form-field">
					<label htmlFor="cs-priority">{__("Priority", "cs-support")}</label>
					<select id="cs-priority" disabled style={inputStyle}>
						<option>{__("Low", "cs-support")}</option>
						<option>{__("Normal", "cs-support")}</option>
						<option>{__("High", "cs-support")}</option>
						<option>{__("Urgent", "cs-support")}</option>
					</select>
				</div>

				<div className="cs-form-field">
					<label htmlFor="cs-description">
						{__("Description", "cs-support")}
					</label>
					<textarea
						id="cs-description"
						rows="4"
						placeholder={__("Describe your issue", "cs-support")}
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
								"cs-support",
							)}
						</em>
					</p>
				</div>
			</div>
		</div>
	);
}
