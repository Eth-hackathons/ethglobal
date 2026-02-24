# V0 Design Prompts - Sports Prediction Platform

Color Palette: White (#FFFFFF) primary, Orange (#FF6B35 primary orange, #FF8F5C light orange, #E55A2B dark orange) as accent. Use dark grays (#1A1A1A, #2D2D2D) for text and borders.

---

## 1. Design System & Theme Configuration

```
Create a Tailwind CSS design system configuration for a sports prediction platform with the following specifications:

**Color Palette:**
- Primary: Orange (#FF6B35) with variants (light: #FF8F5C, dark: #E55A2B)
- Background: White (#FFFFFF) and off-white (#FAFAFA)
- Text: Dark gray (#1A1A1A for primary, #6B7280 for secondary)
- Success: Green (#10B981)
- Danger: Red (#EF4444)
- Warning: Amber (#F59E0B)
- Borders: Light gray (#E5E7EB)

**Typography:**
- Font family: Inter for UI, Bebas Neue for headings/hero text
- Scale: text-sm (14px), text-base (16px), text-lg (18px), text-xl (20px), text-2xl (24px), text-3xl (30px), text-4xl (36px)
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)

**Spacing:**
- Base: 4px grid system
- Container: max-width 1280px with px-4 (mobile) to px-8 (desktop)

**Components Style:**
- Border radius: rounded-lg (8px) for cards, rounded-full for pills/badges
- Shadows: subtle on cards (shadow-sm), stronger on hover (shadow-md)
- Transitions: duration-200 for all interactive elements

**Button Styles:**
- Primary: Orange gradient background, white text, bold font, shadow on hover
- Secondary: White background, orange border, orange text
- Ghost: Transparent background, orange text on hover

Export this as a tailwind.config.ts file with custom colors, spacing, and component variants.
```

---

## 2. Landing Page (Hero Section)

```
Design a modern, sports-focused landing page hero section for a community prediction platform. Use white background with bold orange accents.

**Layout:**
- Full-width hero with centered content
- Gradient overlay: subtle orange radial gradient (from transparent to orange/5 opacity) in top-right corner
- Large, bold headline using display font (3.5rem on desktop, 2.5rem on mobile)

**Content Structure:**
1. **Badge/Label** at top: "Powered by Chainlink & Chiliz" in orange pill badge with icon
2. **Headline** (split into two lines):
   - First line: "Predict Together," in orange gradient text
   - Second line: "Win Together" in dark gray
3. **Subheading**: "Join communities, stake on sports predictions, and execute bets collectively on Polymarket. Better odds, bigger wins."
4. **CTA Buttons** (horizontal on desktop, stacked on mobile):
   - Primary: "Explore Communities" (orange gradient, shadow, icon: Users)
   - Secondary: "Connect Wallet" (white bg, orange border)

**Visual Elements:**
- Floating cards/badges showing: "🏆 1,247 Active Bettors" and "💰 $127K Total Volume"
- Subtle grid pattern background (very light orange lines)
- Trophy/target icon illustrations in corners (outline style, light orange)

**Spacing:**
- py-20 on mobile, py-32 on desktop
- max-w-4xl centered container for text content

Include hover states, animations (fade-in on load), and mobile-responsive breakpoints.
```

---

## 3. Market Detail Page (Betting Interface)

```
Create a professional market detail page for a sports prediction platform. White background, orange accents, data-driven design.

**Page Structure:**

**1. Header Section:**
- Breadcrumb: Community name badge (orange outline) + Status badge (green "Open", amber "Closing Soon", gray "Closed")
- Market title: Large, bold (2.5rem), dark gray
- Market close countdown timer: Large digits with labels, orange highlight for urgency

**2. Stats Bar (horizontal card):**
Display in a white card with border and subtle shadow:
- Total Bets count (with icon)
- Total Volume in CHZ (bold, large number)
- Current odds (YES: 65% in green, NO: 35% in red) with visual bar
- Link to Polymarket (ghost button, external link icon)

**3. Betting Interface (primary card):**
Large white card with orange border glow on hover:
- Title: "Place Your Stake"
- Two large betting buttons side-by-side (on desktop) or stacked (on mobile):
  * **YES Button**: Green gradient, large "YES" text, current odds below, pool amount, "Stake CHZ" CTA
  * **NO Button**: Red gradient, large "NO" text, current odds below, pool amount, "Stake CHZ" CTA
- Each button shows a mini bar chart of current pool distribution
- On click, open a modal/drawer with:
  * Input field for CHZ amount (with max button)
  * Wallet balance display
  * Estimated payout calculation (live update)
  * "Confirm Stake" button (orange gradient)

**4. Your Stakes Section (if user has staked):**
White card showing:
- "Your Bets" heading
- YES stakes in green box (amount + percentage of total)
- NO stakes in red box (amount + percentage of total)
- Total staked + potential payout

**5. Claim Rewards Section (if applicable):**
Orange gradient card with:
- Trophy icon + "You Won! Claim Your Rewards" heading
- Potential reward amount (large, bold)
- "Claim Rewards" button (green gradient, full width)

**6. Discussion Section:**
Simple comment feed:
- "Community Discussion" heading
- Comment cards (user avatar, name, timestamp, text)
- Input field at bottom: "Share your prediction..." with orange send button

**Design Details:**
- Use skeleton loaders for data loading states
- Animate countdown timers
- Add confetti animation on successful claim
- Mobile-first responsive grid (1 column mobile, 2 columns desktop for stats)
- Sticky header on scroll with mini countdown

Include TypeScript types and props for all interactive elements.
```

---

## 4. Creator Dashboard

```
Design a creator dashboard for managing prediction markets. Clean, data-focused layout with white cards and orange highlights.

**Layout:**
Full-width dashboard with sidebar navigation (optional, can be top tabs on mobile).

**1. Stats Overview (top row):**
Four stat cards in a grid (2x2 on mobile, 4x1 on desktop):
- **Total Communities**: Large number, small label, icon (Users)
- **Active Markets**: Large number in orange, small label, icon (TrendingUp)
- **Total Volume**: $XX,XXX in large font, "CHZ" label, icon (DollarSign)
- **Your Win Rate**: XX% in green, small label, icon (Target)

Each card: white background, border, shadow on hover, icon in colored circle top-left.

**2. Quick Actions Bar:**
Horizontal card with three action buttons:
- "Create Market" (orange gradient, primary CTA)
- "Import from Polymarket" (white bg, orange border)
- "Manage Communities" (ghost button)

**3. Active Markets Table:**
Heading: "Your Active Markets" with filter tabs (All, Open, Closing Soon, Closed)

Table/Card list showing:
- Market title (bold, truncated)
- Community badge (orange outline)
- Status badge (color-coded)
- Deadline countdown (inline, small)
- Total staked (CHZ amount)
- Total bets count
- Actions dropdown: "View Details", "Trigger Execution", "Edit", "Close Market"

On desktop: use a table with sortable columns
On mobile: stack as cards with key info visible

**4. Recent Activity Feed:**
Sidebar or bottom section showing:
- "New stake placed by @user on Market X"
- "Market Y execution completed"
- "You won Z CHZ on Market A"

Simple feed items with icon, text, timestamp. Orange dot for unread.

**Design Details:**
- Use DataTable component for markets table (sortable, searchable)
- Empty states: "No markets yet" with illustration + CTA
- Loading states: skeleton cards
- Hover effects: lift cards slightly, show action buttons
- Export button: "Download CSV" ghost button top-right

Include accessibility: aria-labels, keyboard navigation, focus states.
```

---

## 5. Community Page (Market Feed)

```
Create a community landing page showing all active prediction markets in a grid feed. Sports-focused, clean layout.

**1. Header Section:**
- Community name: Large (3rem), bold, with verified badge icon if applicable
- Description: Short bio text (gray)
- Stats row: Members count, Active markets, Total volume (inline badges)
- "Join Community" button (orange gradient) or "Joined" badge (green) if member
- Share button (ghost, icon only)

**2. Filter & Sort Bar:**
White card with horizontal filter chips:
- Status filters: "All", "Open", "Closing Soon", "Closed" (orange when active)
- Sport category filters: "Football", "Basketball", "Tennis", "All Sports" (outline pills)
- Sort dropdown: "Newest", "Most Bets", "Highest Volume", "Closing Soon"

**3. Market Grid:**
Grid of market cards (1 column mobile, 2 columns tablet, 3 columns desktop):

**Market Card Design:**
- White card with border and shadow
- Top: Status badge (top-right corner, absolute positioned)
- Market title: Bold, 2 lines max, ellipsis overflow
- Countdown: Orange text, inline icon, "Closes in X hours"
- Odds bar: Visual horizontal bar split (green for YES %, red for NO %)
- Stats row at bottom:
  * Total bets icon + count
  * Total volume icon + amount
  * Community badge (small)
- Hover: lift card, show "View Market" button overlay (orange gradient)

**4. Empty State:**
If no markets: 
- Illustration (empty box or search icon)
- "No active markets yet"
- "Be the first to create a prediction" CTA (orange button)

**5. Load More:**
At bottom: "Load More Markets" button or infinite scroll indicator

**Design Details:**
- Smooth grid animations on load (stagger fade-in)
- Card skeleton loaders during fetch
- Sticky filter bar on scroll
- Mobile: swipeable filter chips
- Accessibility: semantic HTML, keyboard navigation, screen reader support

Include hover states, loading states, and error states (e.g., "Failed to load markets - Retry" button).
```

---

## 6. Staking Modal/Drawer

```
Design a staking modal (desktop) / bottom drawer (mobile) for placing a bet on YES or NO outcome.

**Modal Specifications:**
- Width: max-w-md (28rem) on desktop, full-width bottom sheet on mobile
- Background: white with border and shadow
- Close button: X icon top-right (gray, hover orange)

**Content Layout:**

**1. Header:**
- Icon: checkmark in circle (green for YES, red for NO)
- Title: "Stake on YES" or "Stake on NO"
- Current odds: "65% chance" in green/red badge

**2. Input Section:**
Label: "CHZ Amount"
- Large input field: type="number", placeholder="0.00"
- "Max" button (right side, orange text) to fill wallet balance
- Helper text below: "Available: X.XX CHZ" (gray, small)

**3. Summary Section:**
White card with light gray background, rounded:
- Row: "You stake" → X.XX CHZ
- Row: "Current odds" → XX%
- Row: "Estimated payout" → X.XX CHZ (bold, orange if profitable)
- Divider line
- Row: "Potential return" → +XX% (green, large)

**4. Info Banner:**
Light orange background, rounded:
- Icon: info circle
- Text: "Your bet will be pooled with the community and executed 2 hours before market close via Chainlink."

**5. Action Button:**
Full-width button (orange gradient for YES-green for bet confirmation):
- Default: "Connect Wallet" (if not connected)
- Ready: "Stake X.XX CHZ"
- Loading: Spinner + "Confirming..."
- Success: Checkmark + "Staked!" (then auto-close after 2s)

**6. Footer:**
Small text: "Powered by Chainlink" with icon

**Interactions:**
- Input validation: min 0.01 CHZ, max wallet balance, show error state (red border + message)
- Real-time payout calculation (updates as user types)
- Success toast notification after staking: "Successfully staked X CHZ on YES!"
- Error handling: "Transaction failed - Retry" button in modal

**Animations:**
- Modal: fade-in background overlay, slide-up content
- Drawer (mobile): slide-up from bottom
- Success: confetti or checkmark animation

Include TypeScript types for props: `{ side: 'yes' | 'no', currentOdds: number, maxAmount: number, onStake: (amount: number) => Promise<void> }`.
```

---

## 7. Navigation Header Component

```
Create a responsive navigation header for a web3 sports prediction platform. White background, sticky on scroll.

**Desktop Layout (horizontal):**
- Left: Logo (text "STACKBET" in bold orange + icon) linking to home
- Center: Navigation links (Home, Communities, Dashboard, Rankings) - gray text, orange underline on active/hover
- Right: 
  * Wallet address button (if connected): truncated address in pill with orange border, avatar icon
  * "Connect Wallet" button (if not connected): orange gradient
  * Network indicator: "Chiliz" badge with chain icon

**Mobile Layout:**
- Top bar: Logo left, hamburger menu right
- Drawer menu: full-screen overlay
  * Close button top-right
  * Nav links stacked (large text, orange on active)
  * Wallet button at bottom

**Scroll Behavior:**
- Sticky top (top-0, z-50)
- Add shadow when scrolled (shadow-md)
- Slightly reduce height on scroll (from py-4 to py-2)

**Wallet Connection:**
- Shows avatar + truncated address (0x1234...5678)
- Dropdown on click: Balance, Network, Disconnect option
- Orange dot indicator if on wrong network

**Design Details:**
- Border-bottom on header (1px gray)
- Smooth transitions on all interactions
- Logo scales slightly on hover
- Active nav link: orange underline (bottom border 2px)
- Mobile menu: slide-in from right, backdrop blur

Include wallet integration hooks (wagmi/viem types), responsive breakpoints, and accessibility features.
```

---

## Integration Instructions

After generating components in v0:

1. **Copy component code** from v0.dev
2. **Place in frontend/src/components/**: 
   - `LandingHero.tsx`
   - `MarketDetailCard.tsx`
   - `StakingModal.tsx`
   - `CreatorDashboard.tsx`
   - `CommunityFeed.tsx`
   - `Header.tsx`
3. **Update tailwind.config.ts** with new color system
4. **Replace old page files** in `app/` with new components
5. **Connect to existing hooks**: useContractRead, useContractWrite (keep contract logic, just update UI)
6. **Test responsive breakpoints**: mobile (sm), tablet (md), desktop (lg)
7. **Verify wallet connection** flow with SafeConnectButton integration

Run `npm run dev` and verify all pages render correctly with the new design.
