Stitch Design Guidelines: Stock Analyzer
This document provides a written description of the design system extracted from the Stitch project. Use these guidelines to maintain visual consistency across the application.

🎨 Color Palette
Core Colors
Token	HEX	Description
Primary	#8c2bee	The signature vibrant purple used for CTAs, highlights, and icons.
Background (Dark)	#191022	Deep charcoal-purple for main application background in dark mode.
Background (Light)	#f7f6f8	Soft grey-white for light mode background.
Semantic Colors
Success: emerald-500 (#10b981) - Used for gains and "Buy" signals.
Warning: amber-500 (#f59e0b) - Used for neutral/hold signals.
Danger: rose-500 (#f43f5e) - Used for losses and "Sell" signals.
typography Typography
Primary Font: Inter (Sans-serif)
Weights:
400 (Regular)
600 (Semi-Bold)
700 (Bold)
900 (Black) - Used for major headings and price displays.
Headings:
Major Titles: text-3xl or text-5xl, font-black, tracking-tighter.
Section Headers: text-xl, font-bold, tracking-tight.
🧱 UI Components
1. Glass Cards
The "Nebulous Glass" aesthetic is achieved via:

Background: rgba(38, 25, 51, 0.6)
Blur: backdrop-filter: blur(12px)
Border: 1px solid rgba(140, 43, 238, 0.2)
Shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37)
2. Buttons
Primary: Filled with #8c2bee, rounded-lg, font-bold. Often paired with a glow-shadow.
Secondary/Ghost: bg-primary/10, text-primary, hover:bg-primary/20.
Glow Shadow: box-shadow: 0 0 20px rgba(140, 43, 238, 0.4)
3. Inputs
Base: bg-primary/10 or bg-background-dark/50.
Border: border-primary/20.
Focus: ring-2 ring-primary/50.
✨ Visual Effects
Gradients: Use radial and linear gradients for background depth.
Example: radial-gradient(circle at 20% 30%, rgba(140, 43, 238, 0.15) 0%, transparent 40%)
Glows: Semantic glows for status badges.
.glow-green: box-shadow: 0 0 15px rgba(34, 197, 94, 0.4)
Iconography: Use Material Symbols Outlined. Standardize on FILL 0 for most icons, and FILL 1 for active/brand icons.
📐 Layout Patterns
Grid: 12-column layout for main structures (8-col main, 4-col sidebar).
Spacing: Standardize padding with p-6 or p-8 for sections.
Corners: Default 0.25rem, large 0.5rem (lg), extra large 0.75rem (xl).