'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Card, Table, Button, Input, Space, Typography, Tag, Spin, Empty, Tooltip, Layout, Avatar, Badge
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

const { Title, Text } = Typography;
const { Search } = Input;
const { Header, Content } = Layout;

export default function QuestionnairesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
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

  // Questionnaire types
  const questionnaireTypes = [
    { value: 'all', label: 'Všechny dotazníky' },
    { value: 'pregnant', label: 'Dotazník pro těhotné' },
    // Připraveno pro další typy:
    // { value: 'gynecology', label: 'Gynekologický dotazník' },
    // { value: 'ultrasound', label: 'Dotazník k UZ vyšetření' },
  ];

  // Fetch all questionnaires
  const { data: questionnaires, isLoading } = useQuery({
    queryKey: ['questionnaires'],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/questionnaires`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          }
        }
      );
      return response.data;
    },
  });

  const columns = [
    {
      title: 'Pacientka',
      dataIndex: 'patient_name',
      key: 'patient_name',
      render: (name: string, record: any) => (
        <div>
          <div style={{ fontWeight: 500, color: '#ffffff' }}>
            {record.basic_info?.first_name} {record.basic_info?.last_name}
          </div>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            ID: {record.patient_id?.substring(0, 8)}...
          </Text>
        </div>
      ),
    },
    {
      title: 'Vytvořeno',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <Text style={{ color: '#ffffff' }}>
          {format(new Date(date), 'dd.MM.yyyy HH:mm', { locale: cs })}
        </Text>
      ),
    },
    {
      title: 'Dokončeno',
      dataIndex: 'completed_at',
      key: 'completed_at',
      render: (date: string) => date ? (
        <Text style={{ color: '#ffffff' }}>
          {format(new Date(date), 'dd.MM.yyyy HH:mm', { locale: cs })}
        </Text>
      ) : <Text style={{ color: 'rgba(255,255,255,0.3)' }}>-</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) =>
        status === 'completed' ? (
          <Tag color="green" icon={<CheckCircleOutlined />}>Dokončeno</Tag>
        ) : status === 'draft' ? (
          <Tag color="orange" icon={<ClockCircleOutlined />}>Rozpracováno</Tag>
        ) : (
          <Tag color="default">{status}</Tag>
        ),
    },
    {
      title: 'Těhotenství',
      dataIndex: 'pregnancy_info',
      key: 'pregnancy',
      render: (info: any) => info?.pregnancy_number ? (
        <Text style={{ color: '#ffffff' }}>{info.pregnancy_number}. těhotenství</Text>
      ) : <Text style={{ color: 'rgba(255,255,255,0.3)' }}>-</Text>,
    },
    {
      title: 'Akce',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Zobrazit detail">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => router.push(`/questionnaire/${record.id}/view`)}
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                border: 'none',
                color: 'white'
              }}
            >
              Detail
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredQuestionnaires = questionnaires?.filter(
    (q: any) => {
      // Filter by search query
      const matchesSearch =
        q.basic_info?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.basic_info?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.patient_id?.includes(searchQuery);

      // Filter by type (zatím všechny jsou 'pregnant', později přidáme q.type)
      const matchesType = selectedType === 'all' || true; // Všechny jsou zatím typ 'pregnant'

      return matchesSearch && matchesType;
    }
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
            <span style={{ fontWeight: 500 }}>Pacientky</span>
          </div>
          <div
            onClick={() => router.push('/dashboard/questionnaires')}
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
            Dotazníky
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
            {/* Actions and Filters */}
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>
                  Přehled všech vyplněných dotazníků
                </Text>
              </div>

          <Space size="large">
            {/* Type Filter */}
            <div>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, display: 'block', marginBottom: 8 }}>
                Typ dotazníku:
              </Text>
              <Space.Compact>
                {questionnaireTypes.map(type => (
                  <Button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    style={{
                      background: selectedType === type.value
                        ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
                        : 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: selectedType === type.value
                        ? 'none'
                        : '1px solid rgba(255,255,255,0.2)',
                      fontWeight: selectedType === type.value ? 600 : 400
                    }}
                  >
                    {type.label}
                  </Button>
                ))}
              </Space.Compact>
            </div>

            <div>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, display: 'block', marginBottom: 8 }}>
                &nbsp;
              </Text>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => router.push('/dashboard/new-questionnaire')}
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  border: 'none',
                  height: 40,
                  fontSize: 16,
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)'
                }}
              >
                Vyplnit dotazník
              </Button>
            </div>
          </Space>
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
              <FileTextOutlined style={{ fontSize: 32, color: '#a855f7' }} />
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, display: 'block' }}>
                  Celkem dotazníků
                </Text>
                <Text style={{ color: '#ffffff', fontSize: 28, fontWeight: 700 }}>
                  {questionnaires?.length || 0}
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
                  Dokončené
                </Text>
                <Text style={{ color: '#ffffff', fontSize: 28, fontWeight: 700 }}>
                  {questionnaires?.filter((q: any) => q.status === 'completed').length || 0}
                </Text>
              </div>
            </div>
          </Card>

          <Card
            bordered={false}
            style={{
              background: 'linear-gradient(135deg, #3d2b1f 0%, #2d1f15 100%)',
              border: '1px solid rgba(251, 146, 60, 0.2)',
              borderRadius: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ClockCircleOutlined style={{ fontSize: 32, color: '#fb923c' }} />
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, display: 'block' }}>
                  Rozpracované
                </Text>
                <Text style={{ color: '#ffffff', fontSize: 28, fontWeight: 700 }}>
                  {questionnaires?.filter((q: any) => q.status === 'draft').length || 0}
                </Text>
              </div>
            </div>
          </Card>
        </div>

        {/* Questionnaires Table */}
        <Card
          title={
            <Space>
              <FileTextOutlined style={{ color: '#a855f7' }} />
              <Text strong style={{ fontSize: 16, color: '#ffffff' }}>Seznam dotazníků</Text>
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
            placeholder="Hledat podle jména pacientky nebo ID..."
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
          ) : filteredQuestionnaires && filteredQuestionnaires.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredQuestionnaires}
              rowKey="id"
              pagination={{ pageSize: 15, showSizeChanger: true }}
              style={{ marginTop: 16 }}
            />
          ) : (
            <Empty
              description={
                <Text style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {searchQuery ? 'Žádné dotazníky nenalezeny' : 'Zatím žádné dotazníky'}
                </Text>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
