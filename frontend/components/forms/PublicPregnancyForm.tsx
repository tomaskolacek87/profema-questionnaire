'use client';

import { useState } from 'react';
import { Form, Input, Button, Steps, message, DatePicker, Radio, InputNumber, Space, Divider, Checkbox, Select } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, SaveOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const insuranceCompanies = [
  { value: '111', label: 'VZP - Všeobecná zdravotní pojišťovna' },
  { value: '201', label: 'VoZP - Vojenská zdravotní pojišťovna' },
  { value: '205', label: 'ČPZP - Česká průmyslová zdravotní pojišťovna' },
  { value: '207', label: 'OZP - Oborová zdravotní pojišťovna' },
  { value: '209', label: 'ZPŠ - Zaměstnanecká pojišťovna Škoda' },
  { value: '211', label: 'ZPMV - Zdravotní pojišťovna ministerstva vnitra' },
  { value: '213', label: 'RBP - Revírní bratrská pokladna' },
];

interface PublicPregnancyFormProps {
  token: string;
  initialData: any;
  onSuccess: () => void;
}

export default function PublicPregnancyForm({ token, initialData, onSuccess }: PublicPregnancyFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Pre-fill form with initial data
  if (initialData && Object.keys(form.getFieldsValue()).length === 0) {
    form.setFieldsValue({
      ...initialData.basic_info,
      birth_date: initialData.basic_info?.birth_date ? dayjs(initialData.basic_info.birth_date) : null,
    });
  }

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/questionnaires/public/${token}`,
        {
          basic_info: {
            first_name: values.first_name,
            last_name: values.last_name,
            title: values.title,
            birth_number: values.birth_number,
            birth_date: values.birth_date?.toISOString(),
            insurance_company: values.insurance_company,
            phone: values.phone,
            email: values.email,
            address: values.address,
          },
          pregnancy_info: {
            last_menstruation: values.last_menstruation?.toISOString(),
            expected_due_date: values.expected_due_date?.toISOString(),
            pregnancy_week: values.pregnancy_week,
            weight_before_pregnancy_kg: values.weight_before_pregnancy,
            height_cm: values.height,
          },
          health_history: {
            allergies: values.allergies,
            medications: values.medications,
            chronic_diseases: values.chronic_diseases,
          },
          previous_pregnancies: {
            pregnancies_count: values.pregnancies_count || 0,
            births_count: values.births_count || 0,
            miscarriages_count: values.miscarriages_count || 0,
            abortions_count: values.abortions_count || 0,
          },
          additional_notes: {
            notes: values.notes,
          },
          gdpr_consent: {
            gdpr_consent: values.gdpr_consent,
            data_processing_consent: values.data_processing_consent,
            scientific_use_consent: values.scientific_use_consent,
          },
          status: 'completed',
          completed_at: new Date(),
        }
      );

      message.success('Dotazník byl úspěšně odeslán!');
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting questionnaire:', error);
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

  const steps = [
    { title: 'Základní údaje' },
    { title: 'Těhotenství' },
    { title: 'Zdravotní stav' },
    { title: 'Souhlas' },
  ];

  return (
    <div>
      <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* KROK 1: Základní údaje */}
        {currentStep === 0 && (
          <div>
            <Form.Item label="Titul" name="title">
              <Input placeholder="MUDr., Ing., ..." />
            </Form.Item>

            <Form.Item label="Jméno" name="first_name" rules={[{ required: true, message: 'Jméno je povinné' }]}>
              <Input placeholder="Jana" />
            </Form.Item>

            <Form.Item label="Příjmení" name="last_name" rules={[{ required: true, message: 'Příjmení je povinné' }]}>
              <Input placeholder="Nováková" />
            </Form.Item>

            <Form.Item label="Rodné číslo" name="birth_number" rules={[{ required: true, message: 'Rodné číslo je povinné' }]}>
              <Input placeholder="9501011234" maxLength={10} />
            </Form.Item>

            <Form.Item label="Datum narození" name="birth_date">
              <DatePicker format="DD.MM.YYYY" placeholder="Vyberte datum" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="Pojišťovna" name="insurance_company">
              <Select placeholder="Vyberte pojišťovnu" showSearch optionFilterProp="label">
                {insuranceCompanies.map(ic => (
                  <Option key={ic.value} value={ic.label}>{ic.label}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Telefon" name="phone">
              <Input placeholder="+420 123 456 789" />
            </Form.Item>

            <Form.Item label="Email" name="email">
              <Input type="email" placeholder="jana@email.cz" />
            </Form.Item>

            <Form.Item label="Adresa" name="address">
              <Input placeholder="Ulice a číslo popisné, město, PSČ" />
            </Form.Item>
          </div>
        )}

        {/* KROK 2: Těhotenství */}
        {currentStep === 1 && (
          <div>
            <Divider orientation="left">Aktuální těhotenství</Divider>

            <Form.Item label="Datum poslední menstruace" name="last_menstruation">
              <DatePicker format="DD.MM.YYYY" placeholder="Vyberte datum" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="Předpokládaný termín porodu" name="expected_due_date">
              <DatePicker format="DD.MM.YYYY" placeholder="Vyberte datum" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="Týden těhotenství" name="pregnancy_week">
              <InputNumber min={1} max={43} placeholder="0" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="Váha před těhotenstvím (kg)" name="weight_before_pregnancy">
              <InputNumber min={30} max={200} placeholder="65" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="Výška (cm)" name="height">
              <InputNumber min={100} max={250} placeholder="165" style={{ width: '100%' }} />
            </Form.Item>

            <Divider orientation="left">Předchozí těhotenství</Divider>

            <Form.Item label="Počet předchozích těhotenství" name="previous_pregnancies_count">
              <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="Počet porodů" name="births_count">
              <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="Počet potratů" name="miscarriages_count">
              <InputNumber min={0} placeholder="0" style={{ width: '100%' }} />
            </Form.Item>
          </div>
        )}

        {/* KROK 3: Zdravotní stav */}
        {currentStep === 2 && (
          <div>
            <Divider orientation="left">Zdravotní stav</Divider>

            <Form.Item label="Alergie" name="allergies">
              <TextArea rows={3} placeholder="Uveďte případné alergie (léky, potraviny...)..." />
            </Form.Item>

            <Form.Item label="Užívané léky" name="medications">
              <TextArea rows={3} placeholder="Jaké léky pravidelně užíváte?..." />
            </Form.Item>

            <Form.Item label="Chronická onemocnění" name="chronic_diseases">
              <TextArea rows={3} placeholder="Diabetes, vysoký tlak, astma..." />
            </Form.Item>

            <Form.Item label="Další poznámky" name="notes">
              <TextArea rows={4} placeholder="Další informace, které považujete za důležité..." />
            </Form.Item>
          </div>
        )}

        {/* KROK 4: GDPR a souhlas */}
        {currentStep === 3 && (
          <div>
            <div style={{
              background: '#f0f5ff',
              border: '1px solid #adc6ff',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{ marginTop: 0 }}>Zpracování osobních údajů</h3>
              <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#595959' }}>
                V souladu s nařízením GDPR Vás žádáme o souhlas se zpracováním Vašich osobních údajů
                pro účely poskytování zdravotní péče a vedení zdravotnické dokumentace.
              </p>
            </div>

            <Form.Item
              name="gdpr_consent"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('Musíte souhlasit se zpracováním údajů')),
                },
              ]}
            >
              <Checkbox>
                <strong>Souhlasím se zpracováním osobních údajů</strong> pro účely poskytování zdravotní péče
              </Checkbox>
            </Form.Item>

            <Form.Item name="data_processing_consent" valuePropName="checked">
              <Checkbox>
                Souhlasím s uchováním a zpracováním zdravotnické dokumentace
              </Checkbox>
            </Form.Item>

            <Form.Item name="scientific_use_consent" valuePropName="checked">
              <Checkbox>
                Souhlasím s využitím anonymizovaných údajů pro vědecké a výzkumné účely
              </Checkbox>
            </Form.Item>
          </div>
        )}

        {/* Navigace */}
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
          {currentStep > 0 && (
            <Button icon={<ArrowLeftOutlined />} onClick={prev}>
              Zpět
            </Button>
          )}

          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={next} style={{ marginLeft: 'auto' }}>
              Další <ArrowRightOutlined />
            </Button>
          )}

          {currentStep === steps.length - 1 && (
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              icon={<SaveOutlined />}
              size="large"
              style={{
                marginLeft: 'auto',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                border: 'none'
              }}
            >
              Odeslat dotazník
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
}
