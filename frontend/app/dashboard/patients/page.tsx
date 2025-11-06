'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Card, Table, Button, Input, Space, Typography, Tag, Spin, Empty, Tooltip, Layout, Avatar, Badge, Modal, Form, Row, Col, Select, Checkbox
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
  SendOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

const { Title, Text } = Typography;
const { Search } = Input;
const { Header, Content } = Layout;

export default function PatientsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

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

  // Fetch patients from API
  const { data: patients, isLoading, refetch } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/patients`,
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
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/patients`,
        values,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          }
        }
      );
      setIsModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error) {
      console.error('Error creating patient:', error);
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
      title: 'GDPR',
      dataIndex: 'gdpr_consent',
      key: 'gdpr',
      render: (consent: boolean) =>
        consent ? (
          <Tag color="green" icon={<CheckCircleOutlined />}>Souhlas</Tag>
        ) : (
          <Tag color="default">Bez souhlasu</Tag>
        ),
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
          <Tooltip title="Poslat dotazník">
            <Button
              type="primary"
              icon={<SendOutlined />}
              size="small"
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                border: 'none'
              }}
              onClick={() => router.push(`/dashboard/new-questionnaire?patientId=${record.id}`)}
            >
              Dotazník
            </Button>
          </Tooltip>
          <Tooltip title="Zobrazit detail">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => router.push(`/dashboard/patients/${record.id}`)}
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
    <Layout style={{ minHeight: '100vh' }}>
      {/* Dark Sidebar Menu */}
      <Layout.Sider
        width={250}
        style={{
          background: 'linear-gradient(180deg, #2d1b4e 0%, #1a1a2e 100%)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{
          padding: '24px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Title level={3} style={{ margin: 0, color: 'white', fontWeight: 700 }}>
            Profema
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
            Gynekologický dotazník
          </Text>
        </div>

        <div style={{ marginTop: 16 }}>
          <div
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '16px 24px',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            }}
          >
            <UserOutlined style={{ fontSize: 18 }} />
            <span style={{ fontWeight: 500 }}>Dashboard</span>
          </div>
          <div
            onClick={() => router.push('/dashboard/patients')}
            style={{
              padding: '16px 24px',
              cursor: 'pointer',
              background: 'rgba(168, 85, 247, 0.2)',
              borderLeft: '4px solid #a855f7',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <UserOutlined style={{ fontSize: 18 }} />
            <span style={{ fontWeight: 500 }}>Pacientky</span>
          </div>
          <div
            onClick={() => router.push('/dashboard/questionnaires')}
            style={{
              padding: '16px 24px',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            }}
          >
            <FileTextOutlined style={{ fontSize: 18 }} />
            <span style={{ fontWeight: 500 }}>Dotazníky</span>
          </div>
        </div>
      </Layout.Sider>

      <Layout style={{ background: '#1a1a2e' }}>
        {/* Modern Header / Status Bar */}
        <Header
          style={{
            background: 'linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 100%)',
            padding: '0 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            height: 64
          }}
        >
          <Title level={4} style={{ margin: 0, color: 'white' }}>
            Pacientky
          </Title>

          <Space size="large">
            <Tooltip title="Notifikace">
              <Badge count={0} showZero={false}>
                <BellOutlined style={{ fontSize: 20, color: 'white', cursor: 'pointer' }} />
              </Badge>
            </Tooltip>

            <Space size={12}>
              <Avatar style={{ backgroundColor: '#a855f7' }}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </Avatar>
              <div>
                <div style={{ color: 'white', fontWeight: 500, fontSize: 14, lineHeight: '20px' }}>
                  {user?.first_name} {user?.last_name}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: '16px' }}>
                  {user?.role === 'admin' ? 'Administrátor' : 'Lékař'}
                </div>
              </div>
            </Space>

            <Button
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              Odhlásit
            </Button>
          </Space>
        </Header>

        <Content style={{ padding: '32px', background: '#1a1a2e' }}>
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
                bordered={false}
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
                      Celkem pacientek
                    </Text>
                    <Text style={{ color: '#ffffff', fontSize: 28, fontWeight: 700 }}>
                      {patients?.length || 0}
                    </Text>
                  </div>
                </div>
              </Card>

              <Card
                bordered={false}
                style={{
                  background: 'linear-gradient(135deg, #1e3a20 0%, #152818 100%)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircleOutlined style={{ fontSize: 32, color: '#22c55e' }} />
                  <div>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, display: 'block' }}>
                      Se souhlasem GDPR
                    </Text>
                    <Text style={{ color: '#ffffff', fontSize: 28, fontWeight: 700 }}>
                      {patients?.filter((p: any) => p.gdpr_consent).length || 0}
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
              bordered={false}
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
                  pagination={{ pageSize: 15, showSizeChanger: true }}
                  style={{ marginTop: 16 }}
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
        </Content>
      </Layout>

      {/* Create Patient Modal */}
      <Modal
        title="Nová pacientka"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
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
            <Col span={12}>
              <Form.Item name="birth_number" label="Rodné číslo">
                <Input size="large" placeholder="000000/0000" />
              </Form.Item>
            </Col>
            <Col span={12}>
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
                Vytvořit
              </Button>
              <Button onClick={() => setIsModalVisible(false)} size="large">
                Zrušit
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
