import { z } from 'zod';

// Patient Basic Info Schema
export const patientBasicInfoSchema = z.object({
  first_name: z.string().min(2, 'Jméno musí mít alespoň 2 znaky'),
  last_name: z.string().min(2, 'Příjmení musí mít alespoň 2 znaky'),
  birth_date: z.date({ required_error: 'Datum narození je povinné' }),
  birth_number: z.string().regex(/^\d{9,10}$/, 'Rodné číslo musí mít 9-10 číslic'),
  insurance_number: z.string().optional(),
  insurance_company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Neplatný email').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
});

// Pregnancy Info Schema
export const pregnancyInfoSchema = z.object({
  lmp_date: z.date({ required_error: 'Datum poslední menstruace je povinné' }),
  edd_date: z.date().optional(),
  gestational_weeks: z.number().min(0).max(42).optional(),
  gestational_days: z.number().min(0).max(6).optional(),
  is_high_risk: z.boolean().default(false),
});

// Health History Schema
export const healthHistorySchema = z.object({
  chronic_diseases: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  surgeries: z.array(z.string()).default([]),
  family_history: z.string().optional(),
  smoking: z.boolean().default(false),
  alcohol: z.boolean().default(false),
  other_notes: z.string().optional(),
});

// Previous Pregnancies Schema
export const previousPregnanciesSchema = z.object({
  number_of_pregnancies: z.number().min(0).default(0),
  number_of_births: z.number().min(0).default(0),
  number_of_miscarriages: z.number().min(0).default(0),
  previous_complications: z.string().optional(),
  pregnancies: z
    .array(
      z.object({
        year: z.number().min(1900).max(new Date().getFullYear()),
        outcome: z.enum(['birth', 'miscarriage', 'abortion', 'stillbirth']),
        complications: z.string().optional(),
      }),
    )
    .default([]),
});

// GDPR Consent Schema
export const gdprConsentSchema = z.object({
  gdpr_consent: z.boolean().refine(val => val === true, {
    message: 'Souhlas se zpracováním osobních údajů je povinný',
  }),
  notes: z.string().optional(),
});

// Complete Form Schema
export const completeQuestionnaireSchema = z.object({
  patient: patientBasicInfoSchema,
  pregnancy: pregnancyInfoSchema,
  health_history: healthHistorySchema,
  previous_pregnancies: previousPregnanciesSchema,
  gdpr: gdprConsentSchema,
});

export type PatientBasicInfo = z.infer<typeof patientBasicInfoSchema>;
export type PregnancyInfo = z.infer<typeof pregnancyInfoSchema>;
export type HealthHistory = z.infer<typeof healthHistorySchema>;
export type PreviousPregnancies = z.infer<typeof previousPregnanciesSchema>;
export type GdprConsent = z.infer<typeof gdprConsentSchema>;
export type CompleteQuestionnaire = z.infer<typeof completeQuestionnaireSchema>;
