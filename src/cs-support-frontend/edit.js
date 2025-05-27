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
} from "@wordpress/block-editor";

import {
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	__experimentalDivider as Divider,
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
		ticketsPerPage,
		backgroundColor,
		textColor,
		accentColor,
		borderRadius,
		boxShadow,
		rowHoverEffect,
		buttonStyle,
		cardStyle,
	} = attributes;

	const blockProps = useBlockProps();

	// Preview styles
	const containerStyle = {
		backgroundColor,
		color: textColor,
		padding: "20px",
		borderRadius: `${borderRadius}px`,
		boxShadow: boxShadow ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
		transition: 'all 0.2s ease',
	};
	
	const tableHeaderStyle = {
		backgroundColor: accentColor,
		color: "#ffffff",
	};

	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody title={__("Display Settings", "cs-support")} initialOpen={true}>
					<RangeControl
						label={__("Tickets Per Page", "cs-support")}
						value={ticketsPerPage}
						onChange={(value) => setAttributes({ ticketsPerPage: value })}
						min={1}
						max={50}
					/>
					<SelectControl
						label={__("Card Style", "cs-support")}
						value={cardStyle}
						options={[
							{ label: __("Default", "cs-support"), value: "default" },
							{ label: __("Modern", "cs-support"), value: "modern" },
							{ label: __("Minimal", "cs-support"), value: "minimal" },
						]}
						onChange={(value) => setAttributes({ cardStyle: value })}
					/>
				</PanelBody>

				<PanelBody title={__("Appearance", "cs-support")} initialOpen={false}>
					<RangeControl
						label={__("Border Radius", "cs-support")}
						value={borderRadius}
						onChange={(value) => setAttributes({ borderRadius: value })}
						min={0}
						max={24}
					/>

					<ToggleControl
						label={__("Enable Box Shadow", "cs-support")}
						checked={boxShadow}
						onChange={(value) => setAttributes({ boxShadow: value })}
					/>

					<ToggleControl
						label={__("Row Hover Effect", "cs-support")}
						checked={rowHoverEffect}
						onChange={(value) => setAttributes({ rowHoverEffect: value })}
					/>

					<Divider />

					<SelectControl
						label={__("Button Style", "cs-support")}
						value={buttonStyle}
						options={[
							{ label: __("Rounded", "cs-support"), value: "rounded" },
							{ label: __("Square", "cs-support"), value: "square" },
							{ label: __("Pill", "cs-support"), value: "pill" },
							{ label: __("Outlined", "cs-support"), value: "outlined" },
						]}
						onChange={(value) => setAttributes({ buttonStyle: value })}
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
						},
						{
							value: textColor,
							onChange: (value) => setAttributes({ textColor: value }),
							label: __("Text Color", "cs-support"),
						},
						{
							value: accentColor,
							onChange: (value) => setAttributes({ accentColor: value }),
							label: __("Accent Color", "cs-support"),
						},
					]}
				/>
			</InspectorControls>

			<div className="cs-support-frontend-preview" style={containerStyle}>
				<RichText
					tagName="h2"
					value={title}
					onChange={(value) => setAttributes({ title: value })}
					placeholder={__("Block Title", "cs-support")}
					className="cs-support-frontend-title"
				/>
				
				<div className="cs-support-frontend-content">
					<div className="cs-support-tickets-preview">
						<table className="cs-support-tickets-table">
							<thead>
								<tr style={tableHeaderStyle}>
									<th>{__("Ticket ID", "cs-support")}</th>
									<th>{__("Subject", "cs-support")}</th>
									<th>{__("Status", "cs-support")}</th>
									<th>{__("Date", "cs-support")}</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>1</td>
									<td>{__("Example Support Ticket", "cs-support")}</td>
									<td>{__("Open", "cs-support")}</td>
									<td>{__("2025-04-21", "cs-support")}</td>
								</tr>
								<tr>
									<td>2</td>
									<td>{__("Another Example Ticket", "cs-support")}</td>
									<td>{__("Resolved", "cs-support")}</td>
									<td>{__("2025-04-20", "cs-support")}</td>
								</tr>
							</tbody>
						</table>
						<p className="cs-support-placeholder-text">
							{__("This is a preview. Actual tickets will appear here on the frontend.", "cs-support")}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
