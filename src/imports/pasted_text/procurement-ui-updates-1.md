Apply all of these changes to the existing Procurement Module UI:

---

SIDEBAR — CRITICAL CHANGES:

1. Change sidebar background from black to #4f46e5 (indigo)
2. All text in sidebar: white (#ffffff)
3. All icons in sidebar: white (#ffffff), 18px
4. Active nav item: background rgba(255,255,255,0.15), white text, 
   no colored border needed
5. Inactive nav item hover: background rgba(255,255,255,0.08)
6. "Procurement" header text at top: white, font-weight 700
7. Settings at bottom: white text with 70% opacity
8. "Niyanta AI" branding at bottom: white text, logo white
9. Divider lines inside sidebar: rgba(255,255,255,0.15)

COLLAPSIBLE SIDEBAR:
10. Add a small arrow button at the very bottom of the sidebar
    - Circular button, 28px, background rgba(255,255,255,0.15)
    - Shows left arrow (←) when expanded
    - Shows right arrow (→) when collapsed
    - On click: sidebar collapses to 56px wide showing only icons centered
    - On collapse: hide all text labels, keep icons only, centered
    - Smooth animation: transition width 0.25s ease
    - Tooltips on hover when collapsed showing nav item name
    - Main content area smoothly expands to fill the space

---

TOP NAVBAR — ADD TO ALL SCREENS:

11. Add a top navbar bar, 56px tall, white background, 
    border-bottom 1px solid #e5e5e5, above all content
12. Left side: breadcrumb — "Procurement / [Current Screen]"
    14px, color #888
13. Right side (from right to left):
    - Avatar circle: "AA" initials, background #4f46e5, 
      white text, 32px, circle
    - Bell icon: 20px, color #666, with small red badge "3"
    - Search icon: 20px, color #666

---

DASHBOARD — ADD CHARTS:

14. Replace the "Risk Breakdown" bar panel with a proper 
    DONUT CHART showing:
    - Low risk: green (#059669) 
    - Medium risk: amber (#d97706)
    - High risk: red (#dc2626)
    - Center of donut: total vendor count "15"
    - Legend below chart with counts and percentages

15. Add a new "Outreach Performance" chart (line or bar) below 
    the existing panels, full width:
    - X axis: last 7 days (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
    - 3 lines: Email (blue), WhatsApp (green), SMS (amber)
    - Show data points with hover tooltips
    - Clean chart with light grey grid lines, no heavy borders
    - Title: "Outreach Activity — Last 7 Days"

16. Add a "Vendor Score Distribution" horizontal bar chart:
    - Score ranges: 1-3, 4-6, 7-8, 9-10
    - Each bar colored by risk (red, amber, light green, dark green)
    - Shows count of vendors in each range
    - Place next to or below the donut chart

17. Make the 4 metric cards show trend indicators:
    - Small arrow + percentage change vs last week
    - Up arrow in green, down arrow in red
    - Example: "↑ 23% vs last week" in small muted text

---

VENDOR DISCOVERY — IMPROVEMENTS:

18. Change "Start Discovery" button to background #4f46e5 
    (indigo), white text — NOT grey

19. Add a live progress section that appears when search is running:
    - Progress bar: indigo fill, animating, shows percentage
    - Status text updates: 
      "Searching IndiaMART..." → 
      "Found 12 vendors..." → 
      "Scoring with AI..." → 
      "Complete — 23 vendors discovered"
    - Each step has a small colored dot (loading → complete)

20. Add a "Search Statistics" mini panel showing:
    - Total searches run: 14
    - Total vendors discovered: 143  
    - Avg vendors per search: 10.2
    Show as 3 small stat cards in a row

---

VENDOR DUMP — IMPROVEMENTS:

21. Fix score badges — remove "Score:" prefix, just show the number
    Example: "92" not "Score: 92"
    Keep the colored badge styling

22. Add a filter bar below the header (collapsed by default, 
    expands when Filters button is clicked):
    - Risk filter: All | Low | Medium | High (segmented control)
    - Has Email: toggle
    - Has Phone: toggle
    - Score range: min-max slider (0-100)
    - Date range: from/to date picker
    Active filters show as removable chips below the filter bar

23. Add row selection — checkbox on left of each row
    When rows are selected: show action bar at top:
    "3 selected — Move to Pipeline | Send Email | Export | Deselect"

---

VENDOR REVIEW — IMPROVEMENTS:

24. After clicking Select/Reject/TBD, show decision overlay on card:
    - Selected: green checkmark badge top-right corner
    - Rejected: red X badge top-right corner
    - TBD: grey clock badge top-right corner
    - Card gets a colored left border matching the decision
    - Button row changes to "Decision saved ✓" text

25. Add a progress indicator at the top:
    "Reviewed 3 of 8 vendors — 5 remaining"
    Show as a thin progress bar in indigo

---

VENDOR PIPELINE — IMPROVEMENTS:

26. Replace text status in Email/WhatsApp/SMS columns with icons:
    - Sent: colored check icon (email=blue, whatsapp=green, sms=amber)
    - Pending: grey clock icon
    - Failed: red X icon
    - N/A: grey dash

27. Add a mini outreach funnel chart at the top of the page:
    Horizontal funnel: 
    "In Pipeline 9" → "Contacted 7" → "Responded 3" → "Negotiating 1"
    Each stage as a colored pill with count, connected by arrows

---

OUTREACH LOG — IMPROVEMENTS:

28. Add message preview expand on row click:
    Clicking a row expands it to show the full message content
    in a light grey card with slightly indented padding
    Shows: subject line, full body preview, sent timestamp, 
    delivery status, read status

29. Add reply tracking:
    Rows where vendor replied show a "REPLIED" green badge
    Clicking shows the vendor's reply text in the expanded view

---

GENERAL POLISH — ALL SCREENS:

30. Remove "Score:" prefix from ALL score badges everywhere
    Just show the number: "92" "85" "78" etc.

31. Top navbar breadcrumb must reflect current screen on all 8 screens

32. Empty states for all tables:
    When no data: centered icon + heading + helpful subtext + CTA button
    Use a simple SVG illustration placeholder (grey lines/shapes)

33. All primary action buttons across all screens 
    (Start Discovery, Trigger Outreach, Mark as Contacted):
    Change to indigo #4f46e5 background, white text
    NOT black, NOT grey

34. Add keyboard shortcut hints on hover for power users:
    "S" for Select, "R" for Reject, "T" for TBD on Vendor Review cards

35. Table pagination — show on all tables:
    "Showing 1-15 of 143 vendors" with prev/next arrows
    And a "per page" selector: 15 | 25 | 50

Make all changes consistent across all 8 screens. 
The indigo sidebar with white text is the #1 priority — 
this alone will transform the visual identity completely.
The charts on Dashboard are #2 priority.
Everything else improves user control and data visibility.