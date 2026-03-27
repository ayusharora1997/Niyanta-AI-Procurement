You are redesigning an existing Procurement Module UI for "Niyanta AI". 
The logo is already defined — use exactly this:
- "Niyanta" in bold dark text + "AI" in indigo (#4f46e5)
- With a small lightning bolt icon to the left in indigo

Apply these fixes and improvements across ALL 8 screens:

---

GLOBAL DESIGN SYSTEM — apply to every screen:

Typography:
- Font: Inter throughout
- Page titles: 24px, font-weight 700, color #0a0a0a
- Section labels: 11px, font-weight 600, uppercase, letter-spacing 0.08em, color #888
- Body text: 14px, font-weight 400, color #404040, line-height 1.6
- Table headers: 12px, font-weight 600, uppercase, letter-spacing 0.06em, color #888
- Table cells: 14px, color #0a0a0a

Colors:
- Background: #ffffff (main), #fafafa (sidebar and secondary panels)
- Border: 1px solid #e5e5e5 everywhere — no thick borders
- Primary action: #0a0a0a (black buttons)
- Sidebar active item: #f0f0f0 background, #0a0a0a text, 3px left border #4f46e5
- Score badge high (7-10): background #ecfdf5, text #065f46, border #a7f3d0
- Score badge medium (4-6): background #fffbeb, text #92400e, border #fcd34d
- Score badge low (1-3): background #fef2f2, text #991b1b, border #fca5a5
- Risk badge low: background #ecfdf5, text #065f46
- Risk badge medium: background #fffbeb, text #92400e
- Risk badge high: background #fef2f2, text #991b1b
- Status badge email sent: background #eff6ff, text #1e40af
- Status badge whatsapp sent: background #f0fdf4, text #166534
- Status badge pending: background #f9fafb, text #6b7280

Layout:
- Sidebar: 240px wide, background #fafafa, border-right 1px solid #e5e5e5
- Top navbar: 56px tall, background white, border-bottom 1px solid #e5e5e5
- Main content area: padding 32px
- Cards: background white, border 1px solid #e5e5e5, border-radius 8px, padding 24px
- Table rows: 48px tall, border-bottom 1px solid #f5f5f5, hover background #fafafa

Sidebar navigation items in order:
1. Dashboard (grid icon)
2. Vendor Discovery (search icon)
3. Vendor Dump (database icon)
4. Vendor Review (check-square icon)
5. Vendor Pipeline (filter icon)
6. Outreach Log (mail icon)
7. Manual Queue (alert-circle icon)
8. Vendor Detail (user icon)

Bottom of sidebar:
- Settings (gear icon)
- "Niyanta AI" branding with version tag "v1.0"

---

SCREEN 1 — Dashboard

Top row: 4 metric cards side by side
Card 1: "Total Vendors" — large number, subtitle "Discovered this week"
Card 2: "Avg Score" — number out of 10, green if above 7
Card 3: "Emails Sent" — count with "this month" subtitle
Card 4: "In Pipeline" — count with "awaiting review" subtitle

Each metric card:
- White background, 1px border #e5e5e5, border-radius 8px
- Label: 12px, color #888, uppercase
- Number: 32px, font-weight 700, color #0a0a0a
- Subtle colored left border (4px): indigo for vendors, green for score, blue for emails, amber for pipeline

Middle row: 2 panels side by side
Left panel (60%): "Recent Activity" — timeline list
Each item: colored dot + action text + vendor name bold + time ago muted
Example items:
- Green dot: "Email sent to Refratex India Private Limited · 2 hours ago"
- Blue dot: "Vendor moved to pipeline · Aggarwal Metal Industries · 5 hours ago"  
- Amber dot: "Manual outreach needed · Indian Harness · 1 day ago"
- Indigo dot: "New search completed · 23 vendors found for bags · 2 days ago"

Right panel (40%): "Risk Breakdown" — simple donut or bar chart
3 rows: Low risk (green), Medium risk (amber), High risk (red)
Each row: label + count + percentage + colored bar

Bottom row: "Recent Searches" table
Columns: Keyword | Date | Vendors Found | Avg Score | Status
Show 5 sample rows with action button "View Results" on each

---

SCREEN 2 — Vendor Discovery

Top section: "Start New Search"
Large search card centered, white background, border 1px #e5e5e5, border-radius 12px, padding 32px

Inside the card:
- Heading: "Discover Vendors" 24px bold
- Subtext: "Enter a product keyword to find and score vendors automatically" 14px #666
- Large input field: placeholder "e.g. cotton drawstring bags, glass bottles..."
  Height 52px, border 1.5px #e0e0e0, border-radius 8px, font-size 16px
  Focus state: border #0a0a0a, box-shadow 0 0 0 3px rgba(0,0,0,0.06)
- Row below input: "Number of vendors to scrape" with a number stepper (default 5)
- Primary button: "Start Discovery" — full width, black background, white text, 52px tall, border-radius 8px

Status indicator below button (3 states):
- Idle: hidden
- Running: blue pulsing dot + "Scraping IndiaMART... found 12 vendors so far"
- Complete: green check + "Discovery complete — 23 vendors found. View in Vendor Dump →"

Below the search card: "Recent Searches" section
Title: "Previous Searches"
Simple list: each row shows keyword + date + vendor count + "View" link

---

SCREEN 3 — Vendor Dump

Full-width table layout

Top bar:
Left: "Vendor Dump" title + count badge "143 vendors"
Right: Filter button (outline) + Export button (outline) + Search input (compact, 240px)

Filter bar below top bar (collapsible):
Row of filter chips: Risk (dropdown) | Score range (slider) | Has Email | Has Phone | Date range
Active filters show as removable chips in indigo

Table columns (with sort arrows on hover):
1. Company Name (sortable, clicking shows Vendor Detail)
2. Product (truncate at 40 chars with tooltip)
3. Score (badge — colored by range)
4. Risk (badge — low/medium/high colored)
5. Location
6. Email (icon — green check if present, grey dash if missing)
7. Phone (icon — green check if present, grey dash if missing)
8. Pipeline Status (badge — "In Pipeline" indigo, "Moved" green, blank grey)
9. Actions (3 dots menu: View Detail, Move to Pipeline, Send Email)

Table rows:
- Hover: background #fafafa
- Selected: background #f5f3ff (light indigo), left border 3px #4f46e5
- Clicking company name navigates to Vendor Detail screen

Pagination at bottom: showing "1-20 of 143" with prev/next arrows

---

SCREEN 4 — Vendor Review

Top bar:
Left: "Vendor Review" title
Right: "Showing vendors pending review" count badge + filter chips (All, High Score, Low Risk)

Card grid: 3 columns on desktop, 2 on tablet

Each vendor card:
- White background, border 1px #e5e5e5, border-radius 12px, padding 24px
- Top row: Company name (16px bold) + Score badge (colored)
- Second row: Product name (14px, #666, truncated at 2 lines)
- Third row: Risk badge + Location text (14px, #888)
- Inference box: background #fafafa, border-radius 6px, padding 12px 14px
  Text: 13px, color #404040, italic, line-height 1.6
  Label above: "AI Assessment" 11px uppercase #888

- Bottom row: 3 action buttons side by side, equal width, 32px tall
  Button 1 "Select": background #ecfdf5, text #065f46, border 1px #a7f3d0
    Hover: background #d1fae5
  Button 2 "TBD": background #f9fafb, text #6b7280, border 1px #e5e5e5
    Hover: background #f3f4f6
  Button 3 "Reject": background #fef2f2, text #991b1b, border 1px #fca5a5
    Hover: background #fee2e2

After clicking a button:
- Card gets a colored left border: green for Select, grey for TBD, red for Reject
- Selected badge appears on top right of card
- Button row replaced with "Decision saved ✓" in matching color

---

SCREEN 5 — Vendor Pipeline

Top bar:
Left: "Vendor Pipeline" title + "Shortlisted vendors ready for outreach"
Right: "Trigger Outreach" button — black, white text

Summary strip below top bar (4 mini stats in a row):
"12 vendors" | "8 emailed" | "4 WhatsApp sent" | "3 manual needed"
Each separated by thin vertical line

Full table:
Columns:
1. Company Name
2. Product
3. Score badge
4. Risk badge
5. Email Status (colored badge: "Sent" green, "Pending" grey, "Failed" red)
6. WhatsApp Status (colored badge: "Sent" green, "Pending" grey, "N/A" grey)
7. SMS Status (colored badge: "Sent" green, "N/A" grey)
8. Added Date
9. Actions (View, Re-send, View Detail)

Row color coding:
- All sent: subtle green left border
- None sent: no border
- Failed: subtle red left border

---

SCREEN 6 — Outreach Log

Timeline view

Top bar:
Left: "Outreach Log" title
Right: Filter by channel (All, Email, WhatsApp, SMS) as segmented control

Timeline list — each entry:
Left: channel icon (envelope/whatsapp/phone) in colored circle (16px)
  Email: blue circle
  WhatsApp: green circle
  SMS: amber circle

Main content:
- Company name bold + product name muted (same line)
- Message preview: 2 lines max, truncated, 13px #666
- Bottom row: timestamp + "Delivered" green or "Failed" red status

Clicking a row expands it to show full message text in a grey card below

---

SCREEN 7 — Manual Outreach Queue

Alert banner at top:
Background #fffbeb, border 1px #fcd34d, border-radius 8px, padding 16px
Icon: amber warning triangle
Text: "These vendors have no email or phone. Manual research required."

Table:
Columns:
1. Company Name
2. Product  
3. Score badge
4. Risk badge
5. IndiaMART Profile (clickable link — "View Profile" in indigo)
6. Missing (badge showing what's missing: "Email" red, "Phone" red, "Both" dark red)
7. Added Date
8. Actions ("Mark as Contacted" button, "Remove" link)

Empty state (when all resolved):
Centered illustration area
Green check icon (48px)
"All caught up!" heading
"No vendors pending manual outreach" subtext

---

SCREEN 8 — Vendor Detail

Two column layout:
Left column (380px): vendor summary card — sticky
Right column: tabbed detail panels

Left card:
- Company name: 22px, font-weight 700
- Product: 15px, #666
- Score: large number (48px, bold) + colored risk badge beside it
- Inference text: full text in italic, background #fafafa, border-left 3px #4f46e5, padding 16px
- Contact section:
  Email row: envelope icon + email address (or "Not found" muted)
  Phone row: phone icon + number (or "Not found" muted)
  Profile row: link icon + "View on IndiaMART" indigo link
- Action buttons stacked:
  "Send Email" — black, full width
  "Send WhatsApp" — green background, full width  
  "Move to Pipeline" — outline, full width
  "Reject" — text only, red, centered

Right tabs: Overview | Compliance | Outreach History

Overview tab content:
Grid of info rows: label left, value right, border-bottom between rows
Nature of Business | Legal Status | Annual Turnover | Established Year
Num Employees | Primary Products | Location | Address

Compliance tab:
Each item in a row: label + value + status indicator
GSTIN: value + "Valid" green badge or "Missing" red badge
IEC: value + status
GST Registration Date: value
TrustSEAL: "Yes" green or "No" grey
Verified Exporter: "Yes" green or "No" grey

Outreach History tab:
Timeline of all communications sent to this vendor
Same format as Outreach Log screen but filtered to one vendor

---

GENERAL INTERACTIONS — apply to all screens:

Empty states: every table and list must have a designed empty state
- Centered in the content area
- Simple icon (48px, #e0e0e0)
- "No vendors found" heading
- Helpful subtext explaining next action
- Primary CTA button where relevant

Loading states:
- Tables: show skeleton rows (grey animated bars, same height as real rows)
- Cards: skeleton card with animated shimmer
- Numbers: "--" while loading

Error states:
- Red banner at top: "Something went wrong. Please try again." with retry button

Tooltips:
- Truncated text shows full content on hover
- Score badges show "Score: X/10 — Based on compliance, rating, and trust indicators"
- Status badges show timestamp on hover

---

Make all 8 screens use consistent spacing, typography, and color. 
Every screen should feel like it belongs to the same product.
The overall feel should be: clean, professional, data-dense but not cluttered.
Similar to Linear, Notion, or Vercel's dashboard aesthetic.
White and off-white only. Color only on badges, icons, and status indicators.