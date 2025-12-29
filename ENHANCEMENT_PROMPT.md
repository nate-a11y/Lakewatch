# Lake Watch Pros - Enhancement Sweep

**Objective:** Elevate the existing Lake Watch Pros platform to production-ready, best-in-class quality. The foundation is solid—this pass focuses on polish, missing features, and UX excellence.

---

## Current State Assessment

The codebase already has:
- ✅ Toast notifications (sonner)
- ✅ Skeleton loaders
- ✅ Error boundary with retry
- ✅ Notifications dropdown with real-time
- ✅ Command palette (Cmd+K) for admin
- ✅ Offline support in field app
- ✅ Multi-step inspection wizard
- ✅ Time-based greetings
- ✅ Property health cards
- ✅ Activity feeds

**Focus on what's MISSING or needs ENHANCEMENT.**

---

## Part 1: Global Enhancements

### 1.1 Mobile Experience Upgrades

**File: `src/components/ui/bottom-sheet.tsx`** (CREATE)
```tsx
// Create a bottom sheet modal component for mobile
// Use on mobile for: filters, quick actions, property selection
// Props: isOpen, onClose, title, children
// Features: swipe to close, backdrop blur, snap points
```

**File: `src/components/ui/pull-to-refresh.tsx`** (CREATE)
```tsx
// Pull-to-refresh wrapper component
// Use on: all list views in customer/field portals
// Visual: lime green spinner matching brand
```

**Apply to these pages:**
- `src/app/(portal)/portal/reports/page.tsx`
- `src/app/(portal)/portal/requests/page.tsx`
- `src/app/(portal)/portal/properties/page.tsx`
- `src/app/(field)/field/page.tsx`
- `src/app/(field)/field/history/page.tsx`

### 1.2 Page Transitions

**File: `src/components/providers/TransitionProvider.tsx`** (CREATE)
```tsx
// Wrap app in Framer Motion AnimatePresence
// Subtle fade + slide transitions between routes
// Keep it fast (200-300ms max)
```

### 1.3 Micro-interactions

**File: `src/components/ui/confetti.tsx`** (CREATE)
```tsx
// Lightweight confetti burst for celebrations
// Trigger on:
// - First inspection completed (customer sees their first report)
// - Invoice paid
// - Technician completes inspection
```

**Update button component** (`src/components/ui/button.tsx`):
- Add `active:scale-[0.98]` to all variants
- Add subtle shadow lift on hover for primary variant

### 1.4 Touch Target Audit

Run through ALL interactive elements and ensure minimum 44x44px touch targets:
- All icon buttons need padding
- Filter chips need adequate height
- Checkbox/radio inputs need tap area

---

## Part 2: Customer Portal Enhancements

### 2.1 Dashboard (`src/app/(portal)/portal/page.tsx`)

**Weather Widget - Make Dynamic:**
```tsx
// Replace hardcoded weather with actual API call
// Use OpenWeatherMap free tier or similar
// Add to: src/lib/weather/index.ts
// Fallback gracefully if API unavailable
// Show: temperature, conditions icon, "at [property name]"
```

**Add Upcoming Schedule Mini-Calendar:**
```tsx
// Below the "Next Scheduled Visit" card
// Show next 7 days as dots
// Green dot = inspection scheduled
// Blue dot = occupancy marked
// Tap expands to show details
```

**Mobile Quick Actions FAB:**
```tsx
// Floating action button (bottom right, above nav)
// Shows on mobile only
// Tap to expand: Request Service, Report Issue, Send Message
// Use Radix UI or similar for menu
```

### 2.2 Properties (`src/app/(portal)/portal/properties/[id]/page.tsx`)

**Convert to Tabbed Interface:**
```tsx
// Tabs: Overview | Access Info | Documents | History
// Keep existing PropertyDetailClient content, reorganize into tabs

// Overview Tab:
// - Property photo (with upload button)
// - Address with "Get Directions" link (Google Maps)
// - Service plan badge
// - Assigned technician (if any)
// - Emergency contacts

// Access Info Tab:
// - Gate code, lockbox, alarm (masked by default, tap to reveal)
// - WiFi credentials
// - Special instructions (editable)
// - "Last updated X days ago" prompt
// - Edit inline with save confirmation

// Documents Tab:
// - Organized by type (Insurance, Warranties, Manuals, Other)
// - Upload with drag-drop
// - Expiration alerts for insurance
// - PDF preview in modal

// History Tab:
// - Timeline of all inspections and service requests
// - Filter by type, date range
// - Each item clickable to detail
```

### 2.3 Reports (`src/app/(portal)/portal/reports/[id]/page.tsx`)

**Add Photo Comparison Feature:**
```tsx
// "Compare to previous visit" toggle
// Shows side-by-side: current photo vs same checklist item from last inspection
// Only show if previous inspection had same item photographed
```

**Add GPS Verification Badge:**
```tsx
// At top of report
// "✓ Verified: Technician was on-site from 10:32 AM to 11:15 AM"
// Small map pin showing check-in location
// Click to expand mini-map
```

**Add "Ask About This" Button:**
```tsx
// Per issue item
// Opens new message thread pre-populated with context:
// "Question about [Property Name] inspection on [Date]: [Issue Title]"
```

### 2.4 Calendar (`src/app/(portal)/portal/calendar/page.tsx`)

**Enhanced Occupancy Management:**
```tsx
// Current CalendarView.tsx already has basics
// ADD:
// - Click any date to add arrival/departure
// - Form fields: Type (Owner/Guest/Rental), Guest name, Contact, Notes
// - Checkboxes: "Request pre-arrival prep", "Request post-departure closing"
// - Recurring visits option ("Every 2nd weekend", etc.)
// - Drag to adjust dates
```

**Add Calendar Sync Options:**
```tsx
// "Add to Calendar" dropdown
// Options: Google Calendar, Apple Calendar (ICS download)
// Generate ICS feed URL for subscription
```

### 2.5 Service Requests - New Request Wizard

**File: `src/app/(portal)/portal/requests/new/page.tsx`**

Transform into step-by-step wizard:

```tsx
// Step 1: Select Property (if multiple)
// - Card selection with property photo/name

// Step 2: Select Service Type
// - Visual cards with icons:
//   - Pre-Arrival Prep ($75-150)
//   - Post-Departure Closing ($75-150)
//   - Grocery Stocking ($50 + goods)
//   - Contractor Meet ($40)
//   - Storm Check ($60)
//   - Custom Request
// - Show estimated pricing on each card

// Step 3: Details
// - Date/time preference picker
// - Toggle: "Flexible" vs "Specific time"
// - Special instructions textarea
// - Photo upload for reference
// - For grocery: shopping list builder (add items, quantities)

// Step 4: Review & Submit
// - Summary of everything
// - Estimated cost total
// - Submit button
// - Success screen with "Add to Calendar" option
```

### 2.6 Messages (`src/app/(portal)/portal/messages/[id]/page.tsx`)

**Add Typing Indicator:**
```tsx
// When admin is typing, show "Lake Watch Pros is typing..."
// Use Supabase Realtime presence or a separate typing_status table
```

**Add Message Reactions:**
```tsx
// Quick reactions: 👍 ✅ ❤️
// Tap message to show reaction picker
// Store in messages.reactions jsonb field
```

**Contextual Message Starting:**
```tsx
// URL params: ?context=report&id=123
// Pre-fills: "Question about inspection report from [date] at [property]..."
// Link from report detail "Ask a Question" button
```

### 2.7 Billing (`src/app/(portal)/portal/billing/page.tsx`)

**Add Payment History Graph:**
```tsx
// Simple bar chart showing monthly spend
// Last 6 months
// Use Recharts (already available)
// Helps customers track property expenses
```

**Add Auto-Pay Toggle:**
```tsx
// Enable/disable auto-pay for subscription
// Show: "Your card ending in 4242 will be charged on the 1st"
// Uses Stripe Customer Portal or direct API
```

### 2.8 Settings (`src/app/(portal)/portal/settings/page.tsx`)

**Add to existing SettingsClient.tsx:**

```tsx
// Security Section (NEW):
// - Change password
// - Two-factor authentication setup (TOTP with QR code)
// - Active sessions list with "Log out all devices"
// - Login history (last 5 logins)

// Authorized Users Section (NEW):
// - Invite family members / co-owners
// - Set permission: "View only" or "Full access"
// - Revoke access button
// - Shows list of authorized users

// Quiet Hours (NEW):
// - Toggle: Enable quiet hours
// - Time picker: Start time, End time
// - "No notifications between 10 PM and 7 AM"

// Data & Privacy (NEW):
// - "Download my data" button (GDPR-style export)
// - "Delete my account" (with confirmation modal and data retention info)
```

---

## Part 3: Admin Dashboard Enhancements

### 3.1 Dashboard (`src/app/(manage)/manage/page.tsx`)

**Add Live Map Widget:**
```tsx
// Show today's inspections on a map
// Use Mapbox or Leaflet
// Color-coded pins:
//   - Gray = upcoming
//   - Yellow = in progress
//   - Green = completed
// If real-time tracking: show technician's live location
// Bounds auto-fit to Lake of the Ozarks area
```

**Add Metrics Comparison:**
```tsx
// Under each stat card, show comparison to last period
// "+12% vs last week" or "-5 vs yesterday"
// Green for positive, red for negative
```

### 3.2 Schedule (`src/app/(manage)/manage/schedule/page.tsx`)

**Drag-and-Drop Scheduling:**
```tsx
// Allow dragging inspections to:
//   - Different time slots
//   - Different technicians
// Use @dnd-kit/core or react-beautiful-dnd
// Show conflict warnings (double-booking)
```

**Route Optimization Button:**
```tsx
// "Optimize Route" button per technician
// Calls maps API to reorder stops by shortest path
// Shows: "Save ~25 minutes of drive time"
// One-click apply
```

**Unscheduled Queue Sidebar:**
```tsx
// Right sidebar showing properties due for visit but not scheduled
// Based on service plans and last visit date
// Drag from queue to calendar to schedule
// Shows days since last visit
```

### 3.3 Service Requests (`src/app/(manage)/manage/requests/page.tsx`)

**Add Kanban View Toggle:**
```tsx
// Toggle between List and Kanban
// Kanban columns: New | Scheduled | In Progress | Completed
// Drag cards between columns to update status
// Card shows: title, property, customer, priority badge
```

**SLA Tracking:**
```tsx
// Show time since request submitted
// Highlight if approaching/exceeding SLA
//   - Green: <24 hours
//   - Yellow: 24-48 hours
//   - Red: >48 hours
// Add "Average Response Time" metric to header
```

### 3.4 Customers (`src/app/(manage)/manage/customers/[id]/page.tsx`)

**Add Customer Health Score:**
```tsx
// Visual score 0-100
// Based on:
//   - Payment history (on-time vs late)
//   - Engagement (messages, requests)
//   - Tenure (longer = better)
// Show in header with badge color
```

**Add Internal Notes Tab:**
```tsx
// Notes visible only to admin
// Tags: VIP, Referral Source, Difficult, etc.
// Notes history with timestamps
// Pin important notes
```

**Add "Impersonate" Button:**
```tsx
// For support purposes
// "View as Customer" opens their portal in new tab
// Requires re-authentication with reason logging
// Shows banner: "Viewing as [Customer Name]"
```

### 3.5 Team (`src/app/(manage)/manage/team/[id]/page.tsx`)

**Add Performance Dashboard:**
```tsx
// Metrics:
//   - Inspections completed (week/month/all-time)
//   - Average inspection duration
//   - On-time rate (arrived within window)
//   - Issues found rate
//   - Customer satisfaction (if collecting ratings)
// Comparison to team average
// Trend charts over time
```

**Workload Balance View:**
```tsx
// Visual showing inspections per technician this week
// Bar chart comparing team members
// Helps identify over/under-allocated techs
```

### 3.6 Settings (`src/app/(manage)/manage/settings/page.tsx`)

**Add Audit Log Tab:**
```tsx
// Who did what, when
// Actions logged:
//   - Invoice created/sent
//   - Customer created/updated
//   - Property access codes viewed
//   - User role changed
//   - Settings changed
// Filter by user, action type, date range
// Pagination
```

**Add Notification Template Editor:**
```tsx
// Edit email/SMS templates
// Variables: {{customer_name}}, {{property_name}}, {{date}}, etc.
// Preview with sample data
// Reset to default button
// Templates: Inspection Scheduled, Inspection Complete, Invoice, Payment Received
```

**Service Area Map:**
```tsx
// Draw or define service area on map
// Used for: validating new property addresses, routing optimization
// Save as GeoJSON or polygon coordinates
// Visual display in properties list/map view
```

---

## Part 4: Field/Technician Interface Enhancements

### 4.1 Today View (`src/app/(field)/field/page.tsx`)

**Enhanced Route Visualization:**
```tsx
// Better TodaySchedule.tsx
// Full map showing route with numbered stops
// Current location indicator (with permission)
// Traffic-aware ETA to next stop
// One-tap: "Navigate" opens phone maps app
```

**Weather Alert Banner:**
```tsx
// If severe weather in service area
// Show warning banner at top
// "⚠️ Thunderstorm Warning until 3 PM"
// Links to weather details
```

**Quick Actions:**
```tsx
// "Mark Unavailable" - report sick/car trouble
// "End Day Early" - complete remaining as cancelled
// "Contact Dispatch" - quick message to admin
```

### 4.2 Inspection Flow (`src/app/(field)/field/inspect/[id]/InspectionClient.tsx`)

**Voice-to-Text for Notes:**
```tsx
// Microphone button next to notes field
// Uses Web Speech API
// Visual feedback while recording
// Appends transcribed text to notes
```

**Photo Annotation:**
```tsx
// After taking photo, option to draw/annotate
// Circle problem areas, add arrows
// Simple canvas overlay
// Save annotated version
```

**Previous Inspection Reference:**
```tsx
// In pre-inspection screen, show summary of last visit
// "Last visit: Nov 15 - 2 issues found"
// Expandable to see what issues were
// Reminds tech to follow up
```

**Checklist Item Photo Comparison:**
```tsx
// When viewing an item that was photographed before
// "Show previous photo" button
// Side-by-side comparison
// Helps identify changes over time
```

### 4.3 History (`src/app/(field)/field/history/page.tsx`)

**Personal Stats Widget:**
```tsx
// At top of history page
// This Week: 12 inspections, avg 28 min each
// This Month: 48 inspections
// Issues Found Rate: 15%
// Motivational: streak counter, badges
```

**Advanced Filters:**
```tsx
// Enhance existing HistoryList.tsx
// Filter by: property, date range, issues found
// Search in notes
// Export to CSV (for expense reports, mileage)
```

### 4.4 Service Requests (`src/app/(field)/field/requests/[id]/page.tsx`)

**Completion Flow Enhancements:**
```tsx
// Add to existing RequestDetailClient.tsx:
// - Materials used (for billing)
// - Time tracking (start/stop timer)
// - Customer signature capture (optional)
// - Before/after photos
// - Checklist for specific request types
```

---

## Part 5: Cross-Cutting Improvements

### 5.1 Empty States

Create a reusable empty state component and apply consistently:

**File: `src/components/ui/empty-state.tsx`**
```tsx
interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

// Use lime green/gray theme
// Centered, clean design
```

**Apply to ALL list pages** - ensure every list has a proper empty state with a helpful CTA.

### 5.2 Form Validation

Ensure all forms have:
- [ ] Inline validation (on blur, not just submit)
- [ ] Clear error messages below fields
- [ ] Disabled submit button until valid
- [ ] Loading state on submit
- [ ] Success toast after submission

Key forms to audit:
- Login/Signup
- New Property
- New Service Request
- Contact Form
- Settings forms
- New Invoice

### 5.3 Accessibility Audit

- [ ] All icon-only buttons have aria-label
- [ ] Focus states visible on all interactive elements
- [ ] Color contrast meets WCAG AA (especially lime green on black)
- [ ] Forms have proper label associations
- [ ] Modals trap focus
- [ ] Screen reader announcements for dynamic content

### 5.4 Performance Quick Wins

- [ ] Add `loading="lazy"` to all images not above fold
- [ ] Use `next/image` for all user-uploaded images
- [ ] Review and add Suspense boundaries around heavy components
- [ ] Check for unnecessary re-renders in client components

---

## Implementation Order

**Phase 1: Mobile Polish (Days 1-2)**
1. Bottom sheet component
2. Pull-to-refresh
3. Touch target fixes
4. FAB for customer portal

**Phase 2: Customer Portal Enhancements (Days 3-5)**
1. Weather API integration
2. Property tabbed interface
3. Service request wizard
4. Calendar occupancy improvements
5. Settings security section

**Phase 3: Admin Enhancements (Days 6-8)**
1. Live map widget
2. Kanban view for requests
3. Drag-drop scheduling
4. Audit log
5. Team performance metrics

**Phase 4: Field Enhancements (Days 9-10)**
1. Voice-to-text
2. Photo annotation
3. Previous inspection reference
4. Personal stats

**Phase 5: Polish & Testing (Days 11-12)**
1. Empty states consistency
2. Form validation audit
3. Accessibility fixes
4. Performance optimization
5. Full regression test

---

## Files to Create

```
src/components/ui/bottom-sheet.tsx
src/components/ui/pull-to-refresh.tsx
src/components/ui/empty-state.tsx
src/components/ui/confetti.tsx
src/components/providers/TransitionProvider.tsx
src/lib/weather/index.ts
src/app/(portal)/portal/properties/[id]/tabs/OverviewTab.tsx
src/app/(portal)/portal/properties/[id]/tabs/AccessInfoTab.tsx
src/app/(portal)/portal/properties/[id]/tabs/DocumentsTab.tsx
src/app/(portal)/portal/properties/[id]/tabs/HistoryTab.tsx
src/app/(manage)/manage/requests/KanbanView.tsx
src/app/(manage)/manage/settings/AuditLogTab.tsx
src/app/(manage)/manage/settings/NotificationTemplatesTab.tsx
src/components/field/VoiceNoteButton.tsx
src/components/field/PhotoAnnotator.tsx
```

---

## Testing Checklist

After implementing, verify:
- [ ] All pages render without console errors
- [ ] All forms submit successfully
- [ ] Mobile experience is smooth (test on real device)
- [ ] Offline mode still works in field app
- [ ] Real-time updates still function (notifications, messages)
- [ ] PDF report generation works
- [ ] Build completes without errors
- [ ] Lighthouse score > 80 on all portals

---

**Work through systematically. Commit after each major section. Test as you go.**
