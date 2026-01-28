

# CGM Encounter Timesheet Application - Refactoring Plan

## Overview

Transform the existing pharmacy management application into a **CGM (Continuous Glucose Monitor) Encounter Timesheet** application that tracks patient CGM setup workflows. The app will guide pharmacy staff through a step-by-step SOP for CGM setup encounters while automatically tracking time spent on each patient.

## New Application Structure

### Main Features

1. **Patient Queue Management** - Track patients waiting for CGM setup
2. **Active Encounter Workflow** - Step-by-step checklist following the SOP
3. **Encounter Timer** - Automatic time tracking from start to close
4. **Encounter History** - View past encounters with timing data
5. **Timesheet Reports** - Generate reports of time spent on encounters

---

## Database Changes

### New Tables

```text
+----------------------------+
|     cgm_encounters         |
+----------------------------+
| id (UUID, PK)              |
| patient_id (FK patients)   |
| staff_user_id (FK users)   |
| pharmacy_id (FK pharmacies)|
| status (enum)              |
| started_at (timestamp)     |
| ended_at (timestamp)       |
| total_duration_seconds     |
| copay_amount (decimal)     |
| sensor_serial_number       |
| app_pairing_verified       |
| data_sync_verified         |
| refill_reminder_given      |
| notes                      |
| created_at, updated_at     |
+----------------------------+

+----------------------------+
|  encounter_checklist_items |
+----------------------------+
| id (UUID, PK)              |
| encounter_id (FK)          |
| step_key (text)            |
| step_label (text)          |
| completed (boolean)        |
| completed_at (timestamp)   |
| completed_by (FK users)    |
| notes (text)               |
+----------------------------+

+----------------------------+
|    patient_queue           |
+----------------------------+
| id (UUID, PK)              |
| patient_id (FK patients)   |
| pharmacy_id (FK pharmacies)|
| queue_position (int)       |
| intake_form_completed      |
| queued_at (timestamp)      |
| called_at (timestamp)      |
| status (waiting/called/    |
|         in_progress/done)  |
+----------------------------+
```

### Updates to Existing Tables

- **patients**: Add `cgm_prescription_active`, `freestyle_libre_app_installed`, `consent_form_signed`, `insurance_cgm_coverage_verified`

---

## UI Components to Create

### 1. EncounterDashboard (Main View)
Replace MainDashboard content with:
- **Queue Panel** - Shows patients waiting
- **Active Encounter Panel** - Current patient workflow
- **Stats Cards** - Today's encounters, avg time, etc.

### 2. PatientQueue Component
- List of patients in queue with status
- "Check In Patient" button to add to queue
- "Start Encounter" to begin workflow

### 3. EncounterWorkflow Component
The core component with step-by-step checklist:

```text
+------------------------------------------+
|  ENCOUNTER: John Smith          [Timer]  |
|  Started: 10:32 AM              12:45    |
+------------------------------------------+
|                                          |
|  [ ] Step 1: Intake Form Complete        |
|  [ ] Step 2: Front-Desk Verification     |
|      - RX validated                      |
|      - Insurance verified                |
|      - Patient ID checked                |
|  [ ] Step 3: Patient Seated + Consent    |
|  [x] Step 4: Omni Portal Open + Timer    |
|  [ ] Step 5: Confirm Active RX           |
|  [ ] Step 6: CGM Checklist Prep          |
|  [ ] Step 7: Collect Copay               |
|      Amount: $____                       |
|  [ ] Step 8: Apply CGM Sensor            |
|      Serial #: ____                      |
|  [ ] Step 9: Pair Phone/App              |
|  [ ] Step 10: Verify Data Coming Through |
|  [ ] Step 11: Provide Refill Reminder    |
|                                          |
|  [End Encounter]                         |
+------------------------------------------+
```

### 4. EncounterTimer Component
- Prominent timer display
- Auto-starts when encounter begins
- Persists across page refreshes
- Shows elapsed time in HH:MM:SS

### 5. PatientIntakeForm Component
- Demographics collection
- Contact information
- Quick intake for walk-ins

### 6. TimesheetReport Component
Replace RevenueTracking with:
- Date range selector
- List of completed encounters with durations
- Total time per day/week
- Export functionality

### 7. EncounterHistory Component
Replace AdherenceMonitoring with:
- Searchable list of past encounters
- View encounter details and timing
- Filter by patient, date, staff

---

## Navigation Updates

Replace sidebar items:

| Old Item | New Item |
|----------|----------|
| Dashboard | Encounter Dashboard |
| Profile Setup | (Keep for pharmacy setup) |
| Order Fulfillment | Patient Queue |
| Support Tickets | Active Encounters |
| Training | CGM Training |
| Knowledge Base | CGM Resources |
| Revenue Tracking | Timesheet Reports |
| Patient Adherence | Encounter History |

---

## Workflow Implementation

### Patient Check-In Flow
1. Staff searches for patient or creates new
2. Patient added to queue
3. Intake form marked complete

### Encounter Start Flow
1. Staff selects patient from queue
2. Timer automatically starts
3. Checklist loads with all SOP steps
4. Each step can be checked/unchecked with timestamp

### Encounter Close Flow
1. All required steps must be complete
2. Staff clicks "End Encounter"
3. Timer stops, duration calculated
4. Optional notes added
5. Encounter saved to history

---

## Technical Details

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/EncounterDashboard.tsx` | Main dashboard with queue + active encounter |
| `src/components/PatientQueue.tsx` | Queue management component |
| `src/components/EncounterWorkflow.tsx` | Step-by-step checklist with timer |
| `src/components/EncounterTimer.tsx` | Timer display and logic |
| `src/components/PatientIntakeForm.tsx` | Quick patient intake |
| `src/components/EncounterHistory.tsx` | Past encounters list |
| `src/components/TimesheetReport.tsx` | Time tracking reports |
| `src/hooks/useEncounterTimer.ts` | Timer hook with persistence |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `src/components/MainDashboard.tsx` | Update navigation, replace tabs with new components |
| `src/pages/Index.tsx` | No changes needed (uses MainDashboard) |

### Files to Remove/Replace

| File Path | Action |
|-----------|--------|
| `src/components/OrderFulfillment.tsx` | Replace with PatientQueue |
| `src/components/AdherenceMonitoring.tsx` | Replace with EncounterHistory |
| `src/components/RevenueTracking.tsx` | Replace with TimesheetReport |
| `src/components/SupportTickets.tsx` | Remove (not needed) |
| `src/components/PharmacyDashboard.tsx` | Remove (not used in main flow) |
| `src/components/PrescriptionTable.tsx` | Remove (not needed) |
| `src/components/DashboardStats.tsx` | Remove (replaced by new stats) |

---

## Implementation Order

1. **Database Migration** - Create new tables for encounters, checklist items, and queue
2. **Core Components** - Build EncounterTimer, EncounterWorkflow, and PatientQueue
3. **Dashboard Refactor** - Update MainDashboard with new navigation and components
4. **Encounter Flow** - Implement full check-in to close workflow
5. **Reporting** - Build TimesheetReport and EncounterHistory
6. **Polish** - Clean up unused components, fix build errors

---

## Build Error Fixes

The current build errors in `OrderFulfillment.tsx` reference tables (`patients`, `profiles`, `orders`) that exist but the TypeScript types are out of sync. Since we're replacing this component entirely, these errors will be resolved by:
1. Creating the new database tables via migration
2. Replacing OrderFulfillment with the new PatientQueue component
3. Removing the problematic file

