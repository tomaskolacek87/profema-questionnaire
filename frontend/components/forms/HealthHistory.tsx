'use client';

import { Form, Input, Button, Space, Switch, Tag } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { healthHistorySchema, HealthHistory as HealthHistoryType } from '@/lib/validation';
import { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface Props {
  initialData?: Partial<HealthHistoryType>;
  onNext: (data: HealthHistoryType) => void;
  onBack: () => void;
}

export default function HealthHistory({ initialData, onNext, onBack }: Props) {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
  } = useForm<HealthHistoryType>({
    resolver: zodResolver(healthHistorySchema),
    defaultValues: initialData || {
      chronic_diseases: [],
      medications: [],
      allergies: [],
      surgeries: [],
      smoking: false,
      alcohol: false,
    },
  });

  const [inputValue, setInputValue] = useState('');
  const [currentField, setCurrentField] = useState<keyof HealthHistoryType | null>(null);

  const chronicDiseases = watch('chronic_diseases') || [];
  const medications = watch('medications') || [];
  const allergies = watch('allergies') || [];
  const surgeries = watch('surgeries') || [];

  const handleAddTag = (field: 'chronic_diseases' | 'medications' | 'allergies' | 'surgeries') => {
    if (inputValue && currentField === field) {
      const currentValues = watch(field) as string[];
      setValue(field, [...currentValues, inputValue]);
      setInputValue('');
      setCurrentField(null);
    }
  };

  const handleRemoveTag = (field: 'chronic_diseases' | 'medications' | 'allergies' | 'surgeries', index: number) => {
    const currentValues = watch(field) as string[];
    setValue(field, currentValues.filter((_, i) => i !== index));
  };

  const onSubmit = (data: HealthHistoryType) => {
    onNext(data);
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <h2>Zdravotní anamnéza</h2>

      <Form.Item label="Chronická onemocnění">
        <div style={{ marginBottom: 8 }}>
          {chronicDiseases.map((disease, index) => (
            <Tag
              key={index}
              closable
              onClose={() => handleRemoveTag('chronic_diseases', index)}
              style={{ marginBottom: 8 }}
            >
              {disease}
            </Tag>
          ))}
        </div>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="Přidat onemocnění"
            value={currentField === 'chronic_diseases' ? inputValue : ''}
            onChange={e => {
              setInputValue(e.target.value);
              setCurrentField('chronic_diseases');
            }}
            onPressEnter={() => handleAddTag('chronic_diseases')}
          />
          <Button icon={<PlusOutlined />} onClick={() => handleAddTag('chronic_diseases')}>
            Přidat
          </Button>
        </Space.Compact>
      </Form.Item>

      <Form.Item label="Pravidelně užívané léky">
        <div style={{ marginBottom: 8 }}>
          {medications.map((med, index) => (
            <Tag
              key={index}
              closable
              onClose={() => handleRemoveTag('medications', index)}
              style={{ marginBottom: 8 }}
            >
              {med}
            </Tag>
          ))}
        </div>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="Přidat lék"
            value={currentField === 'medications' ? inputValue : ''}
            onChange={e => {
              setInputValue(e.target.value);
              setCurrentField('medications');
            }}
            onPressEnter={() => handleAddTag('medications')}
          />
          <Button icon={<PlusOutlined />} onClick={() => handleAddTag('medications')}>
            Přidat
          </Button>
        </Space.Compact>
      </Form.Item>

      <Form.Item label="Alergie">
        <div style={{ marginBottom: 8 }}>
          {allergies.map((allergy, index) => (
            <Tag
              key={index}
              color="red"
              closable
              onClose={() => handleRemoveTag('allergies', index)}
              style={{ marginBottom: 8 }}
            >
              {allergy}
            </Tag>
          ))}
        </div>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="Přidat alergii"
            value={currentField === 'allergies' ? inputValue : ''}
            onChange={e => {
              setInputValue(e.target.value);
              setCurrentField('allergies');
            }}
            onPressEnter={() => handleAddTag('allergies')}
          />
          <Button icon={<PlusOutlined />} onClick={() => handleAddTag('allergies')}>
            Přidat
          </Button>
        </Space.Compact>
      </Form.Item>

      <Form.Item label="Operace v minulosti">
        <div style={{ marginBottom: 8 }}>
          {surgeries.map((surgery, index) => (
            <Tag
              key={index}
              closable
              onClose={() => handleRemoveTag('surgeries', index)}
              style={{ marginBottom: 8 }}
            >
              {surgery}
            </Tag>
          ))}
        </div>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="Přidat operaci"
            value={currentField === 'surgeries' ? inputValue : ''}
            onChange={e => {
              setInputValue(e.target.value);
              setCurrentField('surgeries');
            }}
            onPressEnter={() => handleAddTag('surgeries')}
          />
          <Button icon={<PlusOutlined />} onClick={() => handleAddTag('surgeries')}>
            Přidat
          </Button>
        </Space.Compact>
      </Form.Item>

      <Form.Item label="Rodinná anamnéza">
        <Controller
          name="family_history"
          control={control}
          render={({ field }) => (
            <TextArea {...field} rows={4} placeholder="Popis rodinné anamnézy..." />
          )}
        />
      </Form.Item>

      <Form.Item label="Kouření">
        <Controller
          name="smoking"
          control={control}
          render={({ field }) => (
            <Switch checked={field.value} onChange={field.onChange} checkedChildren="Ano" unCheckedChildren="Ne" />
          )}
        />
      </Form.Item>

      <Form.Item label="Alkohol">
        <Controller
          name="alcohol"
          control={control}
          render={({ field }) => (
            <Switch checked={field.value} onChange={field.onChange} checkedChildren="Ano" unCheckedChildren="Ne" />
          )}
        />
      </Form.Item>

      <Form.Item label="Další poznámky">
        <Controller
          name="other_notes"
          control={control}
          render={({ field }) => (
            <TextArea {...field} rows={3} placeholder="Další poznámky..." />
          )}
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button onClick={onBack}>Zpět</Button>
          <Button type="primary" htmlType="submit" size="large">
            Další krok
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
