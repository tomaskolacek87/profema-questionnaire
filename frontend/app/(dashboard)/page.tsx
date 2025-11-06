'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Statistic, Table, Button, Input, Space, Typography, Tag, message, Spin } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FileTextOutlined,
  UserOutlined,
  FileOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { patientsApi, statisticsApi } from '@/lib/api';
import { format } from 'date-fns';

const { Title } = Typography;
const { Search } = Input;

export default function DashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

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
      title: 'Jméno',
      dataIndex: 'first_name',
      key: 'first_name',
      render: (text: string, record: any) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: 'Rodné číslo',
      dataIndex: 'birth_number',
      key: 'birth_number',
    },
    {
      title: 'Datum narození',
      dataIndex: 'birth_date',
      key: 'birth_date',
      render: (date: string) => (date ? format(new Date(date), 'dd.MM.yyyy') : '-'),
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone || '-',
    },
    {
      title: 'Vysokorizikové',
      dataIndex: 'is_high_risk',
      key: 'is_high_risk',
      render: (isHighRisk: boolean) =>
        isHighRisk ? <Tag color="red">Ano</Tag> : <Tag color="green">Ne</Tag>,
    },
    {
      title: 'Akce',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => router.push(`/questionnaire?patientId=${record.id}`)}
          >
            Nový dotazník
          </Button>
          <Button onClick={() => router.push(`/patient/${record.id}`)}>Detail</Button>
        </Space>
      ),
    },
  ];

  const filteredPatients = patients?.filter(
    (p: any) =>
      p.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.birth_number?.includes(searchQuery),
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => router.push('/questionnaire')}
        >
          Nová pacientka
        </Button>
      </div>

      {/* Statistics Cards */}
      {statsLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Celkem pacientek"
                value={stats?.totalPatients || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Celkem dotazníků"
                value={stats?.totalQuestionnaires || 0}
                prefix={<FileOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Dokončené"
                value={stats?.completedQuestionnaires || 0}
                prefix={<CheckCircleOutlined />}
                suffix={`/ ${stats?.totalQuestionnaires || 0}`}
                valueStyle={{ color: '#52c41a' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                Míra dokončení: {stats?.completionRate || 0}%
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Nové (30 dní)"
                value={stats?.newPatientsLast30Days || 0}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Recent Activity */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Poslední pacientky" extra={<Button type="link" onClick={() => router.push('/patients')}>Zobrazit vše</Button>}>
            {activityLoading ? (
              <Spin />
            ) : (
              <div>
                {recentActivity?.recentPatients?.map((patient: any) => (
                  <div key={patient.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ fontWeight: 500 }}>{patient.name}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      {format(new Date(patient.createdAt), 'dd.MM.yyyy HH:mm')}
                      {patient.assignedDoctor && ` • ${patient.assignedDoctor}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Poslední dotazníky" extra={<Button type="link" onClick={() => router.push('/questionnaires')}>Zobrazit vše</Button>}>
            {activityLoading ? (
              <Spin />
            ) : (
              <div>
                {recentActivity?.recentQuestionnaires?.map((questionnaire: any) => (
                  <div key={questionnaire.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{questionnaire.patientName}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          {format(new Date(questionnaire.createdAt), 'dd.MM.yyyy HH:mm')}
                        </div>
                      </div>
                      <Tag color={questionnaire.status === 'completed' ? 'green' : 'orange'}>
                        {questionnaire.status === 'completed' ? 'Dokončeno' : 'Rozpracováno'}
                      </Tag>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Patients Table */}
      <Card title="Seznam pacientek" style={{ marginBottom: 24 }}>
        <Search
          placeholder="Hledat podle jména nebo rodného čísla"
          prefix={<SearchOutlined />}
          size="large"
          style={{ marginBottom: 16 }}
          onChange={e => setSearchQuery(e.target.value)}
          allowClear
        />

        <Table
          columns={columns}
          dataSource={filteredPatients || []}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
