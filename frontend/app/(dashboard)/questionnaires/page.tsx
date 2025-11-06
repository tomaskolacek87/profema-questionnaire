'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Card, Table, Button, Input, Space, Typography, Tag, Spin, Empty, Tooltip, Avatar, Badge
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
  BellOutlined,
  DashboardOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  ScanOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

const { Title, Text } = Typography;
const { Search } = Input;

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
    { value: 'all', label: 'Všechny', icon: <FileTextOutlined />, color: '#a855f7' },
    { value: 'pregnant', label: 'Těhotné', icon: <HeartOutlined />, color: '#ec4899' },
    { value: 'gynecology', label: 'Gynekologie', icon: <MedicineBoxOutlined />, color: '#22c55e' },
    { value: 'ultrasound', label: 'UZ vyšetření', icon: <ScanOutlined />, color: '#3b82f6' },
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
      title: 'Typ',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeConfig = questionnaireTypes.find(t => t.value === type);
        return typeConfig ? (
          <Tag color={typeConfig.color} icon={typeConfig.icon}>
            {typeConfig.label}
          </Tag>
        ) : <Tag>{type}</Tag>;
      },
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

      // Filter by type
      const matchesType = selectedType === 'all' || q.type === selectedType;

      return matchesSearch && matchesType;
    }
  );

  return (
    <div style={{ background: '#1a1a2e', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>

            {/* VYPLNIT DOTAZNÍK - Hlavní akční sekce */}
            <Card
              style={{
                background: 'linear-gradient(135deg, #2d1b4e 0%, #1e1536 100%)',
                border: '2px solid rgba(168, 85, 247, 0.3)',
                borderRadius: 16,
                marginBottom: 32,
                boxShadow: '0 8px 24px rgba(168, 85, 247, 0.2)'
              }}
            >
              <Title level={3} style={{ color: '#ffffff', marginBottom: 24, textAlign: 'center' }}>
                <PlusOutlined style={{ marginRight: 12 }} />
                Vyplnit dotazník
              </Title>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 20
              }}>
                {/* Dotazník 1: Pro těhotné */}
                <Card
                  hoverable
                  onClick={() => router.push('/dashboard/new-questionnaire')}
                  style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(236, 72, 153, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <HeartOutlined style={{ fontSize: 48, color: 'white', marginBottom: 16 }} />
                    <Title level={4} style={{ color: 'white', margin: 0, marginBottom: 8 }}>
                      Dotazník pro těhotné
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
                      Komplexní dotazník pro těhotné ženy
                    </Text>
                  </div>
                </Card>

                {/* Dotazník 2: Gynekologický */}
                <Card
                  hoverable
                  onClick={() => router.push('/dashboard/new-questionnaire-gynecology')}
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(34, 197, 94, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <MedicineBoxOutlined style={{ fontSize: 48, color: 'white', marginBottom: 16 }} />
                    <Title level={4} style={{ color: 'white', margin: 0, marginBottom: 8 }}>
                      Gynekologický dotazník
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
                      Obecný gynekologický dotazník
                    </Text>
                  </div>
                </Card>

                {/* Dotazník 3: UZ vyšetření - Připraveno */}
                <Card
                  style={{
                    background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                    border: 'none',
                    borderRadius: 12,
                    opacity: 0.6,
                    cursor: 'not-allowed'
                  }}
                >
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <ScanOutlined style={{ fontSize: 48, color: 'white', marginBottom: 16 }} />
                    <Title level={4} style={{ color: 'white', margin: 0, marginBottom: 8 }}>
                      UZ vyšetření
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
                      Připravuje se...
                    </Text>
                  </div>
                </Card>
              </div>
            </Card>

            {/* Filtrování vyplněných dotazníků */}
            <div style={{ marginBottom: 24 }}>
              <Title level={4} style={{ color: '#ffffff', marginBottom: 16 }}>
                Vyplněné dotazníky
              </Title>
              <Space size="middle">
                <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Filtrovat:</Text>
                <Space.Compact>
                  {questionnaireTypes.map(type => (
                    <Button
                      key={type.value}
                      icon={type.icon}
                      onClick={() => setSelectedType(type.value)}
                      style={{
                        background: selectedType === type.value
                          ? type.color
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
            variant="borderless"
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
            variant="borderless"
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
            variant="borderless"
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
    </div>
  );
}
