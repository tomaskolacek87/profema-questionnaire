'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Table, Button, Input, Space, Typography, Tag, message } from 'antd';
import { PlusOutlined, SearchOutlined, FileTextOutlined } from '@ant-design/icons';
import { patientsApi } from '@/lib/api';
import { format } from 'date-fns';

const { Title } = Typography;
const { Search } = Input;

export default function DashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

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
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
        <Title level={3}>Seznam pacientek</Title>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => router.push('/questionnaire')}
        >
          Nová pacientka
        </Button>
      </div>

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
    </div>
  );
}
