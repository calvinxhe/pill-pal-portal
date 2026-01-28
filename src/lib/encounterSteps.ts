export interface EncounterStep {
  key: string;
  label: string;
  order: number;
  subSteps?: string[];
  hasInput?: 'copay' | 'serial';
  hasAction?: 'junction-link';
}

export const CGM_ENCOUNTER_STEPS: EncounterStep[] = [
  {
    key: 'intake_form',
    label: 'Intake Form Complete',
    order: 1,
  },
  {
    key: 'front_desk_verification',
    label: 'Front-Desk Verification',
    order: 2,
    subSteps: [
      'RX validated',
      'Insurance verified',
      'Omni confirmation slip collected',
      'Patient ID checked',
    ],
  },
  {
    key: 'patient_seated_consent',
    label: 'Patient Seated + Consent Form Given',
    order: 3,
  },
  {
    key: 'omni_portal_timer',
    label: 'Omni Portal Open + Timer Started',
    order: 4,
  },
  {
    key: 'confirm_active_rx',
    label: 'Confirm Active RX in System',
    order: 5,
  },
  {
    key: 'cgm_checklist_prep',
    label: 'CGM Checklist Prep Complete',
    order: 6,
  },
  {
    key: 'collect_copay',
    label: 'Collect Copay',
    order: 7,
    hasInput: 'copay',
  },
  {
    key: 'apply_cgm_sensor',
    label: 'Apply CGM Sensor',
    order: 8,
    hasInput: 'serial',
  },
  {
    key: 'pair_phone_app',
    label: 'Pair Phone/App with Omni',
    order: 9,
    hasAction: 'junction-link',
  },
  {
    key: 'verify_data_sync',
    label: 'Verify Data Coming Through',
    order: 10,
  },
  {
    key: 'refill_reminder',
    label: 'Provide Refill Reminder',
    order: 11,
  },
];
