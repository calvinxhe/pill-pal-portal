

# Add Junction Link Widget Button to Step 9

## Overview

Add a "Connect Device" button under Step 9 (Pair Phone/App with Omni) that opens a Junction Link widget dialog, allowing pharmacy staff to help patients connect their wearable devices/CGM apps to the system.

## Architecture

The Junction widget integration requires:
1. **Frontend**: A React component using `@tryvital/vital-link` package with the `useVitalLink` hook
2. **Backend**: An edge function to securely generate link tokens using the Junction API (requires API key)

```text
+-------------------+     +----------------------+     +------------------+
|  EncounterWorkflow|     |  Edge Function       |     |  Junction API    |
|  (Connect Button) | --> |  (junction-link-token| --> |  /v2/link/token  |
+-------------------+     +----------------------+     +------------------+
         |                         |
         v                         v
+-------------------+     +----------------------+
|  JunctionLinkDialog|    |  Returns link_token  |
|  (useVitalLink)   | <---|                      |
+-------------------+     +----------------------+
```

---

## Implementation Steps

### 1. Install Dependencies
Add the `@tryvital/vital-link` package for the React hook widget.

### 2. Create Edge Function for Link Token
Create a backend function `junction-link-token` that:
- Accepts a patient ID (to create a Junction user or use existing)
- Calls Junction API to generate a link token
- Returns the token to the frontend

**Requires**: `JUNCTION_API_KEY` secret to be configured

### 3. Create JunctionLinkDialog Component
A new component that:
- Uses the `useVitalLink` hook from `@tryvital/vital-link`
- Displays in a Dialog when triggered
- Handles success, error, and exit callbacks
- Shows connection status feedback

### 4. Update EncounterWorkflow Component
Add a button under Step 9 (`pair_phone_app`) that:
- Opens the Junction Link dialog
- Passes the current patient context
- Updates the step status on successful connection

### 5. Update encounterSteps Configuration
Add a new property to indicate the step has an action button:
```typescript
{
  key: 'pair_phone_app',
  label: 'Pair Phone/App with Omni',
  order: 9,
  hasAction: 'junction-link',  // New property
}
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/JunctionLinkDialog.tsx` | Dialog component with useVitalLink hook |
| `supabase/functions/junction-link-token/index.ts` | Edge function for token generation |

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/encounterSteps.ts` | Add `hasAction` property to step 9 |
| `src/components/EncounterWorkflow.tsx` | Add button and dialog for Junction Link |

---

## Technical Details

### JunctionLinkDialog Component

```typescript
// Key implementation using useVitalLink hook
import { useVitalLink } from '@tryvital/vital-link';

const config = {
  onSuccess: (metadata) => { /* Handle connection success */ },
  onExit: (metadata) => { /* Handle user exit */ },
  onError: (metadata) => { /* Handle errors */ },
  env: "sandbox" // or "production"
};

const { open, ready, error } = useVitalLink(config);

// Open with token from backend
const handleOpen = async () => {
  const token = await fetchTokenFromEdgeFunction(patientId);
  open(token);
};
```

### Edge Function Structure

```typescript
// junction-link-token edge function
// 1. Receive patient ID from request
// 2. Create/fetch Junction user ID for this patient
// 3. Call Junction API: POST /v2/link/token
// 4. Return link_token to frontend
```

### UI Flow

1. Staff clicks "Connect Device" button under Step 9
2. Loading state shows while fetching token from edge function
3. Junction Link widget opens (modal overlay)
4. Patient/staff selects provider and authenticates
5. On success: toast notification, optionally auto-check the step
6. On error/exit: show appropriate feedback

---

## Configuration Required

Before the feature works, you will need to:

1. **Add Junction API Key**: Store `JUNCTION_API_KEY` as a secret in your project
2. **Configure Environment**: Set sandbox/production mode based on your Junction account

---

## Component Preview

The button will appear like this under Step 9:

```text
+--------------------------------------------------+
| [ ] Step 9: Pair Phone/App with Omni             |
|                                                  |
|     [Connect Device]  <-- New button             |
+--------------------------------------------------+
```

When clicked, a dialog opens with the Junction Link widget allowing provider selection and OAuth authentication flow.

