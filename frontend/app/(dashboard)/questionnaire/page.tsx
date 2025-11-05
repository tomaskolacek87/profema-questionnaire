'use client';

import { useState } from 'react';
import { Steps, Button, message, Card } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import PatientBasicInfo from '@/components/forms/PatientBasicInfo';
import PregnancyInfo from '@/components/forms/PregnancyInfo';
import HealthHistory from '@/components/forms/HealthHistory';
import PreviousPregnancies from '@/components/forms/PreviousPregnancies';
import GDPRConsent from '@/components/forms/GDPRConsent';
import { patientsApi, questionnairesApi } from '@/lib/api';

const steps = [
  { title: 'Základní údaje', key: 'basic' },
  { title: 'Těhotenství', key: 'pregnancy' },
  { title: 'Zdravotní anamnéza', key: 'health' },
  { title: 'Předchozí těhotenství', key: 'previous' },
  { title: 'GDPR & Dokončení', key: 'gdpr' },
];

export default function QuestionnairePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingPatientId = searchParams.get('patientId');

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    patient: {},
    pregnancy: {},
    health_history: {},
    previous_pregnancies: {},
    gdpr: {},
  });

  const handleNext = (stepData: any) => {
    const stepKey = steps[currentStep].key;
    const updatedFormData = { ...formData };

    switch (stepKey) {
      case 'basic':
        updatedFormData.patient = stepData;
        break;
      case 'pregnancy':
        updatedFormData.pregnancy = stepData;
        break;
      case 'health':
        updatedFormData.health_history = stepData;
        break;
      case 'previous':
        updatedFormData.previous_pregnancies = stepData;
        break;
      case 'gdpr':
        updatedFormData.gdpr = stepData;
        break;
    }

    setFormData(updatedFormData);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (gdprData: any) => {
    setLoading(true);
    try {
      const finalData = { ...formData, gdpr: gdprData };

      // Step 1: Create or update patient with DUAL WRITE
      const patientData = {
        ...finalData.patient,
        ...finalData.pregnancy,
        gdpr_consent: finalData.gdpr.gdpr_consent,
        notes: finalData.gdpr.notes,
      };

      let patientId = existingPatientId;

      if (!existingPatientId) {
        const patientResponse = await patientsApi.create(patientData);
        patientId = patientResponse.data.id;
        message.success('Pacientka vytvořena v obou databázích (Profema + Astraia)!');
      }

      // Step 2: Create questionnaire
      const questionnaireData = {
        patient_id: patientId,
        basic_info: finalData.patient,
        pregnancy_info: finalData.pregnancy,
        health_history: finalData.health_history,
        previous_pregnancies: finalData.previous_pregnancies,
        additional_notes: finalData.gdpr.notes,
        status: 'completed',
      };

      await questionnairesApi.create(questionnaireData);

      message.success('Dotazník úspěšně vytvořen!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Submit error:', error);
      message.error(error.response?.data?.message || 'Chyba při ukládání dotazníku');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <PatientBasicInfo initialData={formData.patient} onNext={handleNext} />;
      case 1:
        return (
          <PregnancyInfo
            initialData={formData.pregnancy}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <HealthHistory
            initialData={formData.health_history}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <PreviousPregnancies
            initialData={formData.previous_pregnancies}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <GDPRConsent
            initialData={formData.gdpr}
            onSubmit={handleSubmit}
            onBack={handleBack}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Card>
        <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />
        {renderStepContent()}
      </Card>
    </div>
  );
}
