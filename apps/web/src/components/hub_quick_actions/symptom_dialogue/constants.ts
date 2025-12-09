export const SYMPTOM_TYPES = [
  { value: 'headache', label: 'Headache' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'nausea', label: 'Nausea' },
  { value: 'dizziness', label: 'Dizziness' },
  { value: 'pain', label: 'Pain' },
  { value: 'fever', label: 'Fever' },
  { value: 'cough', label: 'Cough' },
  { value: 'shortness-of-breath', label: 'Shortness of breath' }
] as const

export const SEVERITY_LABELS = {
  1: 'Light',
  2: 'Mild',
  3: 'Moderate',
  4: 'Severe',
  5: 'Very severe'
} as const
