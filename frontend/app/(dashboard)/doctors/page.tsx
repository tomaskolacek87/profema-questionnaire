'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  message,
  Tag,
  Tooltip,
  ColorPicker,
  Row,
  Col,
  TimePicker,
  Checkbox,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import { doctorsApi } from '@/lib/api/calendar';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// Default working hours
const defaultWorkingHours = {
  monday: { start: '08:00', end: '16:00' },
  tuesday: { start: '08:00', end: '16:00' },
  wednesday: { start: '08:00', end: '16:00' },
  thursday: { start: '08:00', end: '16:00' },
  friday: { start: '08:00', end: '16:00' },
};

const daysOfWeek = [
  { key: 'monday', label: 'Pondělí' },
  { key: 'tuesday', label: 'Úterý' },
  { key: 'wednesday', label: 'Středa' },
  { key: 'thursday', label: 'Čtvrtek' },
  { key: 'friday', label: 'Pátek' },
  { key: 'saturday', label: 'Sobota' },
  { key: 'sunday', label: 'Neděle' },
];

export default function DoctorsPage() {
  const queryClient = useQueryClient();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [form] = Form.useForm();

  // Fetch doctors
  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const response = await doctorsApi.getAll();
      return response.data;
    },
  });

  // Create doctor mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => doctorsApi.create(data),
    onSuccess: () => {
      message.success('Lékař byl vytvořen');
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Chyba při vytváření lékaře');
    },
  });

  // Update doctor mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      doctorsApi.update(id, data),
    onSuccess: () => {
      message.success('Lékař byl aktualizován');
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setIsModalVisible(false);
      setIsEditMode(false);
      setEditingDoctor(null);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Chyba při aktualizaci lékaře');
    },
  });

  // Delete doctor mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => doctorsApi.delete(id),
    onSuccess: () => {
      message.success('Lékař byl deaktivován');
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Chyba při deaktivaci lékaře');
    },
  });

  const columns = [
    {
      title: 'Lékař',
      key: 'name',
      render: (_: any, record: any) => (
        <Space>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: record.calendarColor,
            }}
          />
          <div>
            <div style={{ fontWeight: 500, color: '#ffffff' }}>
              {record.title} {record.firstName} {record.lastName}
            </div>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              {record.specialty || 'Bez speciality'}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <Text style={{ color: '#ffffff' }}>{email}</Text>
      ),
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) =>
        phone ? (
          <Text style={{ color: '#ffffff' }}>{phone}</Text>
        ) : (
          <Text style={{ color: 'rgba(255,255,255,0.3)' }}>-</Text>
        ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive: boolean) =>
        isActive ? (
          <Tag color="green">Aktivní</Tag>
        ) : (
          <Tag color="default">Neaktivní</Tag>
        ),
    },
    {
      title: 'Akce',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Upravit">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Deaktivovat">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleEdit = (doctor: any) => {
    setEditingDoctor(doctor);
    setIsEditMode(true);

    // Convert working hours to dayjs format for TimePicker
    const workingHoursForForm: any = {};
    if (doctor.workingHours) {
      Object.keys(doctor.workingHours).forEach((day) => {
        const hours = doctor.workingHours[day];
        if (hours) {
          workingHoursForForm[day] = {
            enabled: true,
            time: [
              dayjs(hours.start, 'HH:mm'),
              dayjs(hours.end, 'HH:mm'),
            ],
          };
        }
      });
    }

    form.setFieldsValue({
      title: doctor.title,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      phone: doctor.phone,
      specialty: doctor.specialty,
      licenseNumber: doctor.licenseNumber,
      calendarColor: doctor.calendarColor,
      ...workingHoursForForm,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Deaktivovat lékaře?',
      content: 'Opravdu chcete deaktivovat tohoto lékaře?',
      okText: 'Deaktivovat',
      okType: 'danger',
      cancelText: 'Zrušit',
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const handleSubmit = (values: any) => {
    // Convert working hours back to API format
    const workingHours: any = {};
    daysOfWeek.forEach((day) => {
      const dayData = values[day.key];
      if (dayData?.enabled && dayData?.time) {
        workingHours[day.key] = {
          start: dayData.time[0].format('HH:mm'),
          end: dayData.time[1].format('HH:mm'),
        };
      }
    });

    const data = {
      title: values.title,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      specialty: values.specialty,
      licenseNumber: values.licenseNumber,
      calendarColor: typeof values.calendarColor === 'string'
        ? values.calendarColor
        : values.calendarColor?.toHexString?.() || '#a855f7',
      workingHours,
      isActive: true,
    };

    if (isEditMode && editingDoctor) {
      updateMutation.mutate({ id: editingDoctor.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, marginBottom: 8, color: '#ffffff' }}>
            <MedicineBoxOutlined style={{ marginRight: 12 }} />
            Správa lékařů
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.6)' }}>
            Přehled a správa lékařů v systému
          </Text>
        </div>

        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => {
            setIsEditMode(false);
            setEditingDoctor(null);
            form.resetFields();
            form.setFieldsValue({
              calendarColor: '#a855f7',
              monday: { enabled: true, time: [dayjs('08:00', 'HH:mm'), dayjs('16:00', 'HH:mm')] },
              tuesday: { enabled: true, time: [dayjs('08:00', 'HH:mm'), dayjs('16:00', 'HH:mm')] },
              wednesday: { enabled: true, time: [dayjs('08:00', 'HH:mm'), dayjs('16:00', 'HH:mm')] },
              thursday: { enabled: true, time: [dayjs('08:00', 'HH:mm'), dayjs('16:00', 'HH:mm')] },
              friday: { enabled: true, time: [dayjs('08:00', 'HH:mm'), dayjs('16:00', 'HH:mm')] },
            });
            setIsModalVisible(true);
          }}
          style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
            border: 'none',
          }}
        >
          Nový lékař
        </Button>
      </div>

      <Card
        style={{
          borderRadius: 12,
          background: '#16213e',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Table
          columns={columns}
          dataSource={doctors}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          className="dark-table"
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Doctor Modal */}
      <Modal
        title={
          <Space>
            {isEditMode ? <EditOutlined /> : <PlusOutlined />}
            <span>{isEditMode ? 'Upravit lékaře' : 'Nový lékař'}</span>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditMode(false);
          setEditingDoctor(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 24 }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Titul" name="title">
                <Input placeholder="MUDr., Prof., ..." size="large" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Jméno"
                name="firstName"
                rules={[{ required: true, message: 'Vyplňte jméno' }]}
              >
                <Input placeholder="Jana" size="large" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Příjmení"
                name="lastName"
                rules={[{ required: true, message: 'Vyplňte příjmení' }]}
              >
                <Input placeholder="Nováková" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Vyplňte email' },
                  { type: 'email', message: 'Neplatný email' },
                ]}
              >
                <Input placeholder="jana.novakova@profema.cz" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Telefon" name="phone">
                <Input placeholder="+420 123 456 789" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Specialita" name="specialty">
                <Input placeholder="Gynekologie, Porodnictví..." size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Číslo licence" name="licenseNumber">
                <Input placeholder="12345" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Barva v kalendáři" name="calendarColor">
            <ColorPicker showText format="hex" size="large" />
          </Form.Item>

          <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>
            Pracovní doba
          </Title>

          {daysOfWeek.map((day) => (
            <Row key={day.key} gutter={16} style={{ marginBottom: 12 }}>
              <Col span={6}>
                <Form.Item name={[day.key, 'enabled']} valuePropName="checked" noStyle>
                  <Checkbox>{day.label}</Checkbox>
                </Form.Item>
              </Col>
              <Col span={18}>
                <Form.Item
                  name={[day.key, 'time']}
                  noStyle
                  dependencies={[[day.key, 'enabled']]}
                >
                  {({ getFieldValue }) => {
                    const enabled = getFieldValue([day.key, 'enabled']);
                    return (
                      <TimePicker.RangePicker
                        format="HH:mm"
                        minuteStep={15}
                        disabled={!enabled}
                        style={{ width: '100%' }}
                      />
                    );
                  }}
                </Form.Item>
              </Col>
            </Row>
          ))}

          <Form.Item style={{ marginTop: 32 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={createMutation.isPending || updateMutation.isPending}
                style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  border: 'none',
                }}
              >
                {isEditMode ? 'Uložit změny' : 'Vytvořit lékaře'}
              </Button>
              <Button
                size="large"
                onClick={() => {
                  setIsModalVisible(false);
                  setIsEditMode(false);
                  setEditingDoctor(null);
                  form.resetFields();
                }}
              >
                Zrušit
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

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

        .dark-table .ant-table-tbody > tr > td {
          color: #ffffff !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
      `}</style>
    </div>
  );
}
