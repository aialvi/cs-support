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
				<PanelBody title={__("Basic Settings", "clientsync-support")} initialOpen={true}>
					<RangeControl
						label={__("Tickets Per Page", "clientsync-support")}
						value={ticketsPerPage}
						onChange={(value) => setAttributes({ ticketsPerPage: value })}
						min={1}
						max={50}
						help={__("Number of tickets to display per page", "clientsync-support")}
					/>
					
					<SelectControl
						label={__("Font Size", "clientsync-support")}
						value={fontSize}
						options={[
							{ label: __("Small", "clientsync-support"), value: "small" },
							{ label: __("Medium", "clientsync-support"), value: "medium" },
							{ label: __("Large", "clientsync-support"), value: "large" },
							{ label: __("Extra Large", "clientsync-support"), value: "x-large" },
						]}
						onChange={(value) => setAttributes({ fontSize: value })}
					/>

					<SelectControl
						label={__("Spacing", "clientsync-support")}
						value={spacing}
						options={[
							{ label: __("Tight", "clientsync-support"), value: "tight" },
							{ label: __("Normal", "clientsync-support"), value: "normal" },
							{ label: __("Loose", "clientsync-support"), value: "loose" },
						]}
						onChange={(value) => setAttributes({ spacing: value })}
					/>

					<SelectControl
						label={__("Max Width", "clientsync-support")}
						value={maxWidth}
						options={[
							{ label: __("None", "clientsync-support"), value: "none" },
							{ label: __("Small (600px)", "clientsync-support"), value: "600px" },
							{ label: __("Medium (800px)", "clientsync-support"), value: "800px" },
							{ label: __("Large (1200px)", "clientsync-support"), value: "1200px" },
						]}
						onChange={(value) => setAttributes({ maxWidth: value })}
						help={__("Maximum width of the support ticket container", "clientsync-support")}
					/>
				</PanelBody>

				{/* Layout & Display */}
				<PanelBody title={__("Layout & Display", "clientsync-support")} initialOpen={false}>
					<SelectControl
						label={__("Card Style", "clientsync-support")}
						value={cardStyle}
						options={[
							{ label: __("Default", "clientsync-support"), value: "default" },
							{ label: __("Modern", "clientsync-support"), value: "modern" },
							{ label: __("Minimal", "clientsync-support"), value: "minimal" },
						]}
						onChange={(value) => setAttributes({ cardStyle: value })}
						help={__("Overall visual style of the support interface", "clientsync-support")}
					/>

					<Divider />

					<ToggleControl
						label={__("Compact View", "clientsync-support")}
						checked={compactView}
						onChange={(value) => setAttributes({ compactView: value })}
						help={__("Use tighter spacing for a more compact layout", "clientsync-support")}
					/>

					<ToggleControl
						label={__("Show Search Bar", "clientsync-support")}
						checked={showSearch}
						onChange={(value) => setAttributes({ showSearch: value })}
						help={__("Allow users to search through their tickets", "clientsync-support")}
					/>

					<ToggleControl
						label={__("Show Status Filters", "clientsync-support")}
						checked={showFilters}
						onChange={(value) => setAttributes({ showFilters: value })}
						help={__("Display filter buttons for ticket status", "clientsync-support")}
					/>

					<ToggleControl
						label={__("Enable Column Sorting", "clientsync-support")}
						checked={enableSorting}
						onChange={(value) => setAttributes({ enableSorting: value })}
						help={__("Allow users to sort tickets by clicking column headers", "clientsync-support")}
					/>
				</PanelBody>

				{/* Table Settings */}
				<PanelBody title={__("Table Settings", "clientsync-support")} initialOpen={false}>
					<ToggleControl
						label={__("Striped Rows", "clientsync-support")}
						checked={tableStriped}
						onChange={(value) => setAttributes({ tableStriped: value })}
						help={__("Alternate row background colors for better readability", "clientsync-support")}
					/>

					<ToggleControl
						label={__("Table Borders", "clientsync-support")}
						checked={tableBordered}
						onChange={(value) => setAttributes({ tableBordered: value })}
						help={__("Add borders around table cells", "clientsync-support")}
					/>

					<ToggleControl
						label={__("Row Hover Effect", "clientsync-support")}
						checked={rowHoverEffect}
						onChange={(value) => setAttributes({ rowHoverEffect: value })}
						help={__("Highlight table rows on hover", "clientsync-support")}
					/>
				</PanelBody>

				{/* Visual Effects */}
				<PanelBody title={__("Visual Effects", "clientsync-support")} initialOpen={false}>
					<RangeControl
						label={__("Border Radius", "clientsync-support")}
						value={borderRadius}
						onChange={(value) => setAttributes({ borderRadius: value })}
						min={0}
						max={24}
						help={__("Roundness of corners in pixels", "clientsync-support")}
					/>

					<ToggleControl
						label={__("Enable Box Shadow", "clientsync-support")}
						checked={boxShadow}
						onChange={(value) => setAttributes({ boxShadow: value })}
						help={__("Add subtle shadow for depth", "clientsync-support")}
					/>

					<Divider />

					<SelectControl
						label={__("Button Style", "clientsync-support")}
						value={buttonStyle}
						options={[
							{ label: __("Rounded", "clientsync-support"), value: "rounded" },
							{ label: __("Square", "clientsync-support"), value: "square" },
							{ label: __("Pill", "clientsync-support"), value: "pill" },
							{ label: __("Outlined", "clientsync-support"), value: "outlined" },
						]}
						onChange={(value) => setAttributes({ buttonStyle: value })}
						help={__("Style for buttons and interactive elements", "clientsync-support")}
					/>
				</PanelBody>

				{/* Color Settings */}
				<PanelColorSettings
					title={__("Primary Colors", "clientsync-support")}
					initialOpen={false}
					colorSettings={[
						{
							value: backgroundColor,
							onChange: (value) => setAttributes({ backgroundColor: value }),
							label: __("Background Color", "clientsync-support"),
						},
						{
							value: textColor,
							onChange: (value) => setAttributes({ textColor: value }),
							label: __("Text Color", "clientsync-support"),
						},
						{
							value: accentColor,
							onChange: (value) => setAttributes({ accentColor: value }),
							label: __("Accent Color", "clientsync-support"),
						},
						{
							value: primaryColor,
							onChange: (value) => setAttributes({ primaryColor: value }),
							label: __("Primary Color", "clientsync-support"),
						},
					]}
				/>

				<PanelColorSettings
					title={__("Status Colors", "clientsync-support")}
					initialOpen={false}
					colorSettings={[
						{
							value: successColor,
							onChange: (value) => setAttributes({ successColor: value }),
							label: __("Success Color (Resolved)", "clientsync-support"),
						},
						{
							value: warningColor,
							onChange: (value) => setAttributes({ warningColor: value }),
							label: __("Warning Color (In Progress)", "clientsync-support"),
						},
						{
							value: errorColor,
							onChange: (value) => setAttributes({ errorColor: value }),
							label: __("Error Color (New/Open)", "clientsync-support"),
						},
						{
							value: secondaryColor,
							onChange: (value) => setAttributes({ secondaryColor: value }),
							label: __("Secondary Color", "clientsync-support"),
						},
					]}
				/>

				{/* Advanced Settings */}
				<PanelBody title={__("Advanced", "clientsync-support")} initialOpen={false}>
					<Text variant="muted" style={{ marginBottom: '16px' }}>
						{__("Add custom CSS to override default styles. Use carefully!", "clientsync-support")}
					</Text>
					
					<TextareaControl
						label={__("Custom CSS", "clientsync-support")}
						value={customCSS}
						onChange={(value) => setAttributes({ customCSS: value })}
						placeholder={__("/* Custom CSS rules */\n.cs-support-frontend {\n  /* Your styles here */\n}", "clientsync-support")}
						rows={8}
						help={__("Advanced users can add custom CSS here", "clientsync-support")}
					/>

					{customCSS && (
						<Notice status="warning" isDismissible={false}>
							{__("Custom CSS is active. Preview may not reflect all changes until saved.", "clientsync-support")}
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
					placeholder={__("Block Title", "clientsync-support")}
					className="cs-support-frontend-title"
				/>
				
				{/* Search and Filters Preview */}
				{(showSearch || showFilters) && (
					<div className="cs-support-controls" style={{ marginBottom: getSpacingValue(spacing) }}>
						{showSearch && (
							<input 
								type="search" 
								placeholder={__("Search tickets...", "clientsync-support")}
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
									{__("All", "clientsync-support")}
								</button>
								<button style={{
									padding: compactView ? '4px 8px' : '6px 12px',
									fontSize: getFontSizeValue(fontSize),
									backgroundColor: 'transparent',
									color: textColor,
									border: `1px solid ${primaryColor}`,
									borderRadius: `${borderRadius}px`,
								}} disabled>
									{__("Open", "clientsync-support")}
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
												{__("Ticket ID", "clientsync-support")} ↕
											</span>
										) : (
											__("Ticket ID", "clientsync-support")
										)}
									</th>
									<th style={rowStyle}>
										{enableSorting ? (
											<span style={{ cursor: 'pointer' }}>
												{__("Subject", "clientsync-support")} ↕
											</span>
										) : (
											__("Subject", "clientsync-support")
										)}
									</th>
									<th style={rowStyle}>
										{enableSorting ? (
											<span style={{ cursor: 'pointer' }}>
												{__("Status", "clientsync-support")} ↕
											</span>
										) : (
											__("Status", "clientsync-support")
										)}
									</th>
									<th style={rowStyle}>
										{enableSorting ? (
											<span style={{ cursor: 'pointer' }}>
												{__("Date", "clientsync-support")} ↕
											</span>
										) : (
											__("Date", "clientsync-support")
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
									<td style={rowStyle}>{__("Example Support Ticket", "clientsync-support")}</td>
									<td style={rowStyle}>
										<span style={{
											backgroundColor: errorColor,
											color: 'white',
											padding: '2px 8px',
											borderRadius: '12px',
											fontSize: '0.8em'
										}}>
											{__("Open", "clientsync-support")}
										</span>
									</td>
									<td style={rowStyle}>{__("2025-07-11", "clientsync-support")}</td>
								</tr>
								<tr style={rowStyle}>
									<td style={rowStyle}>#002</td>
									<td style={rowStyle}>{__("Another Example Ticket", "clientsync-support")}</td>
									<td style={rowStyle}>
										<span style={{
											backgroundColor: successColor,
											color: 'white',
											padding: '2px 8px',
											borderRadius: '12px',
											fontSize: '0.8em'
										}}>
											{__("Resolved", "clientsync-support")}
										</span>
									</td>
									<td style={rowStyle}>{__("2025-07-10", "clientsync-support")}</td>
								</tr>
								<tr style={{
									...rowStyle,
									backgroundColor: tableStriped ? secondaryColor : 'transparent'
								}}>
									<td style={rowStyle}>#003</td>
									<td style={rowStyle}>{__("In Progress Example", "clientsync-support")}</td>
									<td style={rowStyle}>
										<span style={{
											backgroundColor: warningColor,
											color: 'white',
											padding: '2px 8px',
											borderRadius: '12px',
											fontSize: '0.8em'
										}}>
											{__("In Progress", "clientsync-support")}
										</span>
									</td>
									<td style={rowStyle}>{__("2025-07-09", "clientsync-support")}</td>
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
							{__("✨ This is a preview. Actual tickets will appear here on the frontend.", "clientsync-support")}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
