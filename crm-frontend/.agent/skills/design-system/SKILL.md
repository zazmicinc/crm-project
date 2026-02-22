---
name: design-system
description: >
  Use this when creating or modifying any UI component, page, or layout.
  Enforces Apple.com-inspired design language with Zazmic branding.
  Always apply this skill for any frontend visual work.
---

# Zazmic CRM Design System — Apple-Inspired

## Use this skill when
- Creating any new UI component or page
- Modifying existing layouts or styling
- Reviewing design consistency
- User mentions "design", "styling", "UI", "look and feel", or "branding"

## Do not use this skill when
- Working on API calls, data logic, or non-visual code

## Brand Identity

### Logo
- Use the Zazmic logo from https://zazmic.com
- Logo placement: top-left of navigation bar
- Product name: "Zazmic CRM" displayed next to logo in nav
- Logo should be clean, no background box

### Colors
```
Primary Blue:      #0071E3  (Apple-style blue, use for CTAs and links)
Text Primary:      #1D1D1F  (near-black for headings)
Text Secondary:    #6E6E73  (gray for body text and labels)
Background:        #FFFFFF  (white, primary background)
Background Alt:    #F5F5F7  (light gray, alternating sections)
Surface:           #FBFBFD  (card backgrounds)
Border:            #D2D2D7  (subtle dividers)
Success:           #30D158
Warning:           #FF9F0A
Danger:            #FF3B30
```

### Typography
```css
/* Use Inter as the primary font (closest free alternative to SF Pro) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Scale */
Hero Heading:      font-size: 56px;  font-weight: 800; letter-spacing: -0.03em;
Page Heading:      font-size: 40px;  font-weight: 700; letter-spacing: -0.02em;
Section Heading:   font-size: 28px;  font-weight: 600; letter-spacing: -0.02em;
Card Title:        font-size: 20px;  font-weight: 600;
Body:              font-size: 17px;  font-weight: 400; line-height: 1.6;
Caption:           font-size: 14px;  font-weight: 400; color: #6E6E73;
Small:             font-size: 12px;  font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;
```

## Layout Principles

### Spacing
```
Page max-width:    1200px, centered
Section padding:   80px vertical, 24px horizontal
Card padding:      32px
Card gap:          24px
Component gap:     16px
Tight gap:         8px
```

### Grid
- Use CSS Grid or Tailwind grid
- Dashboard: 3-column grid for stat cards, 2-column for charts
- Contacts/Deals: full-width tables or boards
- Always centered with max-width container
- Mobile: stack to single column below 768px

### Whitespace
- CRITICAL: Apple's design is defined by generous whitespace
- Never crowd elements — when in doubt, add more padding
- Sections should breathe with 80-120px vertical spacing
- Cards should have 32px internal padding minimum

## Component Specifications

### Navigation Bar
```
- Position: fixed top, full width
- Height: 48px
- Background: rgba(255, 255, 255, 0.8) with backdrop-filter: blur(20px)
- Border bottom: 1px solid rgba(0, 0, 0, 0.1)
- Layout: logo left, nav links center, profile icon right
- Links: text-sm font-medium text-[#1D1D1F] hover:text-[#0071E3]
- NO sidebar navigation — top nav only
- Mobile: hamburger menu
```

### Stat Cards (Dashboard)
```
- Background: white
- Border-radius: 20px
- Box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04)
- Padding: 32px
- Large number: 48px font-size, font-weight 700
- Label below: 14px, text-[#6E6E73], uppercase, letter-spacing
- Hover: subtle lift with shadow increase
- Transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)
```

### Data Tables (Contacts, Activities)
```
- Clean, borderless design
- Header: uppercase, 12px, font-weight 600, text-[#6E6E73]
- Rows: 17px, padding 16px vertical
- Row divider: 1px solid #F5F5F7 (very subtle)
- Row hover: background #F5F5F7
- No outer border on the table
- Search bar: large, rounded-full, centered above table
- Pagination: minimal, centered below
```

### Pipeline Board (Deals)
```
- Columns for each stage: Lead, Qualified, Proposal, Negotiation, Won, Lost
- Column headers: uppercase label + count badge
- Cards: white, rounded-2xl, shadow-sm, 24px padding
- Card content: deal title (bold), value (large), contact name (gray)
- Drag handle: subtle dots icon on hover
- Smooth drag-and-drop with spring animation
- Column background: #F5F5F7 with rounded corners
```

### Buttons
```
Primary:   bg-[#0071E3] text-white rounded-full px-6 py-3 font-medium
           hover:bg-[#0077ED] transition-all
Secondary: bg-transparent border border-[#0071E3] text-[#0071E3] rounded-full
           hover:bg-[#0071E3] hover:text-white transition-all
Ghost:     text-[#0071E3] hover:underline font-medium
Danger:    bg-[#FF3B30] text-white rounded-full
Disabled:  opacity-40 cursor-not-allowed
```

### Forms
```
- Labels: 14px, font-weight 500, text-[#1D1D1F], margin-bottom 8px
- Inputs: border border-[#D2D2D7] rounded-xl px-4 py-3
          focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20
          transition-all font-size 17px
- Input groups: 24px gap between fields
- Submit: primary button, full width or right-aligned
- Validation errors: text-[#FF3B30] text-sm, icon + message
```

### Modals / Dialogs
```
- Backdrop: bg-black/30 with backdrop-blur-sm
- Content: white, rounded-2xl, max-width 560px, padding 32px
- Title: 24px font-weight 600
- Animate in: fade + scale from 0.95 to 1
- Close button: top-right, subtle X icon
```

### Empty States
```
- Centered vertically and horizontally
- Large subtle icon (64px, text-[#D2D2D7])
- Heading: 20px font-weight 600
- Description: 17px text-[#6E6E73]
- CTA button: primary style
```

### Loading States
```
- Skeleton screens (not spinners) matching content layout
- Skeleton: bg-[#F5F5F7] rounded-xl, shimmer animation
- Shimmer: linear-gradient moving left to right
- Match exact dimensions of the content being loaded
```

## Animations

### Required Library
```
npm install framer-motion
```

### Page Transitions
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
>
```

### Card Hover
```jsx
<motion.div
  whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
  transition={{ duration: 0.3 }}
>
```

### Staggered List Items
```jsx
// Parent
<motion.div variants={container} initial="hidden" animate="show">

// Each child
<motion.div variants={item}>

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
}
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}
```

### Drag and Drop (Pipeline)
```
- Use spring physics: type: "spring", stiffness: 300, damping: 25
- Scale card slightly on pickup: scale 1.03
- Show drop zone highlight with border-dashed
```

## Tailwind Config Extensions

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        apple: {
          blue: '#0071E3',
          text: '#1D1D1F',
          gray: '#6E6E73',
          bg: '#F5F5F7',
          border: '#D2D2D7',
          surface: '#FBFBFD',
        }
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'apple-sm': '0 2px 12px rgba(0, 0, 0, 0.04)',
        'apple-md': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'apple-lg': '0 8px 30px rgba(0, 0, 0, 0.08)',
      }
    }
  }
}
```

## Key Rules
1. NEVER use a sidebar — top navigation only
2. ALWAYS use generous whitespace — this is the #1 differentiator
3. ALWAYS use rounded-full for buttons, rounded-2xl for cards
4. ALWAYS use skeleton loading, never spinners
5. ALWAYS animate page transitions and list items
6. KEEP text minimal — large headings, short descriptions
7. USE the exact color tokens defined above — no custom colors
8. EVERY interactive element needs a smooth hover/active state
9. ALWAYS include the Zazmic logo in the navigation
