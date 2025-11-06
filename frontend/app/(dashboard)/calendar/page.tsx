'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { cs } from 'date-fns/locale';
import {
  Card,
  Button,
  Space,
  Typography,
  Select,
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  message,
  Tag,
  Tooltip,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { doctorsApi, appointmentsApi } from '@/lib/api/calendar';
import dayjs from 'dayjs';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = TimePicker;

// Setup localizer for react-big-calendar
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { 'cs': cs },
});

// Appointment types
const appointmentTypes = [
  { value: 'consultation', label: 'Konzultace', color: '#a855f7' },
  { value: 'checkup', label: 'Kontrola', color: '#3b82f6' },
  { value: 'ultrasound', label: 'UZ vyšetření', color: '#ec4899' },
  { value: 'surgery', label: 'Zákrok', color: '#ef4444' },
  { value: 'other', label: 'Jiné', color: '#64748b' },
];

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<View>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [form] = Form.useForm();

  // Fetch doctors
  const { data: doctors, isLoading: loadingDoctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const response = await doctorsApi.getAll();
      return response.data;
    },
  });

  // Auto-select all doctors on load
  useEffect(() => {
    if (doctors && doctors.length > 0 && selectedDoctors.length === 0) {
      setSelectedDoctors(doctors.map((d: any) => d.id));
    }
  }, [doctors, selectedDoctors.length]);

  // Calculate date range based on current view
  const getDateRange = useCallback(() => {
    let start, end;

    if (currentView === 'month') {
      start = startOfMonth(currentDate);
      end = endOfMonth(currentDate);
    } else if (currentView === 'week') {
      start = startOfWeek(currentDate, { weekStartsOn: 1 });
      end = addDays(start, 6);
    } else {
      // day view
      start = currentDate;
      end = currentDate;
    }

    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(addDays(end, 1), 'yyyy-MM-dd'), // Add 1 day to include the end date
    };
  }, [currentDate, currentView]);

  // Fetch appointments
  const { data: appointments, isLoading: loadingAppointments } = useQuery({
    queryKey: ['appointments', getDateRange(), selectedDoctors],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();
      const response = await appointmentsApi.getAll({ startDate, endDate });
      return response.data;
    },
    enabled: selectedDoctors.length > 0,
  });

  // Create appointment mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => appointmentsApi.create(data),
    onSuccess: () => {
      message.success('Schůzka byla vytvořena');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Chyba při vytváření schůzky');
    },
  });

  // Update appointment mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      appointmentsApi.update(id, data),
    onSuccess: () => {
      message.success('Schůzka byla aktualizována');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setIsModalVisible(false);
      setIsEditMode(false);
      setSelectedEvent(null);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Chyba při aktualizaci schůzky');
    },
  });

  // Delete appointment mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.delete(id),
    onSuccess: () => {
      message.success('Schůzka byla smazána');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setIsModalVisible(false);
      setIsEditMode(false);
      setSelectedEvent(null);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Chyba při mazání schůzky');
    },
  });

  // Transform appointments to calendar events
  const events = appointments
    ?.filter((apt: any) => selectedDoctors.includes(apt.doctor.id))
    .map((apt: any) => ({
      id: apt.id,
      title: apt.title,
      start: new Date(apt.startTime),
      end: new Date(apt.endTime),
      resource: {
        ...apt,
        color: apt.doctor.calendarColor || '#a855f7',
      },
    })) || [];

  // Handle slot selection (click on empty slot to create appointment)
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setIsEditMode(false);
    setSelectedEvent(null);
    form.setFieldsValue({
      doctorId: selectedDoctors[0],
      date: dayjs(start),
      timeRange: [dayjs(start), dayjs(end)],
      appointmentType: 'consultation',
      status: 'scheduled',
    });
    setIsModalVisible(true);
  };

  // Handle event selection (click on existing appointment)
  const handleSelectEvent = (event: any) => {
    setIsEditMode(true);
    setSelectedEvent(event);
    const apt = event.resource;
    form.setFieldsValue({
      doctorId: apt.doctor.id,
      patientId: apt.patient?.id,
      title: apt.title,
      description: apt.description,
      appointmentType: apt.appointmentType,
      date: dayjs(apt.startTime),
      timeRange: [dayjs(apt.startTime), dayjs(apt.endTime)],
      location: apt.location,
      room: apt.room,
      status: apt.status,
      internalNotes: apt.internalNotes,
    });
    setIsModalVisible(true);
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    const startTime = values.date
      .hour(values.timeRange[0].hour())
      .minute(values.timeRange[0].minute())
      .toISOString();
    const endTime = values.date
      .hour(values.timeRange[1].hour())
      .minute(values.timeRange[1].minute())
      .toISOString();

    const data = {
      doctorId: values.doctorId,
      patientId: values.patientId,
      title: values.title,
      description: values.description,
      appointmentType: values.appointmentType,
      startTime,
      endTime,
      location: values.location,
      room: values.room,
      status: values.status,
      internalNotes: values.internalNotes,
    };

    if (isEditMode && selectedEvent) {
      updateMutation.mutate({ id: selectedEvent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Handle delete
  const handleDelete = () => {
    Modal.confirm({
      title: 'Smazat schůzku?',
      content: 'Opravdu chcete smazat tuto schůzku?',
      okText: 'Smazat',
      okType: 'danger',
      cancelText: 'Zrušit',
      onOk: () => {
        if (selectedEvent) {
          deleteMutation.mutate(selectedEvent.id);
        }
      },
    });
  };

  // Custom event styling
  const eventStyleGetter = (event: any) => {
    return {
      style: {
        backgroundColor: event.resource.color,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        fontSize: '13px',
      },
    };
  };

  if (loadingDoctors) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, marginBottom: 8, color: '#ffffff' }}>
            <CalendarOutlined style={{ marginRight: 12 }} />
            Plánovací kalendář
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.6)' }}>
            Správa schůzek a plánování lékařů
          </Text>
        </div>

        <Space wrap>
          <Select
            mode="multiple"
            placeholder="Vyberte lékaře"
            value={selectedDoctors}
            onChange={setSelectedDoctors}
            style={{ minWidth: 250 }}
            maxTagCount="responsive"
          >
            {doctors?.map((doctor: any) => (
              <Option key={doctor.id} value={doctor.id}>
                <Space>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: doctor.calendarColor,
                      display: 'inline-block',
                    }}
                  />
                  {doctor.fullName || `${doctor.firstName} ${doctor.lastName}`}
                </Space>
              </Option>
            ))}
          </Select>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsEditMode(false);
              setSelectedEvent(null);
              form.resetFields();
              form.setFieldsValue({
                doctorId: selectedDoctors[0],
                date: dayjs(),
                timeRange: [dayjs().hour(8).minute(0), dayjs().hour(9).minute(0)],
                appointmentType: 'consultation',
                status: 'scheduled',
                location: 'Ordinace Profema',
              });
              setIsModalVisible(true);
            }}
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              border: 'none',
            }}
          >
            Nová schůzka
          </Button>
        </Space>
      </div>

      <Card
        style={{
          borderRadius: 12,
          background: '#16213e',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ height: 700 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={currentView}
            onView={setCurrentView}
            date={currentDate}
            onNavigate={setCurrentDate}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            selectable
            step={15}
            timeslots={4}
            min={new Date(1970, 1, 1, 7, 0, 0)}
            max={new Date(1970, 1, 1, 20, 0, 0)}
            messages={{
              today: 'Dnes',
              previous: 'Předchozí',
              next: 'Další',
              month: 'Měsíc',
              week: 'Týden',
              day: 'Den',
              agenda: 'Agenda',
              date: 'Datum',
              time: 'Čas',
              event: 'Událost',
              noEventsInRange: 'Žádné schůzky v tomto období',
            }}
            formats={{
              dateFormat: 'd',
              dayFormat: (date, culture, localizer) =>
                localizer?.format(date, 'EEE d/M', culture) || '',
              dayHeaderFormat: (date, culture, localizer) =>
                localizer?.format(date, 'EEEE d. MMMM', culture) || '',
              monthHeaderFormat: (date, culture, localizer) =>
                localizer?.format(date, 'LLLL yyyy', culture) || '',
            }}
          />
        </div>

        <style jsx global>{`
          .rbc-calendar {
            font-family: inherit;
            color: #ffffff;
          }

          .rbc-header {
            background: rgba(45, 27, 78, 0.6);
            color: rgba(255, 255, 255, 0.9);
            border-color: rgba(168, 85, 247, 0.3) !important;
            padding: 12px 6px;
            font-weight: 600;
          }

          .rbc-time-view,
          .rbc-month-view {
            background: transparent;
            border-color: rgba(255, 255, 255, 0.1) !important;
          }

          .rbc-time-content,
          .rbc-time-header-content,
          .rbc-month-row {
            border-color: rgba(255, 255, 255, 0.1) !important;
          }

          .rbc-day-bg,
          .rbc-time-slot {
            border-color: rgba(255, 255, 255, 0.05) !important;
          }

          .rbc-today {
            background-color: rgba(168, 85, 247, 0.1) !important;
          }

          .rbc-current-time-indicator {
            background-color: #ec4899;
          }

          .rbc-time-header-gutter,
          .rbc-time-gutter {
            background: rgba(30, 21, 54, 0.4);
          }

          .rbc-timeslot-group {
            min-height: 60px;
          }

          .rbc-label {
            color: rgba(255, 255, 255, 0.6);
            font-size: 12px;
          }

          .rbc-event {
            padding: 4px 6px;
            font-size: 13px;
            cursor: pointer;
          }

          .rbc-event:hover {
            opacity: 1 !important;
          }

          .rbc-toolbar {
            margin-bottom: 16px;
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            padding: 12px;
            background: rgba(45, 27, 78, 0.4);
            border-radius: 8px;
          }

          .rbc-toolbar button {
            color: white;
            background: rgba(168, 85, 247, 0.2);
            border: 1px solid rgba(168, 85, 247, 0.4);
            padding: 6px 14px;
            border-radius: 6px;
            transition: all 0.2s;
          }

          .rbc-toolbar button:hover {
            background: rgba(168, 85, 247, 0.4);
          }

          .rbc-toolbar button.rbc-active {
            background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
            border-color: #a855f7;
          }

          .rbc-toolbar-label {
            color: white;
            font-weight: 600;
            font-size: 16px;
          }
        `}</style>
      </Card>

      {/* Appointment Modal */}
      <Modal
        title={
          <Space>
            {isEditMode ? <EditOutlined /> : <PlusOutlined />}
            <span>{isEditMode ? 'Upravit schůzku' : 'Nová schůzka'}</span>
          </Space>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditMode(false);
          setSelectedEvent(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            label="Lékař"
            name="doctorId"
            rules={[{ required: true, message: 'Vyberte lékaře' }]}
          >
            <Select placeholder="Vyberte lékaře" size="large">
              {doctors?.map((doctor: any) => (
                <Option key={doctor.id} value={doctor.id}>
                  {doctor.title} {doctor.firstName} {doctor.lastName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Název schůzky"
            name="title"
            rules={[{ required: true, message: 'Zadejte název' }]}
          >
            <Input placeholder="Např. Konzultace, Kontrola..." size="large" />
          </Form.Item>

          <Form.Item label="Popis" name="description">
            <TextArea rows={2} placeholder="Volitelný popis schůzky..." />
          </Form.Item>

          <Form.Item label="Typ schůzky" name="appointmentType">
            <Select placeholder="Vyberte typ" size="large">
              {appointmentTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  <Space>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: type.color,
                      }}
                    />
                    {type.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Datum"
            name="date"
            rules={[{ required: true, message: 'Vyberte datum' }]}
          >
            <DatePicker
              format="DD.MM.YYYY"
              placeholder="Vyberte datum"
              style={{ width: '100%' }}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Čas"
            name="timeRange"
            rules={[{ required: true, message: 'Vyberte čas' }]}
          >
            <RangePicker
              format="HH:mm"
              placeholder={['Od', 'Do']}
              style={{ width: '100%' }}
              size="large"
              minuteStep={15}
            />
          </Form.Item>

          <Form.Item label="Místnost" name="room">
            <Input placeholder="Např. Ordinace 1" size="large" />
          </Form.Item>

          <Form.Item label="Interní poznámky" name="internalNotes">
            <TextArea rows={2} placeholder="Soukromé poznámky pro lékaře..." />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
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
                  {isEditMode ? 'Uložit změny' : 'Vytvořit schůzku'}
                </Button>
                <Button
                  size="large"
                  onClick={() => {
                    setIsModalVisible(false);
                    setIsEditMode(false);
                    setSelectedEvent(null);
                    form.resetFields();
                  }}
                >
                  Zrušit
                </Button>
              </Space>
              {isEditMode && (
                <Button
                  danger
                  size="large"
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                  loading={deleteMutation.isPending}
                >
                  Smazat
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
