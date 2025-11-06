'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Form, Input, Button, Steps, message, Typography, Checkbox, DatePicker, Space, InputNumber, Spin, Radio, Table, Divider, Row, Col, Layout, Avatar, Badge, Tooltip, Select } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, UserOutlined, FileTextOutlined, LogoutOutlined, BellOutlined, DashboardOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Header, Content } = Layout;
const { Option } = Select;

function GynecologyQuestionnaireForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');

  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [pregnancies, setPregnancies] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/questionnaires`,
        {
          patient_id: patientId,
          type: 'gynecology',
          basic_info: {
            first_name: values.first_name,
            last_name: values.last_name,
            title: values.title,
            birth_number: values.birth_number,
            address: values.address,
            phone: values.phone,
            email: values.email,
            insurance_company: values.insurance_company,
          },
          menstruation_info: {
            height_cm: values.height_cm,
            weight_kg: values.weight_kg,
            last_period_date: values.last_period_date?.format('YYYY-MM-DD'),
            menstrual_cycle_regular: values.menstrual_cycle_regular,
            hormonal_contraception: values.hormonal_contraception,
            contraception_name: values.contraception_name,
          },
          gynecological_history: {
            cervical_cancer_vaccination: values.cervical_cancer_vaccination,
            vaccination_year: values.vaccination_year,
            vaccine_name: values.vaccine_name,
            cervical_surgery: values.cervical_surgery,
            surgery_year: values.surgery_year,
          },
          health_history: {
            chronic_disease: values.chronic_disease,
            chronic_disease_type: values.chronic_disease_type,
            chronic_disease_year: values.chronic_disease_year,
            chronic_disease_medication: values.chronic_disease_medication,
            oncological_disease: values.oncological_disease,
            oncology_year: values.oncology_year,
            oncology_treatment: values.oncology_treatment,
            surgery: values.surgery,
            surgery_year: values.surgery_year,
            surgery_description: values.surgery_description,
          },
          family_history: {
            family_diseases: values.family_diseases,
          },
          pregnancy_history: pregnancies,
          pregnancy_complications: {
            ectopic_pregnancy: values.ectopic_pregnancy,
            ectopic_year: values.ectopic_year,
            termination: values.termination,
            termination_year: values.termination_year,
            termination_week: values.termination_week,
            miscarriage: values.miscarriage,
            miscarriage_year: values.miscarriage_year,
            miscarriage_week: values.miscarriage_week,
          },
          additional_notes: {
            gdpr_consent: values.gdpr_consent,
            data_processing_consent: values.data_processing_consent,
            scientific_use_consent: values.scientific_use_consent,
          },
          status: 'completed',
          completed_at: new Date(),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          }
        }
      );

      message.success('Gynekologický dotazník byl úspěšně uložen!');
      router.push('/questionnaires');
    } catch (error: any) {
      console.error('Error saving questionnaire:', error);
      message.error(error.response?.data?.message || 'Chyba při ukládání dotazníku');
    } finally {
      setSubmitting(false);
    }
  };

  const addPregnancy = () => {
    setPregnancies([...pregnancies, {
      id: Date.now(),
      birth_date: null,
      pregnancy_week: null,
      delivery_method: '',
      birth_weight: null,
      birth_length: null,
      gender: '',
      health_status: '',
    }]);
  };

  const removePregnancy = (id: number) => {
    setPregnancies(pregnancies.filter(p => p.id !== id));
  };

  const updatePregnancy = (id: number, field: string, value: any) => {
    setPregnancies(pregnancies.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
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
    { title: 'Menstruace' },
    { title: 'Gynekologická anamnéza' },
    { title: 'Zdravotní stav' },
    { title: 'Těhotenství' },
    { title: 'GDPR' },
  ];

  return (
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/questionnaires')}
              style={{ marginBottom: 24, background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}
            >
              Zpět
            </Button>

            <Card
              style={{
                background: '#16213e',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12
              }}
            >
              <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                  menstrual_cycle_regular: true,
                  hormonal_contraception: false,
                  cervical_cancer_vaccination: false,
                  cervical_surgery: false,
                  chronic_disease: false,
                  oncological_disease: false,
                  surgery: false,
                  ectopic_pregnancy: false,
                  termination: false,
                  miscarriage: false,
                  gdpr_consent: false,
                  data_processing_consent: false,
                  scientific_use_consent: false,
                }}
              >
                {/* KROK 1: ZÁKLADNÍ ÚDAJE */}
                {currentStep === 0 && (
                  <div>
                    <Title level={4} style={{ color: '#ffffff', marginBottom: 24 }}>Základní údaje</Title>

                    <Row gutter={16}>
                      <Col span={6}>
                        <Form.Item name="title" label={<Text style={{ color: '#ffffff' }}>Titul</Text>}>
                          <Input size="large" placeholder="MUDr., Ing..." />
                        </Form.Item>
                      </Col>
                      <Col span={9}>
                        <Form.Item
                          name="first_name"
                          label={<Text style={{ color: '#ffffff' }}>Jméno</Text>}
                          rules={[{ required: true, message: 'Povinné pole' }]}
                        >
                          <Input size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={9}>
                        <Form.Item
                          name="last_name"
                          label={<Text style={{ color: '#ffffff' }}>Příjmení</Text>}
                          rules={[{ required: true, message: 'Povinné pole' }]}
                        >
                          <Input size="large" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="birth_number"
                          label={<Text style={{ color: '#ffffff' }}>Rodné číslo / číslo pojištěnce</Text>}
                        >
                          <Input size="large" placeholder="000000/0000" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="insurance_company"
                          label={<Text style={{ color: '#ffffff' }}>Zdravotní pojišťovna</Text>}
                        >
                          <Select size="large" placeholder="Vyberte pojišťovnu">
                            <Option value="111">111 - VZP</Option>
                            <Option value="201">201 - VOZP</Option>
                            <Option value="205">205 - ČPZP</Option>
                            <Option value="207">207 - OZP</Option>
                            <Option value="209">209 - ZPŠ</Option>
                            <Option value="211">211 - ZPMV</Option>
                            <Option value="213">213 - RBP</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="address"
                      label={<Text style={{ color: '#ffffff' }}>Adresa, včetně PSČ</Text>}
                    >
                      <Input size="large" placeholder="Ulice čp., Město, PSČ" />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="phone"
                          label={<Text style={{ color: '#ffffff' }}>Telefon</Text>}
                        >
                          <Input size="large" placeholder="+420 777 888 999" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="email"
                          label={<Text style={{ color: '#ffffff' }}>E-mail</Text>}
                          rules={[{ type: 'email', message: 'Neplatný email' }]}
                        >
                          <Input size="large" placeholder="email@example.com" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* KROK 2: MENSTRUACE */}
                {currentStep === 1 && (
                  <div>
                    <Title level={4} style={{ color: '#ffffff', marginBottom: 24 }}>Menstruace a antikoncepce</Title>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="height_cm"
                          label={<Text style={{ color: '#ffffff' }}>Výška (cm)</Text>}
                        >
                          <InputNumber size="large" style={{ width: '100%' }} min={100} max={250} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="weight_kg"
                          label={<Text style={{ color: '#ffffff' }}>Váha (kg)</Text>}
                        >
                          <InputNumber size="large" style={{ width: '100%' }} min={30} max={200} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="last_period_date"
                      label={<Text style={{ color: '#ffffff' }}>Datum poslední menstruace</Text>}
                    >
                      <DatePicker size="large" style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Vyberte datum" />
                    </Form.Item>

                    <Form.Item
                      name="menstrual_cycle_regular"
                      label={<Text style={{ color: '#ffffff' }}>Menstruační cyklus</Text>}
                    >
                      <Radio.Group size="large">
                        <Radio value={true}>Pravidelný</Radio>
                        <Radio value={false}>Nepravidelný</Radio>
                      </Radio.Group>
                    </Form.Item>

                    <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                    <Form.Item
                      name="hormonal_contraception"
                      valuePropName="checked"
                    >
                      <Checkbox style={{ color: '#ffffff' }}>
                        <Text strong style={{ color: '#ffffff' }}>Hormonální antikoncepce</Text>
                      </Checkbox>
                    </Form.Item>

                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) => prevValues.hormonal_contraception !== currentValues.hormonal_contraception}
                    >
                      {({ getFieldValue }) =>
                        getFieldValue('hormonal_contraception') ? (
                          <Form.Item
                            name="contraception_name"
                            label={<Text style={{ color: '#ffffff' }}>Název přípravku</Text>}
                          >
                            <Input size="large" placeholder="Uveďte název přípravku" />
                          </Form.Item>
                        ) : null
                      }
                    </Form.Item>
                  </div>
                )}

                {/* KROK 3: GYNEKOLOGICKÁ ANAMNÉZA */}
                {currentStep === 2 && (
                  <div>
                    <Title level={4} style={{ color: '#ffffff', marginBottom: 24 }}>Gynekologická anamnéza</Title>

                    <Form.Item
                      name="cervical_cancer_vaccination"
                      valuePropName="checked"
                    >
                      <Checkbox style={{ color: '#ffffff' }}>
                        <Text strong style={{ color: '#ffffff' }}>Podstoupila jste očkování proti rakovině děložního čípku?</Text>
                      </Checkbox>
                    </Form.Item>

                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) => prevValues.cervical_cancer_vaccination !== currentValues.cervical_cancer_vaccination}
                    >
                      {({ getFieldValue }) =>
                        getFieldValue('cervical_cancer_vaccination') ? (
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                name="vaccination_year"
                                label={<Text style={{ color: '#ffffff' }}>Rok aplikace vakcíny</Text>}
                              >
                                <InputNumber size="large" style={{ width: '100%' }} min={1990} max={new Date().getFullYear()} />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                name="vaccine_name"
                                label={<Text style={{ color: '#ffffff' }}>Název vakcíny</Text>}
                              >
                                <Input size="large" placeholder="Gardasil, Cervarix..." />
                              </Form.Item>
                            </Col>
                          </Row>
                        ) : null
                      }
                    </Form.Item>

                    <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                    <Form.Item
                      name="cervical_surgery"
                      valuePropName="checked"
                    >
                      <Checkbox style={{ color: '#ffffff' }}>
                        <Text strong style={{ color: '#ffffff' }}>Podstoupila jste zákroky na děložním čípku (např. konizace)?</Text>
                      </Checkbox>
                    </Form.Item>

                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) => prevValues.cervical_surgery !== currentValues.cervical_surgery}
                    >
                      {({ getFieldValue }) =>
                        getFieldValue('cervical_surgery') ? (
                          <Form.Item
                            name="surgery_year"
                            label={<Text style={{ color: '#ffffff' }}>Rok podstoupení zákroku</Text>}
                          >
                            <InputNumber size="large" style={{ width: '100%' }} min={1990} max={new Date().getFullYear()} />
                          </Form.Item>
                        ) : null
                      }
                    </Form.Item>
                  </div>
                )}

                {/* KROK 4: ZDRAVOTNÍ STAV */}
                {currentStep === 3 && (
                  <div>
                    <Title level={4} style={{ color: '#ffffff', marginBottom: 24 }}>Zdravotní anamnéza</Title>

                    <Form.Item
                      name="chronic_disease"
                      valuePropName="checked"
                    >
                      <Checkbox style={{ color: '#ffffff' }}>
                        <Text strong style={{ color: '#ffffff' }}>Máte jiné dlouhodobé onemocnění?</Text>
                        <br />
                        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                          (diabetes mellitus, onemocnění štítné žlázy, srdeční onem., apod.)
                        </Text>
                      </Checkbox>
                    </Form.Item>

                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) => prevValues.chronic_disease !== currentValues.chronic_disease}
                    >
                      {({ getFieldValue }) =>
                        getFieldValue('chronic_disease') ? (
                          <>
                            <Form.Item
                              name="chronic_disease_type"
                              label={<Text style={{ color: '#ffffff' }}>Typ onemocnění</Text>}
                            >
                              <Input size="large" placeholder="Diabetes, hypertenze, astma..." />
                            </Form.Item>
                            <Row gutter={16}>
                              <Col span={12}>
                                <Form.Item
                                  name="chronic_disease_year"
                                  label={<Text style={{ color: '#ffffff' }}>Rok zjištění</Text>}
                                >
                                  <InputNumber size="large" style={{ width: '100%' }} min={1950} max={new Date().getFullYear()} />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item
                                  name="chronic_disease_medication"
                                  label={<Text style={{ color: '#ffffff' }}>Užívané léky</Text>}
                                >
                                  <Input size="large" placeholder="Názvy léků" />
                                </Form.Item>
                              </Col>
                            </Row>
                          </>
                        ) : null
                      }
                    </Form.Item>

                    <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                    <Form.Item
                      name="oncological_disease"
                      valuePropName="checked"
                    >
                      <Checkbox style={{ color: '#ffffff' }}>
                        <Text strong style={{ color: '#ffffff' }}>Prodělala jste onkologické onemocnění?</Text>
                      </Checkbox>
                    </Form.Item>

                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) => prevValues.oncological_disease !== currentValues.oncological_disease}
                    >
                      {({ getFieldValue }) =>
                        getFieldValue('oncological_disease') ? (
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                name="oncology_year"
                                label={<Text style={{ color: '#ffffff' }}>Rok zjištění onemocnění</Text>}
                              >
                                <InputNumber size="large" style={{ width: '100%' }} min={1950} max={new Date().getFullYear()} />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                name="oncology_treatment"
                                label={<Text style={{ color: '#ffffff' }}>Prodělaná léčba</Text>}
                              >
                                <Input size="large" placeholder="Chemoterapie, radioterapie..." />
                              </Form.Item>
                            </Col>
                          </Row>
                        ) : null
                      }
                    </Form.Item>

                    <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                    <Form.Item
                      name="surgery"
                      valuePropName="checked"
                    >
                      <Checkbox style={{ color: '#ffffff' }}>
                        <Text strong style={{ color: '#ffffff' }}>Prodělala jste operaci?</Text>
                      </Checkbox>
                    </Form.Item>

                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) => prevValues.surgery !== currentValues.surgery}
                    >
                      {({ getFieldValue }) =>
                        getFieldValue('surgery') ? (
                          <Row gutter={16}>
                            <Col span={8}>
                              <Form.Item
                                name="surgery_year"
                                label={<Text style={{ color: '#ffffff' }}>Rok operace</Text>}
                              >
                                <InputNumber size="large" style={{ width: '100%' }} min={1950} max={new Date().getFullYear()} />
                              </Form.Item>
                            </Col>
                            <Col span={16}>
                              <Form.Item
                                name="surgery_description"
                                label={<Text style={{ color: '#ffffff' }}>Popis operace</Text>}
                              >
                                <Input size="large" placeholder="Typ operace, důvod..." />
                              </Form.Item>
                            </Col>
                          </Row>
                        ) : null
                      }
                    </Form.Item>

                    <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                    <Form.Item
                      name="family_diseases"
                      label={
                        <Text strong style={{ color: '#ffffff' }}>
                          Vyskytly se ve Vaší rodině (rodiče, sourozenci, děti) závažná onemocnění či nádorová onemocnění?
                        </Text>
                      }
                    >
                      <TextArea
                        rows={4}
                        placeholder="Popište rodinnou anamnézu..."
                        style={{ fontSize: 16 }}
                      />
                    </Form.Item>
                  </div>
                )}

                {/* KROK 5: TĚHOTENSTVÍ */}
                {currentStep === 4 && (
                  <div>
                    <Title level={4} style={{ color: '#ffffff', marginBottom: 24 }}>Těhotenství</Title>

                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <Text strong style={{ color: '#ffffff', fontSize: 16 }}>Předchozí těhotenství</Text>
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={addPregnancy}
                            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', border: 'none' }}
                          >
                            Přidat těhotenství
                          </Button>
                        </div>

                        {pregnancies.map((pregnancy, index) => (
                          <Card
                            key={pregnancy.id}
                            style={{
                              marginBottom: 16,
                              background: 'rgba(45, 27, 78, 0.3)',
                              border: '1px solid rgba(168, 85, 247, 0.3)'
                            }}
                            title={<Text style={{ color: '#ffffff' }}>Těhotenství #{index + 1}</Text>}
                            extra={
                              <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => removePregnancy(pregnancy.id)}
                              >
                                Smazat
                              </Button>
                            }
                          >
                            <Row gutter={16}>
                              <Col span={8}>
                                <div style={{ marginBottom: 16 }}>
                                  <Text style={{ color: '#ffffff', display: 'block', marginBottom: 8 }}>Datum porodu</Text>
                                  <DatePicker
                                    size="large"
                                    style={{ width: '100%' }}
                                    format="DD.MM.YYYY"
                                    onChange={(date) => updatePregnancy(pregnancy.id, 'birth_date', date)}
                                  />
                                </div>
                              </Col>
                              <Col span={8}>
                                <div style={{ marginBottom: 16 }}>
                                  <Text style={{ color: '#ffffff', display: 'block', marginBottom: 8 }}>Týden těhot.</Text>
                                  <InputNumber
                                    size="large"
                                    style={{ width: '100%' }}
                                    min={20}
                                    max={43}
                                    onChange={(value) => updatePregnancy(pregnancy.id, 'pregnancy_week', value)}
                                  />
                                </div>
                              </Col>
                              <Col span={8}>
                                <div style={{ marginBottom: 16 }}>
                                  <Text style={{ color: '#ffffff', display: 'block', marginBottom: 8 }}>Způsob porodu</Text>
                                  <Select
                                    size="large"
                                    style={{ width: '100%' }}
                                    placeholder="Vyberte"
                                    onChange={(value) => updatePregnancy(pregnancy.id, 'delivery_method', value)}
                                  >
                                    <Option value="spontánní">Spontánní</Option>
                                    <Option value="klešťový">Klešťový</Option>
                                    <Option value="císařský řez">Císařský řez</Option>
                                    <Option value="jiný">Jiný</Option>
                                  </Select>
                                </div>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={6}>
                                <div style={{ marginBottom: 16 }}>
                                  <Text style={{ color: '#ffffff', display: 'block', marginBottom: 8 }}>Porodní váha (g)</Text>
                                  <InputNumber
                                    size="large"
                                    style={{ width: '100%' }}
                                    min={500}
                                    max={6000}
                                    onChange={(value) => updatePregnancy(pregnancy.id, 'birth_weight', value)}
                                  />
                                </div>
                              </Col>
                              <Col span={6}>
                                <div style={{ marginBottom: 16 }}>
                                  <Text style={{ color: '#ffffff', display: 'block', marginBottom: 8 }}>Porodní délka (cm)</Text>
                                  <InputNumber
                                    size="large"
                                    style={{ width: '100%' }}
                                    min={30}
                                    max={70}
                                    onChange={(value) => updatePregnancy(pregnancy.id, 'birth_length', value)}
                                  />
                                </div>
                              </Col>
                              <Col span={6}>
                                <div style={{ marginBottom: 16 }}>
                                  <Text style={{ color: '#ffffff', display: 'block', marginBottom: 8 }}>Pohlaví</Text>
                                  <Select
                                    size="large"
                                    style={{ width: '100%' }}
                                    placeholder="Vyberte"
                                    onChange={(value) => updatePregnancy(pregnancy.id, 'gender', value)}
                                  >
                                    <Option value="chlapec">Chlapec</Option>
                                    <Option value="dívka">Dívka</Option>
                                  </Select>
                                </div>
                              </Col>
                              <Col span={6}>
                                <div style={{ marginBottom: 16 }}>
                                  <Text style={{ color: '#ffffff', display: 'block', marginBottom: 8 }}>Zdrav. stav miminka</Text>
                                  <Input
                                    size="large"
                                    placeholder="Zdravé, komplikace..."
                                    onChange={(e) => updatePregnancy(pregnancy.id, 'health_status', e.target.value)}
                                  />
                                </div>
                              </Col>
                            </Row>
                          </Card>
                        ))}
                      </div>

                      <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                      <div>
                        <Title level={5} style={{ color: '#ffffff', marginBottom: 16 }}>Komplikace</Title>

                        <Form.Item
                          name="ectopic_pregnancy"
                          valuePropName="checked"
                        >
                          <Checkbox style={{ color: '#ffffff' }}>
                            <Text strong style={{ color: '#ffffff' }}>Mimděložní těhotenství</Text>
                          </Checkbox>
                        </Form.Item>

                        <Form.Item
                          noStyle
                          shouldUpdate={(prevValues, currentValues) => prevValues.ectopic_pregnancy !== currentValues.ectopic_pregnancy}
                        >
                          {({ getFieldValue }) =>
                            getFieldValue('ectopic_pregnancy') ? (
                              <Form.Item
                                name="ectopic_year"
                                label={<Text style={{ color: '#ffffff' }}>Rok</Text>}
                              >
                                <InputNumber size="large" style={{ width: '100%' }} min={1990} max={new Date().getFullYear()} />
                              </Form.Item>
                            ) : null
                          }
                        </Form.Item>

                        <Form.Item
                          name="termination"
                          valuePropName="checked"
                        >
                          <Checkbox style={{ color: '#ffffff' }}>
                            <Text strong style={{ color: '#ffffff' }}>Ukončení těhotenství</Text>
                          </Checkbox>
                        </Form.Item>

                        <Form.Item
                          noStyle
                          shouldUpdate={(prevValues, currentValues) => prevValues.termination !== currentValues.termination}
                        >
                          {({ getFieldValue }) =>
                            getFieldValue('termination') ? (
                              <Row gutter={16}>
                                <Col span={12}>
                                  <Form.Item
                                    name="termination_year"
                                    label={<Text style={{ color: '#ffffff' }}>Rok</Text>}
                                  >
                                    <InputNumber size="large" style={{ width: '100%' }} min={1990} max={new Date().getFullYear()} />
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item
                                    name="termination_week"
                                    label={<Text style={{ color: '#ffffff' }}>Týden gravidity</Text>}
                                  >
                                    <InputNumber size="large" style={{ width: '100%' }} min={1} max={43} />
                                  </Form.Item>
                                </Col>
                              </Row>
                            ) : null
                          }
                        </Form.Item>

                        <Form.Item
                          name="miscarriage"
                          valuePropName="checked"
                        >
                          <Checkbox style={{ color: '#ffffff' }}>
                            <Text strong style={{ color: '#ffffff' }}>Spontánní potrat</Text>
                          </Checkbox>
                        </Form.Item>

                        <Form.Item
                          noStyle
                          shouldUpdate={(prevValues, currentValues) => prevValues.miscarriage !== currentValues.miscarriage}
                        >
                          {({ getFieldValue }) =>
                            getFieldValue('miscarriage') ? (
                              <Row gutter={16}>
                                <Col span={12}>
                                  <Form.Item
                                    name="miscarriage_year"
                                    label={<Text style={{ color: '#ffffff' }}>Rok</Text>}
                                  >
                                    <InputNumber size="large" style={{ width: '100%' }} min={1990} max={new Date().getFullYear()} />
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item
                                    name="miscarriage_week"
                                    label={<Text style={{ color: '#ffffff' }}>Týden gravidity</Text>}
                                  >
                                    <InputNumber size="large" style={{ width: '100%' }} min={1} max={43} />
                                  </Form.Item>
                                </Col>
                              </Row>
                            ) : null
                          }
                        </Form.Item>
                      </div>
                    </Space>
                  </div>
                )}

                {/* KROK 6: GDPR */}
                {currentStep === 5 && (
                  <div>
                    <Title level={4} style={{ color: '#ffffff', marginBottom: 24 }}>Souhlasy GDPR</Title>

                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      <Form.Item
                        name="gdpr_consent"
                        valuePropName="checked"
                        rules={[{
                          validator: (_, value) =>
                            value ? Promise.resolve() : Promise.reject(new Error('Musíte souhlasit se zpracováním osobních údajů'))
                        }]}
                      >
                        <Checkbox style={{ color: '#ffffff' }}>
                          <Text strong style={{ color: '#ffffff' }}>
                            Souhlasím se zpracováním osobních údajů pro účely poskytování zdravotní péče
                          </Text>
                        </Checkbox>
                      </Form.Item>

                      <Form.Item
                        name="data_processing_consent"
                        valuePropName="checked"
                      >
                        <Checkbox style={{ color: '#ffffff' }}>
                          <Text style={{ color: '#ffffff' }}>
                            Souhlasím s anonymním zpracováním dat pro vědecké, propagační a výukové účely
                          </Text>
                        </Checkbox>
                      </Form.Item>

                      <Form.Item
                        name="scientific_use_consent"
                        valuePropName="checked"
                      >
                        <Checkbox style={{ color: '#ffffff' }}>
                          <Text style={{ color: '#ffffff' }}>
                            Souhlasím s využitím obrazových záznamů v anonymní podobě pro vědecké účely
                          </Text>
                        </Checkbox>
                      </Form.Item>
                    </Space>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
                  {currentStep > 0 && (
                    <Button size="large" onClick={prev}>
                      Zpět
                    </Button>
                  )}
                  {currentStep < steps.length - 1 && (
                    <Button type="primary" size="large" onClick={next} style={{ marginLeft: 'auto' }}>
                      Další
                    </Button>
                  )}
                  {currentStep === steps.length - 1 && (
                    <Button
                      type="primary"
                      size="large"
                      htmlType="submit"
                      loading={submitting}
                      icon={<SaveOutlined />}
                      style={{
                        marginLeft: 'auto',
                        background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                        border: 'none'
                      }}
                    >
                      Uložit dotazník
                    </Button>
                  )}
                </div>
              </Form>
            </Card>
          </div>
  );
}

export default function GynecologyQuestionnairePage() {
  return (
    <Suspense fallback={<Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} />}>
      <GynecologyQuestionnaireForm />
    </Suspense>
  );
}
