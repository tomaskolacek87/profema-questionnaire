'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Form, Input, Button, Steps, message, Typography, Spin, Result, Checkbox, DatePicker, Space } from 'antd';
import { CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface PatientData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface TokenValidation {
  patient: PatientData;
  token_id: string;
  expires_at: string;
}

export default function QuestionnaireTokenPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validationData, setValidationData] = useState<TokenValidation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/magic-links/validate/${token}`
      );
      setValidationData(response.data);

      // Prefill patient name
      form.setFieldsValue({
        first_name: response.data.patient.first_name,
        last_name: response.data.patient.last_name,
      });

      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Neplatný nebo expirovaný odkaz');
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/magic-links/submit/${token}`,
        {
          ...values,
          last_period_date: values.last_period_date?.format('YYYY-MM-DD'),
          expected_delivery_date: values.expected_delivery_date?.format('YYYY-MM-DD'),
        }
      );

      message.success('Dotazník byl úspěšně odeslán!');
      setSubmitted(true);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Chyba při odesílání dotazníku');
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    form
      .validateFields()
      .then(() => {
        setCurrentStep(currentStep + 1);
      })
      .catch(() => {
        message.error('Prosím vyplňte všechna povinná pole');
      });
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 24 }}>
        <Result
          status="error"
          title="Neplatný odkaz"
          subTitle={error}
          extra={
            <Text type="secondary">
              Pokud potřebujete vyplnit dotazník, kontaktujte prosím svého lékaře.
            </Text>
          }
        />
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 24 }}>
        <Result
          status="success"
          title="Děkujeme!"
          subTitle="Váš dotazník byl úspěšně odeslán. MUDr. Frisová se s ním seznámí před Vaší návštěvou."
          icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
        />
      </div>
    );
  }

  const steps = [
    { title: 'Základní údaje' },
    { title: 'Těhotenství' },
    { title: 'Zdravotní stav' },
    { title: 'Souhlas GDPR' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Card>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 8 }}>
            Gynekologický dotazník
          </Title>
          <Paragraph style={{ textAlign: 'center', color: '#666', marginBottom: 32 }}>
            MUDr. Veronika Frisová - Profema
          </Paragraph>

          {validationData && (
            <div style={{ background: '#e6f7ff', padding: 16, borderRadius: 6, marginBottom: 24 }}>
              <Text strong>Dobrý den {validationData.patient.first_name} {validationData.patient.last_name},</Text>
              <br />
              <Text type="secondary">Prosím vyplňte tento dotazník před Vaší návštěvou.</Text>
            </div>
          )}

          <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

          <Form form={form} layout="vertical" onFinish={onFinish}>
            {/* STEP 0: Základní údaje */}
            {currentStep === 0 && (
              <div>
                <Form.Item name="first_name" label="Jméno" rules={[{ required: true }]}>
                  <Input size="large" disabled />
                </Form.Item>
                <Form.Item name="last_name" label="Příjmení" rules={[{ required: true }]}>
                  <Input size="large" disabled />
                </Form.Item>
              </div>
            )}

            {/* STEP 1: Těhotenství */}
            {currentStep === 1 && (
              <div>
                <Form.Item name="last_period_date" label="Datum poslední menstruace">
                  <DatePicker size="large" style={{ width: '100%' }} format="DD.MM.YYYY" />
                </Form.Item>
                <Form.Item name="expected_delivery_date" label="Očekávaný termín porodu">
                  <DatePicker size="large" style={{ width: '100%' }} format="DD.MM.YYYY" />
                </Form.Item>
                <Form.Item name="pregnancy_number" label="Kolikáté těhotenství">
                  <Input size="large" placeholder="např. první, druhé..." />
                </Form.Item>
              </div>
            )}

            {/* STEP 2: Zdravotní stav */}
            {currentStep === 2 && (
              <div>
                <Form.Item name="has_chronic_conditions" valuePropName="checked">
                  <Checkbox>Mám chronické onemocnění</Checkbox>
                </Form.Item>
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.has_chronic_conditions !== currentValues.has_chronic_conditions
                  }
                >
                  {({ getFieldValue }) =>
                    getFieldValue('has_chronic_conditions') ? (
                      <Form.Item name="chronic_conditions" label="Jaké onemocnění">
                        <TextArea rows={3} />
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>

                <Form.Item name="takes_medications" valuePropName="checked">
                  <Checkbox>Užívám léky</Checkbox>
                </Form.Item>
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.takes_medications !== currentValues.takes_medications
                  }
                >
                  {({ getFieldValue }) =>
                    getFieldValue('takes_medications') ? (
                      <Form.Item name="medications" label="Jaké léky">
                        <TextArea rows={3} />
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>

                <Form.Item name="has_allergies" valuePropName="checked">
                  <Checkbox>Mám alergie</Checkbox>
                </Form.Item>
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.has_allergies !== currentValues.has_allergies
                  }
                >
                  {({ getFieldValue }) =>
                    getFieldValue('has_allergies') ? (
                      <Form.Item name="allergies" label="Jaké alergie">
                        <TextArea rows={3} />
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>

                <Form.Item name="additional_notes" label="Další poznámky">
                  <TextArea rows={4} placeholder="Cokoli dalšího, co bychom měli vědět..." />
                </Form.Item>
              </div>
            )}

            {/* STEP 3: GDPR */}
            {currentStep === 3 && (
              <div>
                <Card style={{ background: '#fafafa', marginBottom: 24 }}>
                  <Paragraph>
                    <Text strong>Souhlas se zpracováním osobních údajů</Text>
                  </Paragraph>
                  <Paragraph type="secondary" style={{ fontSize: 13 }}>
                    Souhlasím se zpracováním mých osobních údajů a zdravotních informací
                    pro účely poskytování zdravotní péče v gynekologické ordinaci MUDr. Veroniky Frisové.
                    Moje údaje budou uchovávány v souladu s GDPR a zákonem o zdravotních službách.
                  </Paragraph>
                </Card>

                <Form.Item
                  name="gdpr_consent"
                  valuePropName="checked"
                  rules={[{ required: true, message: 'Pro odeslání dotazníku je nutný souhlas' }]}
                >
                  <Checkbox>
                    <Text strong>Souhlasím se zpracováním osobních údajů</Text>
                  </Checkbox>
                </Form.Item>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ marginTop: 32, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              {currentStep > 0 && (
                <Button size="large" onClick={prev}>
                  Zpět
                </Button>
              )}
              {currentStep < steps.length - 1 && (
                <Button type="primary" size="large" onClick={next}>
                  Další
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button type="primary" size="large" htmlType="submit" loading={submitting}>
                  Odeslat dotazník
                </Button>
              )}
            </div>
          </Form>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 24, color: '#999', fontSize: 12 }}>
          <Text type="secondary">Profema - Gynekologická ordinace MUDr. Veroniky Frisové</Text>
        </div>
      </div>
    </div>
  );
}
