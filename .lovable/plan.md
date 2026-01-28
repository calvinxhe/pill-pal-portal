

# Timesheet Entries Feature Implementation

## Overview

This plan creates a dedicated timesheet tracking system that separates timesheet entries from CGM encounters. The report will only show dedicated timesheet time (from notes and manual entries), not encounter time.

## Current Problem

1. The `TimesheetReport.tsx` currently pulls data from `cgm_encounters` table and shows all completed encounters
2. Retroactive notes time is added to `total_duration_seconds` in the encounter record, mixing it with actual encounter time
3. There's no way to distinguish between encounter time and notes/administrative time
4. No ability to create standalone timesheet entries without an encounter

## Solution Architecture

```text
+------------------------+     +------------------------+
|     TimesheetReport    |     |   CreateTimesheetModal |
|  (only shows entries)  | <-- |  (manual timesheet)    |
+------------------------+     +------------------------+
            |                            |
            v                            v
+--------------------------------------------------+
|               timesheet_entries table            |
|  - patient_id, notes, duration_seconds           |
|  - time_type (PCM, CCM, TCM)                     |
|  - source (notes, manual)                        |
|  - encounter_id (optional reference)             |
+--------------------------------------------------+
```

---

## Implementation Steps

### Step 1: Create Database Table

Create a new `timesheet_entries` table to store dedicated timesheet records:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| patient_id | uuid | Foreign key to patients |
| staff_user_id | uuid | Staff member who created |
| encounter_id | uuid (nullable) | Optional link to encounter |
| duration_seconds | integer | Time spent |
| notes | text | Notes for this entry |
| time_type | enum | PCM, CCM, or TCM |
| source | text | "notes" or "manual" |
| created_at | timestamp | When entry was created |

Include RLS policies for authenticated users.

### Step 2: Create CreateTimesheetModal Component

Create `src/components/CreateTimesheetModal.tsx`:

- Patient dropdown selector (fetches from patients table)
- Notes textarea input
- Time type radio buttons (PCM, CCM, TCM)
- Live timer display (same pattern as RetroactiveNotesModal)
- Save button that creates timesheet_entries record

### Step 3: Update RetroactiveNotesModal

Modify `src/components/RetroactiveNotesModal.tsx`:

- Add time_type selector (PCM, CCM, TCM)
- Instead of updating encounter's `total_duration_seconds`, insert into `timesheet_entries` table
- Set source = "notes" and link to the encounter_id

### Step 4: Refactor TimesheetReport

Update `src/components/TimesheetReport.tsx`:

- Add "Create Timesheet" button in the header
- Change data source from `cgm_encounters` to `timesheet_entries`
- Display time_type column (PCM/CCM/TCM)
- Update daily summary to aggregate timesheet entries
- Update CSV export format

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/migrations/XXXXXX_create_timesheet_entries.sql` | Database schema |
| `src/components/CreateTimesheetModal.tsx` | Manual timesheet entry modal |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/RetroactiveNotesModal.tsx` | Add time_type, save to timesheet_entries |
| `src/components/TimesheetReport.tsx` | Add button, switch data source, show time_type |

---

## Technical Details

### Database Migration SQL

```sql
-- Create time_type enum
CREATE TYPE time_type AS ENUM ('PCM', 'CCM', 'TCM');

-- Create timesheet_entries table
CREATE TABLE timesheet_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id),
  staff_user_id uuid NOT NULL,
  encounter_id uuid REFERENCES cgm_encounters(id),
  duration_seconds integer NOT NULL,
  notes text,
  time_type time_type NOT NULL DEFAULT 'PCM',
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE timesheet_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view entries"
  ON timesheet_entries FOR SELECT USING (true);

CREATE POLICY "Staff can create entries"
  ON timesheet_entries FOR INSERT
  WITH CHECK (auth.uid() = staff_user_id);

CREATE POLICY "Staff can update own entries"
  ON timesheet_entries FOR UPDATE
  USING (auth.uid() = staff_user_id);

CREATE POLICY "Staff can delete own entries"
  ON timesheet_entries FOR DELETE
  USING (auth.uid() = staff_user_id);

-- Create index for performance
CREATE INDEX idx_timesheet_entries_created ON timesheet_entries(created_at);
CREATE INDEX idx_timesheet_entries_patient ON timesheet_entries(patient_id);
```

### CreateTimesheetModal Component

Key features:
- Fetch patients list with Select dropdown
- Time type radio group (PCM/CCM/TCM)
- Timer display using same pattern as RetroactiveNotesModal
- Insert to timesheet_entries with source = "manual"

### Updated TimesheetReport Query

```typescript
const { data } = await supabase
  .from('timesheet_entries')
  .select(`
    id,
    duration_seconds,
    notes,
    time_type,
    source,
    created_at,
    patients (first_name, last_name)
  `)
  .gte('created_at', `${startDate}T00:00:00`)
  .lte('created_at', `${endDate}T23:59:59`)
  .order('created_at', { ascending: true });
```

### UI Changes to TimesheetReport

1. Add button next to "Export CSV":
```
[+ Create Timesheet]  [Export CSV]
```

2. Update table columns:
- Date
- Patient
- Type (PCM/CCM/TCM badge)
- Source (Notes/Manual badge)
- Duration
- Notes preview

3. Update summary cards:
- Total Entries (instead of Encounters)
- Total Time (unchanged)
- Average Duration (unchanged)

---

## Migration Path for Existing Data

The retroactive notes that were previously adding time to encounters will NOT automatically migrate. Going forward:
- New retroactive notes will create timesheet_entries
- Existing encounter duration_seconds remains unchanged (preserves historical encounter times)

