---
name: Geospatial Authority
colors:
  surface: '#f8f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#edeef0'
  surface-container-high: '#e7e8ea'
  surface-container-highest: '#e1e2e4'
  on-surface: '#191c1e'
  on-surface-variant: '#40493d'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f3'
  outline: '#707a6c'
  outline-variant: '#bfcaba'
  surface-tint: '#1b6d24'
  primary: '#0d631b'
  on-primary: '#ffffff'
  primary-container: '#2e7d32'
  on-primary-container: '#cbffc2'
  inverse-primary: '#88d982'
  secondary: '#3e6a00'
  on-secondary: '#ffffff'
  secondary-container: '#b9f474'
  on-secondary-container: '#437000'
  tertiary: '#6e5100'
  on-tertiary: '#ffffff'
  tertiary-container: '#8c6800'
  on-tertiary-container: '#ffefd7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a3f69c'
  primary-fixed-dim: '#88d982'
  on-primary-fixed: '#002204'
  on-primary-fixed-variant: '#005312'
  secondary-fixed: '#b9f474'
  secondary-fixed-dim: '#9ed75b'
  on-secondary-fixed: '#0f2000'
  on-secondary-fixed-variant: '#2e4f00'
  tertiary-fixed: '#ffdfa0'
  tertiary-fixed-dim: '#f6be39'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5c4300'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e1e2e4'
typography:
  page-title:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  section-title:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  card-title:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  text-secondary:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  button-label:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  panel-width: 360px
  map-margin: 12px
---

## Brand & Style

The design system is engineered for high-density, high-utility government GIS applications. It prioritizes data-first clarity, reliability, and long-form operational efficiency. The aesthetic is **Corporate Modern**, drawing inspiration from professional cartographic suites to ensure that the interface never competes with the map data itself.

The system targets professional analysts and government officials who require a stable, predictable environment for spatial decision-making. By utilizing a restrained color palette and a structured grid, the design system evokes an emotional response of trust, precision, and institutional authority.

- **Minimalist approach**: Functional whitespace is used to separate dense data controls.
- **Map-first philosophy**: UI elements are treated as overlays with distinct boundaries to maintain a clear mental model between the "canvas" (map) and "controls" (panels).
- **Reduced Eye Strain**: The interface avoids high-frequency patterns and aggressive gradients to support multi-hour working sessions.

## Colors

This design system utilizes a palette rooted in environmental and institutional tones. The **Forest Green primary** provides a grounded, authoritative foundation, while the **Harvest Gold** is reserved strictly for interactive accents, warnings, or highlighted spatial features.

- **Primary (#2E7D32)**: Used for primary actions, active navigation states, and brand reinforcement.
- **Secondary (#8BC34A)**: Used for subtle highlighting and secondary data categorizations.
- **Accent (#D4A017)**: Used sparingly for attention-driven elements such as notifications or specific map selection states.
- **Neutral Stack**: The background (#F7F8FA) and surface (#FFFFFF) are tightly coupled to provide a "sheet-based" hierarchy where the map resides at the lowest level and control panels sit clearly on top.

## Typography

The design system employs **Inter** for its exceptional legibility in data-dense environments and high x-height, which aids in reading coordinates and technical labels. 

- **Hierarchy**: Clear distinction between Page Titles and Section Titles is maintained through weight and scale.
- **Alignment**: All typography is left-aligned by default to maintain a strong vertical rhythm in sidebar panels.
- **Numerical Data**: For coordinates and attribute tables, use tabular figures (tnum) to ensure vertical alignment of digits.

## Layout & Spacing

This design system uses a strict **8px spacing grid**. Layouts are structured around a "Floating Panel" or "Sidebar" model to maximize the visible map area.

- **Main Layout**: A fixed-width sidebar (360px) for attribute management and layer controls, positioned typically on the left or right.
- **Map Canvas**: The primary container which occupies 100% of the viewport width and height, sitting behind UI overlays.
- **Gaps & Gutters**: Elements within panels should use 16px (md) internal padding. Elements on the map should maintain a 12px margin from the screen edges.
- **Responsiveness**: On mobile, the sidebar transitions to a bottom sheet that can be collapsed to reveal the map.

## Elevation & Depth

To maintain a "Data-First" professional aesthetic, this design system favors **Low-contrast outlines** over heavy shadows. This reduces visual "fuzziness" and reinforces the grid.

- **Base Level**: The map itself.
- **Level 1 (Panels/Cards)**: White surface with a 1px border (#E5E7EB). No shadow.
- **Level 2 (Modals/Popovers)**: White surface with a 1px border (#E5E7EB) and a very subtle ambient shadow (0px 4px 12px rgba(0,0,0,0.05)) to distinguish it from static panels.
- **Active State**: Use a 2px stroke of the Primary color for focused inputs or selected map features.

## Shapes

The shape language is professional and refined. A **12px border radius (rounded-lg)** is applied to all main containers, cards, and input fields.

- **Standard Elements**: 8px radius for buttons and smaller inputs.
- **Containers**: 12px radius for large side panels and map overlays.
- **Interactive States**: Shape forms remain consistent; only the border color or weight changes upon interaction.

## Components

### Buttons
- **Primary**: Solid #2E7D32 background with white text. 8px radius.
- **Secondary**: Transparent background with #2E7D32 border and text.
- **Ghost**: Transparent background, used for toolbar icons on the map to minimize visual obstruction.

### Form Inputs
- **Text Fields**: White background with #E5E7EB border. Focus state uses a 2px #2E7D32 border.
- **Checkboxes/Radios**: Forest Green (#2E7D32) for the active state. High contrast against the white surface is mandatory.

### Layer List / Management
- Each layer item should have a 16px horizontal padding and an 8px vertical padding. 
- Use "Lucide-style" outline icons (2px stroke) to indicate layer types (Polygon, Point, Line).
- Toggle visibility using a simple eye icon.

### Map Widgets
- Group zoom controls, home buttons, and measurement tools into a vertically stacked button group with 1px dividers.
- Position these widgets in the top-right or bottom-right with a 12px margin from the edge.

### Attribute Cards
- Use a 1px #E5E7EB divider between the card header and content.
- Use `text-secondary` (14px) for field labels and `body-base` (16px) for the values.
