# Changelog

---

## [Unreleased] — 2026-07-23

### Gemini API Migration

**Problem:** Google AI Studio deprecated legacy `AIza...` Traffic Keys. Models `gemini-2.0-flash` and `gemini-2.5-flash` return 404 "model no longer available" for new `AQ...` keys.

**Fix:** Migrated to `gemini-3.5-flash` in `server/services/recommendationService.js`.

---

### Gemini 429 / Rate-Limit Error Handling

**Files changed:**
- `server/services/recommendationService.js`
- `server/controllers/recommendationController.js`

**What changed:**
- `generateViaGemini()` now detects 429 and quota errors and throws a typed `RATE_LIMITED` error instead of silently returning `null`.
- The fallback chain (`generateRecommendations()`) re-throws `RATE_LIMITED` so it bubbles up instead of quietly degrading.
- Both `getRecommendations` and `refreshRecommendations` controllers catch `RATE_LIMITED` and return HTTP 503 with the message: _"The AI system is temporarily busy. Please try again in a few minutes."_
- The existing error UI in `Profile.jsx` displays this message automatically.

---

### Auth — Email Validation & Availability Check

**Files changed:**
- `server/controllers/authController.js`
- `server/routes/authRoutes.js`
- `server/package.json` (`express-rate-limit` added)
- `client/src/features/auth/Register.jsx`
- `client/src/features/auth/Login.jsx`

**What changed:**
- Added `isValidEmail` regex validator on both client and server for login and register.
- Added `GET /api/auth/check-email` endpoint — returns `{ available: boolean }` for real-time duplicate detection.
- Register form debounces the email field (600ms) and calls the endpoint, showing a spinner, green checkmark, or red X inline.
- Login form validates email on blur and on submit, highlighting the field in red on failure.
- Error toasts now show for 5 seconds (up from 3) when `type === "error"` across Login, Register, and ForgotPassword.

---

### Auth — Rate Limiting on Sensitive Routes

**Files changed:**
- `server/routes/authRoutes.js`
- `server/package.json`

**What changed:**
- Installed `express-rate-limit`.
- `POST /api/auth/login` and `POST /api/auth/admin-login`: 10 requests per 15 minutes per IP.
- `POST /api/auth/register`: 5 requests per hour per IP.
- `POST /api/auth/forgot-password`: 5 requests per hour per IP.
- All limiters return a descriptive `{ message }` on breach.

---

### Auth Middleware — Admin DB Verification

**File changed:** `server/middleware/authMiddleware.js`

**What changed:**
- `protectAdmin` now verifies the admin record still exists in the database after JWT validation.
- Catches deleted or demoted admin accounts that still hold a valid token.
- Returns HTTP 403 with `"Admin account not found or has been revoked"` if the DB lookup fails.

---

### Profile — Refresh Button Cooldown UI

**File changed:** `client/src/pages/Profile.jsx`

**What changed:**
- Computes `nextRefreshDate` (5 days after `generatedAt`) on the client.
- Refresh button is disabled and shows `cursor-not-allowed` when the cooldown hasn't elapsed.
- A label like _"Available Jun 28"_ renders below the button when locked.

---

### Accessibility — Focus Trap on Modals

**Files changed:**
- `client/src/components/EditProfileModal.jsx`
- `client/src/layout/DashboardLayout.jsx`
- `client/src/hooks/useFocusTrap` (new hook)

**What changed:**
- `useFocusTrap(ref, isOpen)` hook traps keyboard focus inside a modal while it is open and restores focus on close.
- Applied to the Edit Profile modal and the logout confirmation modal.

---

### 404 Not Found Page

**Files changed:**
- `client/src/pages/NotFound.jsx` (new file)
- `client/src/routes/AppRoutes.jsx`

**What changed:**
- Added a styled 404 page with a "Back to Dashboard" button.
- Wired up as the catch-all `path="*"` route in `AppRoutes.jsx` (was previously commented out).

---

### InterestSelector — JSX Syntax Fix

**File changed:** `client/src/components/InterestSelector.jsx`

**What changed:**
- Removed a stray `/>` on line 82 inside the component's return block that caused a Vite compile error.
