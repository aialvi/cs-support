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
	TextareaControl,
	__experimentalDivider as Divider,
	__experimentalText as Text,
	Card,
	CardBody,
	__experimentalHeading as Heading,
	Notice,
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
		tableStriped,
		tableBordered,
		showSearch,
		showFilters,
		enableSorting,
		compactView,
		primaryColor,
		secondaryColor,
		successColor,
		warningColor,
		errorColor,
		customCSS,
		fontSize,
		spacing,
		maxWidth,
	} = attributes;

	const blockProps = useBlockProps();

	// Preview styles
	const getFontSizeValue = (size) => {
		const sizes = { small: '14px', medium: '16px', large: '18px', 'x-large': '20px' };
		return sizes[size] || '16px';
	};

	const getSpacingValue = (spacing) => {
		const spacings = { tight: '12px', normal: '20px', loose: '32px' };
		return spacings[spacing] || '20px';
	};

	const containerStyle = {
		backgroundColor,
		color: textColor,
		padding: getSpacingValue(spacing),
		borderRadius: `${borderRadius}px`,
		boxShadow: boxShadow ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
		transition: 'all 0.2s ease',
		fontSize: getFontSizeValue(fontSize),
		maxWidth: maxWidth !== 'none' ? maxWidth : 'unset',
		margin: maxWidth !== 'none' ? '0 auto' : 'unset',
	};
	
	const tableHeaderStyle = {
		backgroundColor: accentColor,
		color: "#ffffff",
	};

	const tableStyle = {
		border: tableBordered ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
	};

	const rowStyle = compactView ? { padding: '8px 12px' } : { padding: '12px 16px' };

	return (
		<div {...blockProps}>
			<InspectorControls>
				{/* Basic Settings */}
				<PanelBody title={__("Basic Settings", "cs-support")} initialOpen={true}>
					<RangeControl
						label={__("Tickets Per Page", "cs-support")}
						value={ticketsPerPage}
						onChange={(value) => setAttributes({ ticketsPerPage: value })}
						min={1}
						max={50}
						help={__("Number of tickets to display per page", "cs-support")}
					/>
					
					<SelectControl
						label={__("Font Size", "cs-support")}
						value={fontSize}
						options={[
							{ label: __("Small", "cs-support"), value: "small" },
							{ label: __("Medium", "cs-support"), value: "medium" },
							{ label: __("Large", "cs-support"), value: "large" },
							{ label: __("Extra Large", "cs-support"), value: "x-large" },
						]}
						onChange={(value) => setAttributes({ fontSize: value })}
					/>

					<SelectControl
						label={__("Spacing", "cs-support")}
						value={spacing}
						options={[
							{ label: __("Tight", "cs-support"), value: "tight" },
							{ label: __("Normal", "cs-support"), value: "normal" },
							{ label: __("Loose", "cs-support"), value: "loose" },
						]}
						onChange={(value) => setAttributes({ spacing: value })}
					/>

					<SelectControl
						label={__("Max Width", "cs-support")}
						value={maxWidth}
						options={[
							{ label: __("None", "cs-support"), value: "none" },
							{ label: __("Small (600px)", "cs-support"), value: "600px" },
							{ label: __("Medium (800px)", "cs-support"), value: "800px" },
							{ label: __("Large (1200px)", "cs-support"), value: "1200px" },
						]}
						onChange={(value) => setAttributes({ maxWidth: value })}
						help={__("Maximum width of the support ticket container", "cs-support")}
					/>
				</PanelBody>

				{/* Layout & Display */}
				<PanelBody title={__("Layout & Display", "cs-support")} initialOpen={false}>
					<SelectControl
						label={__("Card Style", "cs-support")}
						value={cardStyle}
						options={[
							{ label: __("Default", "cs-support"), value: "default" },
							{ label: __("Modern", "cs-support"), value: "modern" },
							{ label: __("Minimal", "cs-support"), value: "minimal" },
						]}
						onChange={(value) => setAttributes({ cardStyle: value })}
						help={__("Overall visual style of the support interface", "cs-support")}
					/>

					<Divider />

					<ToggleControl
						label={__("Compact View", "cs-support")}
						checked={compactView}
						onChange={(value) => setAttributes({ compactView: value })}
						help={__("Use tighter spacing for a more compact layout", "cs-support")}
					/>

					<ToggleControl
						label={__("Show Search Bar", "cs-support")}
						checked={showSearch}
						onChange={(value) => setAttributes({ showSearch: value })}
						help={__("Allow users to search through their tickets", "cs-support")}
					/>

					<ToggleControl
						label={__("Show Status Filters", "cs-support")}
						checked={showFilters}
						onChange={(value) => setAttributes({ showFilters: value })}
						help={__("Display filter buttons for ticket status", "cs-support")}
					/>

					<ToggleControl
						label={__("Enable Column Sorting", "cs-support")}
						checked={enableSorting}
						onChange={(value) => setAttributes({ enableSorting: value })}
						help={__("Allow users to sort tickets by clicking column headers", "cs-support")}
					/>
				</PanelBody>

				{/* Table Settings */}
				<PanelBody title={__("Table Settings", "cs-support")} initialOpen={false}>
					<ToggleControl
						label={__("Striped Rows", "cs-support")}
						checked={tableStriped}
						onChange={(value) => setAttributes({ tableStriped: value })}
						help={__("Alternate row background colors for better readability", "cs-support")}
					/>

					<ToggleControl
						label={__("Table Borders", "cs-support")}
						checked={tableBordered}
						onChange={(value) => setAttributes({ tableBordered: value })}
						help={__("Add borders around table cells", "cs-support")}
					/>

					<ToggleControl
						label={__("Row Hover Effect", "cs-support")}
						checked={rowHoverEffect}
						onChange={(value) => setAttributes({ rowHoverEffect: value })}
						help={__("Highlight table rows on hover", "cs-support")}
					/>
				</PanelBody>

				{/* Visual Effects */}
				<PanelBody title={__("Visual Effects", "cs-support")} initialOpen={false}>
					<RangeControl
						label={__("Border Radius", "cs-support")}
						value={borderRadius}
						onChange={(value) => setAttributes({ borderRadius: value })}
						min={0}
						max={24}
						help={__("Roundness of corners in pixels", "cs-support")}
					/>

					<ToggleControl
						label={__("Enable Box Shadow", "cs-support")}
						checked={boxShadow}
						onChange={(value) => setAttributes({ boxShadow: value })}
						help={__("Add subtle shadow for depth", "cs-support")}
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
						help={__("Style for buttons and interactive elements", "cs-support")}
					/>
				</PanelBody>

				{/* Color Settings */}
				<PanelColorSettings
					title={__("Primary Colors", "cs-support")}
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
						{
							value: primaryColor,
							onChange: (value) => setAttributes({ primaryColor: value }),
							label: __("Primary Color", "cs-support"),
						},
					]}
				/>

				<PanelColorSettings
					title={__("Status Colors", "cs-support")}
					initialOpen={false}
					colorSettings={[
						{
							value: successColor,
							onChange: (value) => setAttributes({ successColor: value }),
							label: __("Success Color (Resolved)", "cs-support"),
						},
						{
							value: warningColor,
							onChange: (value) => setAttributes({ warningColor: value }),
							label: __("Warning Color (In Progress)", "cs-support"),
						},
						{
							value: errorColor,
							onChange: (value) => setAttributes({ errorColor: value }),
							label: __("Error Color (New/Open)", "cs-support"),
						},
						{
							value: secondaryColor,
							onChange: (value) => setAttributes({ secondaryColor: value }),
							label: __("Secondary Color", "cs-support"),
						},
					]}
				/>

				{/* Advanced Settings */}
				<PanelBody title={__("Advanced", "cs-support")} initialOpen={false}>
					<Text variant="muted" style={{ marginBottom: '16px' }}>
						{__("Add custom CSS to override default styles. Use carefully!", "cs-support")}
					</Text>
					
					<TextareaControl
						label={__("Custom CSS", "cs-support")}
						value={customCSS}
						onChange={(value) => setAttributes({ customCSS: value })}
						placeholder={__("/* Custom CSS rules */\n.cs-support-frontend {\n  /* Your styles here */\n}", "cs-support")}
						rows={8}
						help={__("Advanced users can add custom CSS here", "cs-support")}
					/>

					{customCSS && (
						<Notice status="warning" isDismissible={false}>
							{__("Custom CSS is active. Preview may not reflect all changes until saved.", "cs-support")}
						</Notice>
					)}
				</PanelBody>
			</InspectorControls>

			<div className="cs-support-frontend-preview" style={containerStyle}>
				{/* Custom CSS Style Tag */}
				{customCSS && (
					<style dangerouslySetInnerHTML={{ __html: customCSS }} />
				)}

				<RichText
					tagName="h2"
					value={title}
					onChange={(value) => setAttributes({ title: value })}
					placeholder={__("Block Title", "cs-support")}
					className="cs-support-frontend-title"
				/>
				
				{/* Search and Filters Preview */}
				{(showSearch || showFilters) && (
					<div className="cs-support-controls" style={{ marginBottom: getSpacingValue(spacing) }}>
						{showSearch && (
							<input 
								type="search" 
								placeholder={__("Search tickets...", "cs-support")}
								style={{
									padding: '8px 12px',
									borderRadius: `${borderRadius}px`,
									border: '1px solid rgba(0, 0, 0, 0.2)',
									marginRight: '12px',
									fontSize: getFontSizeValue(fontSize),
								}}
								disabled
							/>
						)}
						{showFilters && (
							<div style={{ display: 'inline-flex', gap: '8px' }}>
								<button style={{
									padding: compactView ? '4px 8px' : '6px 12px',
									fontSize: getFontSizeValue(fontSize),
									backgroundColor: primaryColor,
									color: 'white',
									border: 'none',
									borderRadius: `${borderRadius}px`,
								}} disabled>
									{__("All", "cs-support")}
								</button>
								<button style={{
									padding: compactView ? '4px 8px' : '6px 12px',
									fontSize: getFontSizeValue(fontSize),
									backgroundColor: 'transparent',
									color: textColor,
									border: `1px solid ${primaryColor}`,
									borderRadius: `${borderRadius}px`,
								}} disabled>
									{__("Open", "cs-support")}
								</button>
							</div>
						)}
					</div>
				)}
				
				<div className="cs-support-frontend-content">
					<div className="cs-support-tickets-preview">
						<table className="cs-support-tickets-table" style={tableStyle}>
							<thead>
								<tr style={tableHeaderStyle}>
									<th style={rowStyle}>
										{enableSorting ? (
											<span style={{ cursor: 'pointer' }}>
												{__("Ticket ID", "cs-support")} ↕
											</span>
										) : (
											__("Ticket ID", "cs-support")
										)}
									</th>
									<th style={rowStyle}>
										{enableSorting ? (
											<span style={{ cursor: 'pointer' }}>
												{__("Subject", "cs-support")} ↕
											</span>
										) : (
											__("Subject", "cs-support")
										)}
									</th>
									<th style={rowStyle}>
										{enableSorting ? (
											<span style={{ cursor: 'pointer' }}>
												{__("Status", "cs-support")} ↕
											</span>
										) : (
											__("Status", "cs-support")
										)}
									</th>
									<th style={rowStyle}>
										{enableSorting ? (
											<span style={{ cursor: 'pointer' }}>
												{__("Date", "cs-support")} ↕
											</span>
										) : (
											__("Date", "cs-support")
										)}
									</th>
								</tr>
							</thead>
							<tbody>
								<tr style={{
									...rowStyle,
									backgroundColor: tableStriped ? secondaryColor : 'transparent'
								}}>
									<td style={rowStyle}>#001</td>
									<td style={rowStyle}>{__("Example Support Ticket", "cs-support")}</td>
									<td style={rowStyle}>
										<span style={{
											backgroundColor: errorColor,
											color: 'white',
											padding: '2px 8px',
											borderRadius: '12px',
											fontSize: '0.8em'
										}}>
											{__("Open", "cs-support")}
										</span>
									</td>
									<td style={rowStyle}>{__("2025-07-11", "cs-support")}</td>
								</tr>
								<tr style={rowStyle}>
									<td style={rowStyle}>#002</td>
									<td style={rowStyle}>{__("Another Example Ticket", "cs-support")}</td>
									<td style={rowStyle}>
										<span style={{
											backgroundColor: successColor,
											color: 'white',
											padding: '2px 8px',
											borderRadius: '12px',
											fontSize: '0.8em'
										}}>
											{__("Resolved", "cs-support")}
										</span>
									</td>
									<td style={rowStyle}>{__("2025-07-10", "cs-support")}</td>
								</tr>
								<tr style={{
									...rowStyle,
									backgroundColor: tableStriped ? secondaryColor : 'transparent'
								}}>
									<td style={rowStyle}>#003</td>
									<td style={rowStyle}>{__("In Progress Example", "cs-support")}</td>
									<td style={rowStyle}>
										<span style={{
											backgroundColor: warningColor,
											color: 'white',
											padding: '2px 8px',
											borderRadius: '12px',
											fontSize: '0.8em'
										}}>
											{__("In Progress", "cs-support")}
										</span>
									</td>
									<td style={rowStyle}>{__("2025-07-09", "cs-support")}</td>
								</tr>
							</tbody>
						</table>
						
						<p className="cs-support-placeholder-text" style={{
							textAlign: 'center',
							color: 'rgba(0, 0, 0, 0.6)',
							fontStyle: 'italic',
							marginTop: getSpacingValue(spacing),
							fontSize: getFontSizeValue(fontSize)
						}}>
							{__("✨ This is a preview. Actual tickets will appear here on the frontend.", "cs-support")}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
