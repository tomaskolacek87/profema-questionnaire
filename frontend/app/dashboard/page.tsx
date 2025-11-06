'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Row, Col, Card, Statistic, Table, Button, Input, Space, Typography,
  Tag, Spin, Empty, Avatar, Badge, Tooltip, Layout
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FileTextOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SendOutlined,
  EyeOutlined,
  RiseOutlined,
  TeamOutlined,
  LogoutOutlined,
  BellOutlined
} from '@ant-design/icons';
import { patientsApi, statisticsApi } from '@/lib/api';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

const { Title, Text } = Typography;
const { Search } = Input;
const { Header, Content } = Layout;

export default function DashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
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

  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['statistics-overview'],
    queryFn: async () => {
      const response = await statisticsApi.getOverview();
      return response.data;
    },
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const response = await statisticsApi.getRecentActivity(5);
      return response.data;
    },
  });

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await patientsApi.getAll();
      return response.data;
    },
  });

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
              {record.email || 'Bez emailu'}
            </Text>
          </div>
        </Space>
      ),
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
            >
              Poslat odkaz
            </Button>
          </Tooltip>
          <Tooltip title="Zobrazit detail">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => router.push(`/patients/${record.id}`)}
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
      p.email?.toLowerCase().includes(searchQuery.toLowerCase()),
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
            Dashboard
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
        {/* Welcome Section */}
        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0, marginBottom: 8, color: '#ffffff' }}>
            Vítejte zpět, {user?.first_name}! 👋
          </Title>
          <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }}>
            {format(new Date(), 'EEEE, d. MMMM yyyy', { locale: cs })}
          </Text>
        </div>

        {/* Quick Actions */}
        <Space size="large" style={{ marginBottom: 32 }}>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => router.push('/dashboard/new-questionnaire')}
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              border: 'none',
              height: 48,
              fontSize: 16,
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)'
            }}
          >
            Nový dotazník
          </Button>
          <Button
            size="large"
            icon={<PlusOutlined />}
            onClick={() => router.push('/patients/new')}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              height: 48,
              fontSize: 16,
              borderRadius: 8
            }}
          >
            Nová pacientka
          </Button>
        </Space>

        {/* Statistics Cards */}
        {statsLoading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{
                borderRadius: 12,
                background: 'linear-gradient(135deg, #2d1b4e 0%, #1e1536 100%)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                border: '1px solid rgba(168, 85, 247, 0.2)'
              }}>
                <Statistic
                  title={<Text strong style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Celkem pacientek</Text>}
                  value={stats?.totalPatients || 0}
                  prefix={<TeamOutlined style={{ color: '#a855f7' }} />}
                  valueStyle={{ color: '#a855f7', fontSize: 32, fontWeight: 700 }}
                />
                <div style={{ marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  <RiseOutlined /> +{stats?.newPatientsLast30Days || 0} tento měsíc
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{
                borderRadius: 12,
                background: 'linear-gradient(135deg, #1e3a20 0%, #152818 100%)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}>
                <Statistic
                  title={<Text strong style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Odesláno dotazníků</Text>}
                  value={stats?.totalQuestionnaires || 0}
                  prefix={<SendOutlined style={{ color: '#22c55e' }} />}
                  valueStyle={{ color: '#22c55e', fontSize: 32, fontWeight: 700 }}
                />
                <div style={{ marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  Celkem odesláno
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{
                borderRadius: 12,
                background: 'linear-gradient(135deg, #3d2b1f 0%, #2d1f15 100%)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                border: '1px solid rgba(251, 146, 60, 0.2)'
              }}>
                <Statistic
                  title={<Text strong style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Dokončené</Text>}
                  value={stats?.completedQuestionnaires || 0}
                  prefix={<CheckCircleOutlined style={{ color: '#fb923c' }} />}
                  valueStyle={{ color: '#fb923c', fontSize: 32, fontWeight: 700 }}
                />
                <div style={{ marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  Míra dokončení: {stats?.completionRate || 0}%
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{
                borderRadius: 12,
                background: 'linear-gradient(135deg, #3d1f1f 0%, #2d1515 100%)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                <Statistic
                  title={<Text strong style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Čekající</Text>}
                  value={(stats?.totalQuestionnaires || 0) - (stats?.completedQuestionnaires || 0)}
                  prefix={<ClockCircleOutlined style={{ color: '#ef4444' }} />}
                  valueStyle={{ color: '#ef4444', fontSize: 32, fontWeight: 700 }}
                />
                <div style={{ marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  Nevyplněné dotazníky
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* Recent Activity */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <UserOutlined style={{ color: '#a855f7' }} />
                  <Text strong style={{ color: '#ffffff' }}>Poslední pacientky</Text>
                </Space>
              }
              extra={
                <Button type="link" onClick={() => router.push('/patients')}>
                  Zobrazit vše →
                </Button>
              }
              bordered={false}
              style={{
                borderRadius: 12,
                background: '#16213e',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                height: '100%'
              }}
              headStyle={{ color: '#ffffff', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              {activityLoading ? (
                <Spin />
              ) : recentActivity?.recentPatients?.length > 0 ? (
                <div>
                  {recentActivity.recentPatients.map((patient: any, idx: number) => (
                    <div
                      key={patient.id}
                      style={{
                        padding: '12px 0',
                        borderBottom: idx < recentActivity.recentPatients.length - 1 ? '1px solid #f0f0f0' : 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Space>
                        <Avatar style={{ backgroundColor: '#a855f7' }}>
                          {patient.name?.[0]}
                        </Avatar>
                        <div>
                          <div style={{ fontWeight: 500, color: '#ffffff' }}>{patient.name}</div>
                          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                            {format(new Date(patient.createdAt), 'dd.MM.yyyy HH:mm')}
                          </Text>
                        </div>
                      </Space>
                      <Badge status="success" text="Aktivní" />
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="Žádné pacientky" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <FileTextOutlined style={{ color: '#a855f7' }} />
                  <Text strong style={{ color: '#ffffff' }}>Poslední dotazníky</Text>
                </Space>
              }
              extra={
                <Button type="link" onClick={() => router.push('/questionnaires')}>
                  Zobrazit vše →
                </Button>
              }
              bordered={false}
              style={{
                borderRadius: 12,
                background: '#16213e',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                height: '100%'
              }}
              headStyle={{ color: '#ffffff', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              {activityLoading ? (
                <Spin />
              ) : recentActivity?.recentQuestionnaires?.length > 0 ? (
                <div>
                  {recentActivity.recentQuestionnaires.map((q: any, idx: number) => (
                    <div
                      key={q.id}
                      style={{
                        padding: '12px 0',
                        borderBottom: idx < recentActivity.recentQuestionnaires.length - 1 ? '1px solid #f0f0f0' : 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500, color: '#ffffff' }}>{q.patientName}</div>
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                          {format(new Date(q.createdAt), 'dd.MM.yyyy HH:mm')}
                        </Text>
                      </div>
                      <Tag
                        color={q.status === 'completed' ? 'green' : 'orange'}
                        icon={q.status === 'completed' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                      >
                        {q.status === 'completed' ? 'Dokončeno' : 'Čeká'}
                      </Tag>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="Žádné dotazníky" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>
          </Col>
        </Row>

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
            placeholder="Hledat podle jména nebo emailu..."
            prefix={<SearchOutlined />}
            size="large"
            style={{ marginBottom: 16, maxWidth: 400, borderRadius: 8 }}
            onChange={e => setSearchQuery(e.target.value)}
            allowClear
          />

          <Table
            columns={columns}
            dataSource={filteredPatients || []}
            loading={isLoading}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true }}
            style={{ marginTop: 16 }}
          />
        </Card>
      </Content>
      </Layout>
    </Layout>
  );
}
