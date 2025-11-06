'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Table, Button, Input, Space, Typography, Tag, Card, Select, DatePicker, message } from 'antd';
import { PlusOutlined, SearchOutlined, FileTextOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { patientsApi } from '@/lib/api';
import { format } from 'date-fns';

const { Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

export default function PatientsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: patientsData, isLoading, refetch } = useQuery({
    queryKey: ['patients', page, pageSize, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', pageSize.toString());
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      const response = await patientsApi.getAll();
      return response.data;
    },
  });

  const handleDelete = async (id: string) => {
    try {
      await patientsApi.delete(id);
      message.success('Pacientka byla smazána');
      refetch();
    } catch (error) {
      message.error('Chyba při mazání pacientky');
    }
  };

  const columns = [
    {
      title: 'Jméno',
      dataIndex: 'first_name',
      key: 'first_name',
      render: (text: string, record: any) => (
        <span style={{ fontWeight: 500 }}>
          {record.first_name} {record.last_name}
        </span>
      ),
      sorter: true,
    },
    {
      title: 'Rodné číslo',
      dataIndex: 'birth_number',
      key: 'birth_number',
    },
    {
      title: 'Datum narození',
      dataIndex: 'date_of_birth',
      key: 'date_of_birth',
      render: (date: string) => (date ? format(new Date(date), 'dd.MM.yyyy') : '-'),
      sorter: true,
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone || '-',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => email || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          active: 'green',
          inactive: 'default',
          archived: 'red',
        };
        return <Tag color={colors[status] || 'default'}>{status || 'active'}</Tag>;
      },
    },
    {
      title: 'Vysokorizikové',
      dataIndex: 'is_high_risk',
      key: 'is_high_risk',
      render: (isHighRisk: boolean) =>
        isHighRisk ? <Tag color="red">Ano</Tag> : <Tag color="green">Ne</Tag>,
    },
    {
      title: 'Vytvořeno',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => format(new Date(date), 'dd.MM.yyyy'),
      sorter: true,
    },
    {
      title: 'Akce',
      key: 'actions',
      fixed: 'right' as const,
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/patients/${record.id}`)}
          >
            Detail
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => router.push(`/questionnaire?patientId=${record.id}`)}
          >
            Dotazník
          </Button>
          <Button
            type="link"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => {
              if (confirm('Opravdu chcete smazat tuto pacientku?')) {
                handleDelete(record.id);
              }
            }}
          >
            Smazat
          </Button>
        </Space>
      ),
    },
  ];

  // Client-side filtering
  const filteredData = patientsData?.filter
    ? patientsData.filter((p: any) =>
        searchQuery
          ? p.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.birth_number?.includes(searchQuery)
          : true
      )
    : patientsData;

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>Seznam pacientek</Title>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => router.push('/questionnaire')}
        >
          Přidat pacientku
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Search
            placeholder="Hledat podle jména nebo rodného čísla"
            prefix={<SearchOutlined />}
            size="large"
            onChange={e => setSearchQuery(e.target.value)}
            allowClear
          />

          <Space wrap>
            <Select
              placeholder="Status"
              style={{ width: 150 }}
              allowClear
              onChange={value => setStatusFilter(value)}
            >
              <Select.Option value="active">Aktivní</Select.Option>
              <Select.Option value="inactive">Neaktivní</Select.Option>
              <Select.Option value="archived">Archivované</Select.Option>
            </Select>
          </Space>
        </Space>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredData || []}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: page,
          pageSize: pageSize,
          onChange: (newPage, newPageSize) => {
            setPage(newPage);
            setPageSize(newPageSize || 20);
          },
          showSizeChanger: true,
          showTotal: (total) => `Celkem ${total} pacientek`,
        }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
}
