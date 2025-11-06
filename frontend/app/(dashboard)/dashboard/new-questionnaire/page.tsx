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

function QuestionnaireForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');

  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [previousPregnancies, setPreviousPregnancies] = useState<any[]>([]);
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
          type: 'pregnant',
          basic_info: {
            title: values.title,
            first_name: values.first_name,
            last_name: values.last_name,
            birth_number: values.birth_number,
            address: values.address,
            phone: values.phone,
            email: values.email,
            insurance_company: values.insurance_company,
            attending_gynecologist: values.attending_gynecologist,
            height_cm: values.height_cm,
            weight_before_pregnancy: values.weight_before_pregnancy,
            current_weight: values.current_weight,
          },
          pregnancy_info: {
            last_period_date: values.last_period_date?.format('YYYY-MM-DD'),
            last_period_certainty: values.last_period_certainty,
            menstrual_cycle: values.menstrual_cycle,
            wants_to_know_gender: values.wants_to_know_gender,
            conception_type: values.conception_type,
            conception_method: values.conception_method,
          },
          lifestyle: {
            smoking: values.smoking,
            smoking_count: values.smoking_count,
            alcohol: values.alcohol,
            alcohol_amount: values.alcohol_amount,
            folic_acid: values.folic_acid,
            folic_acid_type: values.folic_acid_type,
          },
          health_history: {
            pregnancy_complications: values.pregnancy_complications,
            complications_description: values.complications_description,
            high_blood_pressure: values.high_blood_pressure,
            high_bp_medication: values.high_bp_medication,
            high_bp_since: values.high_bp_since,
            diabetes: values.diabetes,
            diabetes_type: values.diabetes_type,
            diabetes_medication: values.diabetes_medication,
            diabetes_since: values.diabetes_since,
            thyroid_disease: values.thyroid_disease,
            thyroid_medication: values.thyroid_medication,
            thyroid_since: values.thyroid_since,
            other_disease: values.other_disease,
            other_disease_description: values.other_disease_description,
            other_disease_medication: values.other_disease_medication,
            other_disease_since: values.other_disease_since,
            family_history: values.family_history,
          },
          previous_pregnancies: {
            pregnancies: previousPregnancies,
            ectopic_pregnancy: values.ectopic_pregnancy,
            ectopic_pregnancy_week: values.ectopic_pregnancy_week,
            termination: values.termination,
            termination_week: values.termination_week,
            spontaneous_abortion: values.spontaneous_abortion,
            spontaneous_abortion_week: values.spontaneous_abortion_week,
          },
          blood_pressure: {
            left_arm: values.bp_left_arm,
            right_arm: values.bp_right_arm,
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

      message.success('Dotazník byl úspěšně uložen!');
      router.push('/questionnaires');
    } catch (error: any) {
      console.error('Error saving questionnaire:', error);
      message.error(error.response?.data?.message || 'Chyba při ukládání dotazníku');
    } finally {
      setSubmitting(false);
    }
  };

  const addPreviousPregnancy = () => {
    setPreviousPregnancies([...previousPregnancies, {
      id: Date.now(),
      birth_date: null,
      pregnancy_week: null,
      delivery_method: '',
      birth_weight: null,
      birth_length: null,
      gender: '',
      outcome: '',
    }]);
  };

  const removePreviousPregnancy = (id: number) => {
    setPreviousPregnancies(previousPregnancies.filter(p => p.id !== id));
  };

  const updatePreviousPregnancy = (id: number, field: string, value: any) => {
    setPreviousPregnancies(previousPregnancies.map(p =>
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
    { title: 'Těhotenství a životní styl' },
    { title: 'Zdravotní stav' },
    { title: 'Předchozí těhotenství' },
    { title: 'Měření TK a GDPR' },
  ];

  return (
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        <Card
          style={{
            background: '#16213e',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12
          }}
          bodyStyle={{ padding: 32 }}
        >
          <Steps
            current={currentStep}
            items={steps}
            style={{ marginBottom: 32 }}
            className="dark-steps"
          />
          <style jsx global>{`
            .dark-steps .ant-steps-item-title {
              color: rgba(255, 255, 255, 0.85) !important;
            }
            .dark-steps .ant-steps-item-description {
              color: rgba(255, 255, 255, 0.65) !important;
            }
            .dark-steps .ant-steps-item-wait .ant-steps-item-icon {
              background-color: rgba(255, 255, 255, 0.1);
              border-color: rgba(255, 255, 255, 0.2);
            }
            .dark-steps .ant-steps-item-wait .ant-steps-item-icon > .ant-steps-icon {
              color: rgba(255, 255, 255, 0.65);
            }
            .dark-steps .ant-steps-item-finish .ant-steps-item-icon {
              background-color: #a855f7;
              border-color: #a855f7;
            }
            .dark-steps .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
              color: white;
            }
            .dark-steps .ant-steps-item-process .ant-steps-item-icon {
              background-color: #a855f7;
              border-color: #a855f7;
            }
            .dark-steps .ant-steps-item-finish .ant-steps-item-tail::after {
              background-color: #a855f7;
            }
          `}</style>

          <Form form={form} layout="vertical" onFinish={onFinish}>
            {/* KROK 0: Základní údaje */}
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
                    <Form.Item name="first_name" label={<Text style={{ color: '#ffffff' }}>Jméno</Text>} rules={[{ required: true, message: 'Povinné pole' }]}>
                      <Input size="large" placeholder="Jméno" />
                    </Form.Item>
                  </Col>
                  <Col span={9}>
                    <Form.Item name="last_name" label={<Text style={{ color: '#ffffff' }}>Příjmení</Text>} rules={[{ required: true, message: 'Povinné pole' }]}>
                      <Input size="large" placeholder="Příjmení" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="birth_number" label={<Text style={{ color: '#ffffff' }}>Rodné číslo / číslo pojištěnce</Text>}>
                      <Input size="large" placeholder="000000/0000" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="insurance_company" label={<Text style={{ color: '#ffffff' }}>Zdravotní pojišťovna</Text>}>
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

                <Form.Item name="address" label={<Text style={{ color: '#ffffff' }}>Adresa, včetně PSČ</Text>}>
                  <Input size="large" placeholder="Ulice, město, PSČ" />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="phone" label={<Text style={{ color: '#ffffff' }}>Telefon</Text>}>
                      <Input size="large" placeholder="+420 XXX XXX XXX" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="email" label={<Text style={{ color: '#ffffff' }}>E-mail</Text>} rules={[{ type: 'email', message: 'Neplatný email' }]}>
                      <Input size="large" placeholder="email@example.com" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="attending_gynecologist" label={<Text style={{ color: '#ffffff' }}>Váš ošetřující gynekolog</Text>}>
                  <Input size="large" placeholder="Jméno gynekologa" />
                </Form.Item>

                <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '32px 0' }} />
                <Title level={5} style={{ color: '#ffffff', marginBottom: 16 }}>Tělesné míry</Title>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="height_cm" label={<Text style={{ color: '#ffffff' }}>Výška (cm)</Text>}>
                      <InputNumber size="large" style={{ width: '100%' }} placeholder="170" min={0} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="weight_before_pregnancy" label={<Text style={{ color: '#ffffff' }}>Hmotnost před těhot. (kg)</Text>}>
                      <InputNumber size="large" style={{ width: '100%' }} placeholder="65" min={0} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="current_weight" label={<Text style={{ color: '#ffffff' }}>Současná hmotnost (kg)</Text>}>
                      <InputNumber size="large" style={{ width: '100%' }} placeholder="70" min={0} />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            )}

            {/* KROK 1: Těhotenství a životní styl */}
            {currentStep === 1 && (
              <div>
                <Title level={4} style={{ color: '#ffffff', marginBottom: 24 }}>Informace o těhotenství</Title>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="last_period_date" label={<Text style={{ color: '#ffffff' }}>Datum poslední menstruace</Text>}>
                      <DatePicker size="large" style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Vyberte datum" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="last_period_certainty" label={<Text style={{ color: '#ffffff' }}>Údaj o tomto datu je</Text>}>
                      <Radio.Group size="large">
                        <Radio value="certain" style={{ color: '#ffffff' }}>jistý</Radio>
                        <Radio value="uncertain" style={{ color: '#ffffff' }}>nejistý</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="menstrual_cycle" label={<Text style={{ color: '#ffffff' }}>Menstruační cyklus</Text>}>
                  <Radio.Group size="large">
                    <Radio value="regular" style={{ color: '#ffffff' }}>pravidelný</Radio>
                    <Radio value="irregular" style={{ color: '#ffffff' }}>nepravidelný</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item name="wants_to_know_gender" label={<Text style={{ color: '#ffffff' }}>Přejete si znát pohlaví svého dítěte? (vyšetřujeme od 16. týdne)</Text>}>
                  <Radio.Group size="large">
                    <Radio value={true} style={{ color: '#ffffff' }}>ANO</Radio>
                    <Radio value={false} style={{ color: '#ffffff' }}>NE</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item name="conception_type" label={<Text style={{ color: '#ffffff' }}>Koncepce (otěhotnění)</Text>}>
                  <Radio.Group size="large">
                    <Radio value="spontaneous" style={{ color: '#ffffff' }}>spontánní</Radio>
                    <Radio value="ivf" style={{ color: '#ffffff' }}>po IVF</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) => prevValues.conception_type !== currentValues.conception_type}
                >
                  {({ getFieldValue }) =>
                    getFieldValue('conception_type') === 'ivf' ? (
                      <Form.Item name="conception_method" label={<Text style={{ color: '#ffffff' }}>Metoda IVF</Text>}>
                        <Radio.Group size="large">
                          <Radio value="ET" style={{ color: '#ffffff' }}>ET</Radio>
                          <Radio value="KET" style={{ color: '#ffffff' }}>KET</Radio>
                          <Radio value="ICSI" style={{ color: '#ffffff' }}>ICSI</Radio>
                        </Radio.Group>
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>

                <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '32px 0' }} />
                <Title level={5} style={{ color: '#ffffff', marginBottom: 16 }}>Životní styl v těhotenství</Title>

                <Form.Item name="smoking" label={<Text style={{ color: '#ffffff' }}>Kouříte v těhotenství?</Text>}>
                  <Radio.Group size="large">
                    <Radio value={true} style={{ color: '#ffffff' }}>ANO</Radio>
                    <Radio value={false} style={{ color: '#ffffff' }}>NE</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) => prevValues.smoking !== currentValues.smoking}
                >
                  {({ getFieldValue }) =>
                    getFieldValue('smoking') ? (
                      <Form.Item name="smoking_count" label={<Text style={{ color: '#ffffff' }}>Počet cigaret / den</Text>}>
                        <InputNumber size="large" style={{ width: '100%' }} placeholder="0" min={0} />
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>

                <Form.Item name="alcohol" label={<Text style={{ color: '#ffffff' }}>Pijete alkohol v těhotenství?</Text>}>
                  <Radio.Group size="large">
                    <Radio value={true} style={{ color: '#ffffff' }}>ANO</Radio>
                    <Radio value={false} style={{ color: '#ffffff' }}>NE</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) => prevValues.alcohol !== currentValues.alcohol}
                >
                  {({ getFieldValue }) =>
                    getFieldValue('alcohol') ? (
                      <Form.Item name="alcohol_amount" label={<Text style={{ color: '#ffffff' }}>Počet dcl / den</Text>}>
                        <InputNumber size="large" style={{ width: '100%' }} placeholder="0" min={0} step={0.1} />
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>

                <Form.Item name="folic_acid" label={<Text style={{ color: '#ffffff' }}>Užíváte kyselinu listovou?</Text>}>
                  <Radio.Group size="large">
                    <Radio value={true} style={{ color: '#ffffff' }}>ANO</Radio>
                    <Radio value={false} style={{ color: '#ffffff' }}>NE</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) => prevValues.folic_acid !== currentValues.folic_acid}
                >
                  {({ getFieldValue }) =>
                    getFieldValue('folic_acid') ? (
                      <Form.Item name="folic_acid_type" label={<Text style={{ color: '#ffffff' }}>Typ užívání</Text>}>
                        <Radio.Group size="large">
                          <Radio value="pregnancy_vitamins" style={{ color: '#ffffff' }}>součástí těh. vitamínů</Radio>
                          <Radio value="before_pregnancy" style={{ color: '#ffffff' }}>již před otěhotněním</Radio>
                        </Radio.Group>
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>

                <Form.Item name="pregnancy_complications" label={<Text style={{ color: '#ffffff' }}>Máte komplikace v těhotenství?</Text>}>
                  <Radio.Group size="large">
                    <Radio value={true} style={{ color: '#ffffff' }}>ANO</Radio>
                    <Radio value={false} style={{ color: '#ffffff' }}>NE</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) => prevValues.pregnancy_complications !== currentValues.pregnancy_complications}
                >
                  {({ getFieldValue }) =>
                    getFieldValue('pregnancy_complications') ? (
                      <Form.Item name="complications_description" label={<Text style={{ color: '#ffffff' }}>Uveďte jaké (krvácení, zvracení, užívání ATB pro infekční onem.)</Text>}>
                        <TextArea rows={3} placeholder="Popis komplikací..." />
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>
              </div>
            )}

            {/* KROK 2: Zdravotní stav */}
            {currentStep === 2 && (
              <div>
                <Title level={4} style={{ color: '#ffffff', marginBottom: 24 }}>Zdravotní stav</Title>

                {/* Vysoký krevní tlak */}
                <Card style={{ background: '#2d1b4e', marginBottom: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Form.Item name="high_blood_pressure" label={<Text style={{ color: '#ffffff' }}>Máte vysoký krevní tlak?</Text>}>
                    <Radio.Group size="large">
                      <Radio value={true} style={{ color: '#ffffff' }}>ANO</Radio>
                      <Radio value={false} style={{ color: '#ffffff' }}>NE</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.high_blood_pressure !== currentValues.high_blood_pressure}
                  >
                    {({ getFieldValue }) =>
                      getFieldValue('high_blood_pressure') ? (
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item name="high_bp_medication" label={<Text style={{ color: '#ffffff' }}>Léky</Text>}>
                              <Input size="large" placeholder="Název léků" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="high_bp_since" label={<Text style={{ color: '#ffffff' }}>Od kdy</Text>}>
                              <Input size="large" placeholder="např. 2020" />
                            </Form.Item>
                          </Col>
                        </Row>
                      ) : null
                    }
                  </Form.Item>

                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.high_blood_pressure !== currentValues.high_blood_pressure}
                  >
                    {({ getFieldValue }) =>
                      getFieldValue('high_blood_pressure') ? (
                        <Form.Item name="high_bp_before_pregnancy" valuePropName="checked">
                          <Checkbox style={{ color: '#ffffff' }}>ANO, již před otěhotněním</Checkbox>
                        </Form.Item>
                      ) : null
                    }
                  </Form.Item>
                </Card>

                {/* Cukrovka */}
                <Card style={{ background: '#2d1b4e', marginBottom: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Form.Item name="diabetes" label={<Text style={{ color: '#ffffff' }}>Máte cukrovku?</Text>}>
                    <Radio.Group size="large">
                      <Radio value={true} style={{ color: '#ffffff' }}>ANO</Radio>
                      <Radio value={false} style={{ color: '#ffffff' }}>NE</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.diabetes !== currentValues.diabetes}
                  >
                    {({ getFieldValue }) =>
                      getFieldValue('diabetes') ? (
                        <>
                          <Form.Item name="diabetes_type" label={<Text style={{ color: '#ffffff' }}>Typ</Text>}>
                            <Radio.Group size="large">
                              <Radio value="1" style={{ color: '#ffffff' }}>I. typu</Radio>
                              <Radio value="2" style={{ color: '#ffffff' }}>II. typu</Radio>
                            </Radio.Group>
                          </Form.Item>

                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item name="diabetes_medication" label={<Text style={{ color: '#ffffff' }}>Léky</Text>}>
                                <Input size="large" placeholder="Název léků" />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item name="diabetes_since" label={<Text style={{ color: '#ffffff' }}>Od kdy</Text>}>
                                <Input size="large" placeholder="např. 2015" />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Form.Item name="diabetes_before_pregnancy" valuePropName="checked">
                            <Checkbox style={{ color: '#ffffff' }}>ANO, již před otěhotněním</Checkbox>
                          </Form.Item>
                        </>
                      ) : null
                    }
                  </Form.Item>
                </Card>

                {/* Onemocnění štítné žlázy */}
                <Card style={{ background: '#2d1b4e', marginBottom: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Form.Item name="thyroid_disease" label={<Text style={{ color: '#ffffff' }}>Máte onemocnění štítné žlázy? (hyperfunkce, hypofunkce, thyreopatie, struma, strumectomie)</Text>}>
                    <Radio.Group size="large">
                      <Radio value={true} style={{ color: '#ffffff' }}>ANO</Radio>
                      <Radio value={false} style={{ color: '#ffffff' }}>NE</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.thyroid_disease !== currentValues.thyroid_disease}
                  >
                    {({ getFieldValue }) =>
                      getFieldValue('thyroid_disease') ? (
                        <>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item name="thyroid_medication" label={<Text style={{ color: '#ffffff' }}>Léky</Text>}>
                                <Input size="large" placeholder="Název léků" />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item name="thyroid_since" label={<Text style={{ color: '#ffffff' }}>Od kdy</Text>}>
                                <Input size="large" placeholder="např. 2018" />
                              </Form.Item>
                            </Col>
                          </Row>

                          <Form.Item name="thyroid_before_pregnancy" valuePropName="checked">
                            <Checkbox style={{ color: '#ffffff' }}>ANO, již před otěhotněním</Checkbox>
                          </Form.Item>
                        </>
                      ) : null
                    }
                  </Form.Item>
                </Card>

                {/* Jiné onemocnění */}
                <Card style={{ background: '#2d1b4e', marginBottom: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Form.Item name="other_disease" label={<Text style={{ color: '#ffffff' }}>Trpíte jiným déletrvajícím onemocněním?</Text>}>
                    <Radio.Group size="large">
                      <Radio value={true} style={{ color: '#ffffff' }}>ANO</Radio>
                      <Radio value={false} style={{ color: '#ffffff' }}>NE</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.other_disease !== currentValues.other_disease}
                  >
                    {({ getFieldValue }) =>
                      getFieldValue('other_disease') ? (
                        <>
                          <Form.Item name="other_disease_description" label={<Text style={{ color: '#ffffff' }}>Jakým?</Text>}>
                            <TextArea rows={2} placeholder="Popis onemocnění..." />
                          </Form.Item>

                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item name="other_disease_medication" label={<Text style={{ color: '#ffffff' }}>Léky</Text>}>
                                <Input size="large" placeholder="Název léků" />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item name="other_disease_since" label={<Text style={{ color: '#ffffff' }}>Od kdy</Text>}>
                                <Input size="large" placeholder="např. 2019" />
                              </Form.Item>
                            </Col>
                          </Row>
                        </>
                      ) : null
                    }
                  </Form.Item>
                </Card>

                {/* Rodinná anamnéza */}
                <Card style={{ background: '#2d1b4e', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Form.Item name="family_history" label={<Text style={{ color: '#ffffff' }}>Vyskytly se u Vás, nebo v partnerově rodině, závažná onemocnění nebo vývojové vady? (vrozené srdeční vady či vady jiných orgánů, genetická onemocnění, cystická fibróza, rozštěpové vady, atd....)</Text>}>
                    <TextArea rows={3} placeholder="Pokud ano, popište..." />
                  </Form.Item>
                </Card>
              </div>
            )}

            {/* KROK 3: Předchozí těhotenství */}
            {currentStep === 3 && (
              <div>
                <Title level={4} style={{ color: '#ffffff', marginBottom: 24 }}>Údaje k předchozím těhotenstvím</Title>

                <div style={{ marginBottom: 24 }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={addPreviousPregnancy}
                    style={{
                      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                      border: 'none',
                      marginBottom: 16
                    }}
                  >
                    Přidat předchozí těhotenství
                  </Button>

                  {previousPregnancies.map((pregnancy, index) => (
                    <Card
                      key={pregnancy.id}
                      style={{
                        background: '#2d1b4e',
                        marginBottom: 16,
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                      title={<Text style={{ color: '#ffffff' }}>Těhotenství #{index + 1}</Text>}
                      extra={
                        <Button
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => removePreviousPregnancy(pregnancy.id)}
                        >
                          Odebrat
                        </Button>
                      }
                    >
                      <Row gutter={16}>
                        <Col span={8}>
                          <div style={{ marginBottom: 16 }}>
                            <Text style={{ color: '#ffffff', display: 'block', marginBottom: 8 }}>Datum porodu</Text>
                            <DatePicker
                              value={pregnancy.birth_date ? dayjs(pregnancy.birth_date) : null}
                              onChange={(date) => updatePreviousPregnancy(pregnancy.id, 'birth_date', date?.format('YYYY-MM-DD'))}
                              format="DD.MM.YYYY"
                              style={{ width: '100%' }}
                            />
                          </div>
                        </Col>
                        <Col span={8}>
                          <div style={{ marginBottom: 16 }}>
                            <Text style={{ color: '#ffffff', display: 'block', marginBottom: 8 }}>Týden těhot.</Text>
                            <InputNumber
                              value={pregnancy.pregnancy_week}
                              onChange={(value) => updatePreviousPregnancy(pregnancy.id, 'pregnancy_week', value)}
                              style={{ width: '100%' }}
                              min={0}
                              max={42}
                              placeholder="např. 39"
                            />
                          </div>
                        </Col>
                        <Col span={8}>
                          <div style={{ marginBottom: 16 }}>
                            <Text style={{ color: '#ffffff', display: 'block', marginBottom: 8 }}>Pohlaví</Text>
                            <Radio.Group
                              value={pregnancy.gender}
                              onChange={(e) => updatePreviousPregnancy(pregnancy.id, 'gender', e.target.value)}
                              size="large"
                            >
                              <Radio value="male" style={{ color: '#ffffff' }}>Chlapec</Radio>
                              <Radio value="female" style={{ color: '#ffffff' }}>Dívka</Radio>
                            </Radio.Group>
                          </div>
                        </Col>
                      </Row>

                      <div style={{ marginBottom: 16 }}>
                        <Text style={{ color: '#ffffff', display: 'block', marginBottom: 8 }}>Způsob vedení porodu (vaginální - hlavičkou/KP, S.C., kleště), důvod</Text>
                        <Input
                          value={pregnancy.delivery_method}
                          onChange={(e) => updatePreviousPregnancy(pregnancy.id, 'delivery_method', e.target.value)}
                          placeholder="např. vaginální - hlavičkou"
                        />
                      </div>

                      <Row gutter={16}>
                        <Col span={12}>
                          <div style={{ marginBottom: 16 }}>
                            <Text style={{ color: '#ffffff', display: 'block', marginBottom: 8 }}>Porodní váha (g)</Text>
                            <InputNumber
                              value={pregnancy.birth_weight}
                              onChange={(value) => updatePreviousPregnancy(pregnancy.id, 'birth_weight', value)}
                              style={{ width: '100%' }}
                              min={0}
                              placeholder="např. 3500"
                            />
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ marginBottom: 16 }}>
                            <Text style={{ color: '#ffffff', display: 'block', marginBottom: 8 }}>Porodní délka (cm)</Text>
                            <InputNumber
                              value={pregnancy.birth_length}
                              onChange={(value) => updatePreviousPregnancy(pregnancy.id, 'birth_length', value)}
                              style={{ width: '100%' }}
                              min={0}
                              placeholder="např. 50"
                            />
                          </div>
                        </Col>
                      </Row>

                      <div>
                        <Text style={{ color: '#ffffff', display: 'block', marginBottom: 8 }}>Ukončení porodu (zdravý novorozenec, rozštěp, vrozená vada...)</Text>
                        <TextArea
                          value={pregnancy.outcome}
                          onChange={(e) => updatePreviousPregnancy(pregnancy.id, 'outcome', e.target.value)}
                          rows={2}
                          placeholder="Popis výsledku porodu..."
                        />
                      </div>
                    </Card>
                  ))}

                  {previousPregnancies.length === 0 && (
                    <Card style={{ background: '#2d1b4e', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                      <Text style={{ color: 'rgba(255,255,255,0.5)' }}>
                        Zatím nebyla přidána žádná předchozí těhotenství. Pokud jde o první těhotenství, pokračujte dále.
                      </Text>
                    </Card>
                  )}
                </div>

                <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '32px 0' }} />

                {/* Mimodeložní těhotenství */}
                <Card style={{ background: '#2d1b4e', marginBottom: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Form.Item name="ectopic_pregnancy" valuePropName="checked">
                    <Checkbox style={{ color: '#ffffff' }}>Mimoděložní těhotenství</Checkbox>
                  </Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.ectopic_pregnancy !== currentValues.ectopic_pregnancy}
                  >
                    {({ getFieldValue }) =>
                      getFieldValue('ectopic_pregnancy') ? (
                        <Form.Item name="ectopic_pregnancy_week" label={<Text style={{ color: '#ffffff' }}>Týden těhotenství</Text>}>
                          <InputNumber size="large" style={{ width: '100%' }} min={0} max={42} placeholder="např. 8" />
                        </Form.Item>
                      ) : null
                    }
                  </Form.Item>
                </Card>

                {/* Ukončení těhotenství */}
                <Card style={{ background: '#2d1b4e', marginBottom: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Form.Item name="termination" valuePropName="checked">
                    <Checkbox style={{ color: '#ffffff' }}>Ukončení těhotenství</Checkbox>
                  </Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.termination !== currentValues.termination}
                  >
                    {({ getFieldValue }) =>
                      getFieldValue('termination') ? (
                        <Form.Item name="termination_week" label={<Text style={{ color: '#ffffff' }}>Týden těhotenství</Text>}>
                          <InputNumber size="large" style={{ width: '100%' }} min={0} max={42} placeholder="např. 12" />
                        </Form.Item>
                      ) : null
                    }
                  </Form.Item>
                </Card>

                {/* Spontánní potrat */}
                <Card style={{ background: '#2d1b4e', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Form.Item name="spontaneous_abortion" valuePropName="checked">
                    <Checkbox style={{ color: '#ffffff' }}>Spontánní potrat</Checkbox>
                  </Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.spontaneous_abortion !== currentValues.spontaneous_abortion}
                  >
                    {({ getFieldValue }) =>
                      getFieldValue('spontaneous_abortion') ? (
                        <Form.Item name="spontaneous_abortion_week" label={<Text style={{ color: '#ffffff' }}>Týden těhotenství</Text>}>
                          <InputNumber size="large" style={{ width: '100%' }} min={0} max={42} placeholder="např. 6" />
                        </Form.Item>
                      ) : null
                    }
                  </Form.Item>
                </Card>
              </div>
            )}

            {/* KROK 4: TK a GDPR */}
            {currentStep === 4 && (
              <div>
                <Title level={4} style={{ color: '#ffffff', marginBottom: 24 }}>Měření krevního tlaku (TK)</Title>
                <Text style={{ color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 16 }}>
                  Toto pole vyplní personál při vyšetření
                </Text>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="bp_left_arm" label={<Text style={{ color: '#ffffff' }}>Levá paže</Text>}>
                      <Input size="large" placeholder="např. 120/80" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="bp_right_arm" label={<Text style={{ color: '#ffffff' }}>Pravá paže</Text>}>
                      <Input size="large" placeholder="např. 120/80" />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '32px 0' }} />

                <Title level={4} style={{ color: '#ffffff', marginBottom: 24 }}>Souhlas se zpracováním osobních údajů</Title>

                <Card style={{ background: '#2d1b4e', marginBottom: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, display: 'block', lineHeight: 1.6 }}>
                    <strong>Poskytovatel tímto výslovně prohlašuje</strong>, že dodrží veškeré zásady týkající se zákonem stanovené povinné
                    mlčenlivosti poskytovatele zdravotních služeb, důsledně zachová anonymitu pacientky a provede
                    taková opatření, aby takto anonymně publikovaná data či záznamy neumožňovaly jakoukoliv identifikaci
                    pacientky třetí osobou či jakoukoliv možnost spojení publikovaných dat či záznamů s konkrétní
                    osobou pacientky.
                  </Text>
                </Card>

                <Form.Item
                  name="gdpr_consent"
                  valuePropName="checked"
                  rules={[{ required: true, message: 'Pro uložení dotazníku je nutný souhlas' }]}
                >
                  <Checkbox style={{ color: '#ffffff' }}>
                    <Text strong style={{ color: '#ffffff' }}>
                      Pacientka svým podpisem potvrzuje, že byla seznámena se zásadami zpracování osobních údajů při
                      poskytování zdravotních služeb v tomto zdravotnickém zařízení.
                    </Text>
                  </Checkbox>
                </Form.Item>

                <Form.Item name="data_processing_consent" valuePropName="checked">
                  <Checkbox style={{ color: '#ffffff' }}>
                    <Text style={{ color: '#ffffff' }}>
                      Pacientka souhlasí, že obrazový a další záznamy pořízené v souvislosti s poskytnutím zdravotních
                      služeb v tomto zdravotnickém zařízení mohou být použity, ve zcela anonymní podobě, pro vědecké,
                      propagační a výukové účely.
                    </Text>
                  </Checkbox>
                </Form.Item>

                <Form.Item name="scientific_use_consent" valuePropName="checked">
                  <Checkbox style={{ color: '#ffffff' }}>
                    <Text style={{ color: '#ffffff' }}>
                      Dále byla seznámena s výsledkem vyšetření, popř. dalšími navrhovanými léčebnými postupy.
                    </Text>
                  </Checkbox>
                </Form.Item>

                <Card style={{ background: '#2d1b4e', border: '1px solid rgba(255,255,255,0.1)', marginTop: 24 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, display: 'block' }}>
                    📧 Zpráva z vyšetření (včetně osobních a zdravotních údajů) obdrží pacientka do týdne elektronicky
                    na uvedenou e-mailovou adresu.
                  </Text>
                </Card>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ marginTop: 40, display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24 }}>
              {currentStep > 0 && (
                <Button size="large" onClick={prev} style={{ minWidth: 120 }}>
                  Zpět
                </Button>
              )}
              {currentStep < steps.length - 1 && (
                <Button
                  type="primary"
                  size="large"
                  onClick={next}
                  style={{
                    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                    border: 'none',
                    minWidth: 120
                  }}
                >
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
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    border: 'none',
                    minWidth: 180,
                    height: 48,
                    fontSize: 16
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

export default function NewQuestionnairePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#1a1a2e', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </div>
    }>
      <QuestionnaireForm />
    </Suspense>
  );
}
