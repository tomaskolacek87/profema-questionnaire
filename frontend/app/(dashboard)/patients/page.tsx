'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Card, Table, Button, Input, Space, Typography, Tag, Spin, Empty, Tooltip, Avatar, Badge, Modal, Form, Row, Col, Select, Checkbox, DatePicker
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  FileTextOutlined,
  LogoutOutlined,
  BellOutlined,
  CheckCircleOutlined,
  SendOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

const { Title, Text } = Typography;
const { Search } = Input;

export default function PatientsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [form] = Form.useForm();
  const [isSendModalVisible, setIsSendModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [sendingQuestionnaire, setSendingQuestionnaire] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');

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

  // Fetch patients from Astraia database
  const { data: patients, isLoading, refetch } = useQuery({
    queryKey: ['patients-astraia'],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/patients?source=astraia`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          }
        }
      );
      return response.data;
    },
  });

  const handleCreatePatient = async (values: any) => {
    try {
      if (isEditMode && editingPatient) {
        // Update existing patient
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/patients/${editingPatient.id}`,
          values,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`
            }
          }
        );
      } else {
        // Create new patient
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/patients`,
          values,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`
            }
          }
        );
      }
      setIsModalVisible(false);
      setIsEditMode(false);
      setEditingPatient(null);
      form.resetFields();
      refetch();
    } catch (error) {
      console.error('Error saving patient:', error);
    }
  };

  const handleEditPatient = (patient: any) => {
    setEditingPatient(patient);
    setIsEditMode(true);
    form.setFieldsValue({
      first_name: patient.other_names || patient.first_name,
      last_name: patient.name || patient.last_name,
      birth_number: patient.hospital_number || patient.birth_number,
      phone: patient.phone,
      email: patient.email,
      address: patient.address,
      city: patient.city,
      postal_code: patient.postal_code,
      insurance_company: patient.insurance_company,
      gdpr_consent: patient.gdpr_consent,
    });
    setIsModalVisible(true);
  };

  const handleDeletePatient = async (patientId: string) => {
    Modal.confirm({
      title: 'Smazat pacientku?',
      content: 'Opravdu chcete smazat tuto pacientku? Tato akce je nevratná.',
      okText: 'Smazat',
      cancelText: 'Zrušit',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}/patients/${patientId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`
              }
            }
          );
          refetch();
        } catch (error) {
          console.error('Error deleting patient:', error);
        }
      },
    });
  };

  const handleSendQuestionnaire = async (questionnaireType: 'pregnant' | 'gynecology' | 'ultrasound') => {
    if (!selectedPatient) return;

    setSendingQuestionnaire(true);
    try {
      console.log('Sending questionnaire...', questionnaireType, selectedPatient.id);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/questionnaires/send/${selectedPatient.id}`,
        { type: questionnaireType },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          }
        }
      );

      console.log('Response received:', response.data);

      // Copy to clipboard
      await navigator.clipboard.writeText(response.data.publicUrl);

      // Show success modal
      setGeneratedUrl(response.data.publicUrl);
      setIsSendModalVisible(false);
      setIsSuccessModalVisible(true);
    } catch (error: any) {
      alert('Chyba při odesílání dotazníku: ' + (error.response?.data?.message || 'Nepodařilo se odeslat dotazník.'));
    } finally {
      setSendingQuestionnaire(false);
    }
  };

  const columns = [
    {
      title: 'Pacientka',
      dataIndex: 'first_name',
      key: 'name',
      render: (_: string, record: any) => (
        <Space>
          <Avatar style={{ backgroundColor: '#a855f7' }}>
            {record.first_name?.[0]}{record.last_name?.[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500, color: '#ffffff' }}>
              {record.first_name} {record.last_name}
            </div>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              {record.birth_number || 'Bez RČ'}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => email ? <Text style={{ color: '#ffffff' }}>{email}</Text> : <Text style={{ color: 'rgba(255,255,255,0.3)' }}>-</Text>,
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone ? <Text style={{ color: '#ffffff' }}>{phone}</Text> : <Text style={{ color: 'rgba(255,255,255,0.3)' }}>-</Text>,
    },
    {
      title: 'Město',
      dataIndex: 'city',
      key: 'city',
      render: (city: string) => city ? <Text style={{ color: '#ffffff' }}>{city}</Text> : <Text style={{ color: 'rgba(255,255,255,0.3)' }}>-</Text>,
    },
    {
      title: 'Datum narození',
      dataIndex: 'birth_date',
      key: 'birth_date',
      render: (date: string) => date ? (
        <Text style={{ color: '#ffffff' }}>
          {format(new Date(date), 'dd.MM.yyyy', { locale: cs })}
        </Text>
      ) : <Text style={{ color: 'rgba(255,255,255,0.3)' }}>-</Text>,
    },
    {
      title: 'Vytvořeno',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <Text style={{ color: '#ffffff' }}>
          {format(new Date(date), 'dd.MM.yyyy', { locale: cs })}
        </Text>
      ),
    },
    {
      title: 'Akce',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Poslat dotazník emailem">
            <Button
              type="primary"
              icon={<SendOutlined />}
              size="small"
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                border: 'none'
              }}
              onClick={() => {
                setSelectedPatient(record);
                setIsSendModalVisible(true);
              }}
            >
              Poslat dotazník
            </Button>
          </Tooltip>
          <Tooltip title="Upravit">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditPatient(record)}
            />
          </Tooltip>
          <Tooltip title="Smazat">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => handleDeletePatient(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredPatients = patients?.filter(
    (p: any) =>
      p.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.birth_number?.includes(searchQuery),
  );

  return (
    <div style={{ background: '#1a1a2e', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Actions and Search */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>
                  Přehled všech pacientek
                </Text>
              </div>

              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  border: 'none',
                  height: 40,
                  fontSize: 16,
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)'
                }}
              >
                Nová pacientka
              </Button>
            </div>

            {/* Statistics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 32
            }}>
              <Card
                variant="borderless"
                style={{
                  background: 'linear-gradient(135deg, #2d1b4e 0%, #1e1536 100%)',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  borderRadius: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <UserOutlined style={{ fontSize: 32, color: '#a855f7' }} />
                  <div>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, display: 'block' }}>
                      Pacientek v databázi Astraia
                    </Text>
                    <Text style={{ color: '#ffffff', fontSize: 28, fontWeight: 700 }}>
                      {patients?.length || 0}
                    </Text>
                  </div>
                </div>
              </Card>
            </div>

            {/* Patients Table */}
            <Card
              title={
                <Space>
                  <UserOutlined style={{ color: '#a855f7' }} />
                  <Text strong style={{ fontSize: 16, color: '#ffffff' }}>Seznam pacientek</Text>
                </Space>
              }
              variant="borderless"
              style={{
                borderRadius: 12,
                background: '#16213e',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
              headStyle={{ color: '#ffffff', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Search
                placeholder="Hledat podle jména, emailu nebo RČ..."
                prefix={<SearchOutlined />}
                size="large"
                style={{ marginBottom: 16, maxWidth: 400, borderRadius: 8 }}
                onChange={e => setSearchQuery(e.target.value)}
                allowClear
              />

              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                  <Spin size="large" />
                </div>
              ) : filteredPatients && filteredPatients.length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={filteredPatients}
                  rowKey="id"
                  pagination={{
                    pageSize: 15,
                    showSizeChanger: true,
                    style: {
                      color: '#ffffff',
                    }
                  }}
                  style={{
                    marginTop: 16,
                  }}
                  className="dark-table"
                  onRow={(record) => ({
                    onClick: (e) => {
                      // Ignore clicks on buttons
                      const target = e.target as HTMLElement;
                      if (target.closest('button') || target.closest('.ant-btn')) {
                        return;
                      }
                      handleEditPatient(record);
                    },
                    style: { cursor: 'pointer' }
                  })}
                />
              ) : (
                <Empty
                  description={
                    <Text style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {searchQuery ? 'Žádné pacientky nenalezeny' : 'Zatím žádné pacientky'}
                    </Text>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
      </div>

      <Modal
          title={isEditMode ? "Upravit pacientku" : "Nová pacientka"}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setIsEditMode(false);
            setEditingPatient(null);
            form.resetFields();
          }}
          footer={null}
          width={700}
        >
        <Form form={form} layout="vertical" onFinish={handleCreatePatient}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="first_name" label="Jméno" rules={[{ required: true, message: 'Povinné pole' }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="last_name" label="Příjmení" rules={[{ required: true, message: 'Povinné pole' }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="birth_date" label="Datum narození">
                <DatePicker size="large" style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Vyberte datum" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="birth_number" label="Rodné číslo">
                <Input size="large" placeholder="000000/0000" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="insurance_company" label="Pojišťovna">
                <Input size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Telefon">
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Neplatný email' }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Ulice">
            <Input size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="city" label="Město">
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="postal_code" label="PSČ">
                <Input size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="gdpr_consent" valuePropName="checked">
            <Checkbox>Souhlas s GDPR</Checkbox>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="large">
                {isEditMode ? 'Uložit změny' : 'Vytvořit'}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                setIsEditMode(false);
                setEditingPatient(null);
                form.resetFields();
              }} size="large">
                Zrušit
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Dark table styling */}
      <style jsx global>{`
        .dark-table .ant-table {
          background: transparent !important;
          color: #ffffff !important;
        }

        .dark-table .ant-table-thead > tr > th {
          background: rgba(45, 27, 78, 0.6) !important;
          color: rgba(255, 255, 255, 0.9) !important;
          border-bottom: 1px solid rgba(168, 85, 247, 0.3) !important;
          font-weight: 600 !important;
        }

        .dark-table .ant-table-tbody > tr {
          background: rgba(30, 21, 54, 0.4) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        }

        .dark-table .ant-table-tbody > tr:hover {
          background: rgba(168, 85, 247, 0.15) !important;
        }

        .dark-table .ant-table-tbody > tr:hover > td {
          background: transparent !important;
          color: #ffffff !important;
        }

        .dark-table .ant-table-tbody > tr > td {
          color: #ffffff !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        }

        .dark-table .ant-pagination {
          color: #ffffff !important;
        }

        .dark-table .ant-pagination-item {
          background: rgba(45, 27, 78, 0.6) !important;
          border: 1px solid rgba(168, 85, 247, 0.3) !important;
        }

        .dark-table .ant-pagination-item a {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .dark-table .ant-pagination-item-active {
          background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%) !important;
          border-color: #a855f7 !important;
        }

        .dark-table .ant-pagination-item-active a {
          color: #ffffff !important;
        }

        .dark-table .ant-select-selector {
          background: rgba(45, 27, 78, 0.6) !important;
          border: 1px solid rgba(168, 85, 247, 0.3) !important;
          color: #ffffff !important;
        }

        .dark-table .ant-select-arrow {
          color: rgba(255, 255, 255, 0.6) !important;
        }

        .dark-table .ant-pagination-options-quick-jumper input {
          background: rgba(45, 27, 78, 0.6) !important;
          border: 1px solid rgba(168, 85, 247, 0.3) !important;
          color: #ffffff !important;
        }
      `}</style>

      <Modal
        title="Poslat dotazník pacientce"
        open={isSendModalVisible}
        onCancel={() => {
          setIsSendModalVisible(false);
          setSelectedPatient(null);
        }}
        footer={null}
        width={500}
      >
        {selectedPatient && (
          <div>
            <div style={{ marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <Text strong>Pacientka: </Text>
              <Text>{selectedPatient.first_name} {selectedPatient.last_name}</Text>
              <br />
              <Text strong>Email: </Text>
              <Text>{selectedPatient.email || <span style={{ color: '#ff4d4f' }}>Není vyplněn!</span>}</Text>
            </div>

            <Title level={5}>Vyberte typ dotazníku:</Title>

            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button
                size="large"
                block
                loading={sendingQuestionnaire}
                onClick={() => handleSendQuestionnaire('pregnant')}
                style={{
                  height: 60,
                  background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                  border: 'none',
                  color: 'white',
                  fontSize: 16,
                  fontWeight: 500
                }}
              >
                Dotazník pro těhotné
              </Button>

              <Button
                size="large"
                block
                loading={sendingQuestionnaire}
                onClick={() => handleSendQuestionnaire('gynecology')}
                style={{
                  height: 60,
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  border: 'none',
                  color: 'white',
                  fontSize: 16,
                  fontWeight: 500
                }}
              >
                Gynekologický dotazník
              </Button>

              <Button
                size="large"
                block
                disabled
                style={{
                  height: 60,
                  background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                  border: 'none',
                  color: 'white',
                  fontSize: 16,
                  fontWeight: 500,
                  opacity: 0.6
                }}
              >
                UZ vyšetření (připravuje se)
              </Button>
            </Space>

            {!selectedPatient.email && (
              <div style={{ marginTop: 16, padding: 12, background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 6 }}>
                <Text style={{ color: '#d46b08', fontSize: 12 }}>
                  Pozor: Pacientka nemá vyplněný email. Po vygenerování odkazu ho můžete zkopírovat a poslat jí ručně.
                </Text>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="✅ Dotazník byl vygenerován"
        open={isSuccessModalVisible}
        onOk={() => {
          setIsSuccessModalVisible(false);
          setSelectedPatient(null);
          setGeneratedUrl('');
        }}
        onCancel={() => {
          setIsSuccessModalVisible(false);
          setSelectedPatient(null);
          setGeneratedUrl('');
        }}
        width={600}
      >
        <div style={{ marginTop: '16px' }}>
          <p style={{ marginBottom: '12px' }}>
            <strong>Odkaz byl zkopírován do schránky:</strong>
          </p>
          <div style={{
            background: '#f5f5f5',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px',
            wordBreak: 'break-all',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            {generatedUrl}
          </div>
          <div style={{ color: '#52c41a' }}>
            ✓ Odkaz je platný 7 dní<br/>
            ✓ Pošlete ho pacientce emailem nebo SMS
          </div>
        </div>
      </Modal>
    </div>
  );
}
