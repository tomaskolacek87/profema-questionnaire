'use client';

import { Form, InputNumber, Button, Space, Card, Select, Input } from 'antd';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { previousPregnanciesSchema, PreviousPregnancies as PreviousPregnanciesType } from '@/lib/validation';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface Props {
  initialData?: Partial<PreviousPregnanciesType>;
  onNext: (data: PreviousPregnanciesType) => void;
  onBack: () => void;
}

export default function PreviousPregnancies({ initialData, onNext, onBack }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PreviousPregnanciesType>({
    resolver: zodResolver(previousPregnanciesSchema),
    defaultValues: initialData || {
      number_of_pregnancies: 0,
      number_of_births: 0,
      number_of_miscarriages: 0,
      pregnancies: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'pregnancies',
  });

  const onSubmit = (data: PreviousPregnanciesType) => {
    onNext(data);
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <h2>Předchozí těhotenství</h2>

      <Space direction="horizontal" size="large" style={{ width: '100%', marginBottom: 24 }}>
        <Form.Item
          label="Počet těhotenství"
          validateStatus={errors.number_of_pregnancies ? 'error' : ''}
          help={errors.number_of_pregnancies?.message}
        >
          <Controller
            name="number_of_pregnancies"
            control={control}
            render={({ field }) => (
              <InputNumber {...field} min={0} max={20} style={{ width: 120 }} />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Počet porodů"
          validateStatus={errors.number_of_births ? 'error' : ''}
          help={errors.number_of_births?.message}
        >
          <Controller
            name="number_of_births"
            control={control}
            render={({ field }) => (
              <InputNumber {...field} min={0} max={20} style={{ width: 120 }} />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Počet potratů"
          validateStatus={errors.number_of_miscarriages ? 'error' : ''}
          help={errors.number_of_miscarriages?.message}
        >
          <Controller
            name="number_of_miscarriages"
            control={control}
            render={({ field }) => (
              <InputNumber {...field} min={0} max={20} style={{ width: 120 }} />
            )}
          />
        </Form.Item>
      </Space>

      <Form.Item label="Komplikace při předchozích těhotenstvích">
        <Controller
          name="previous_complications"
          control={control}
          render={({ field }) => (
            <TextArea {...field} rows={3} placeholder="Popis komplikací..." />
          )}
        />
      </Form.Item>

      <h3 style={{ marginTop: 24, marginBottom: 16 }}>Detail předchozích těhotenství</h3>

      {fields.map((field, index) => (
        <Card
          key={field.id}
          size="small"
          style={{ marginBottom: 16 }}
          extra={
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => remove(index)}
            >
              Odstranit
            </Button>
          }
          title={`Těhotenství ${index + 1}`}
        >
          <Space direction="horizontal" size="large" style={{ width: '100%' }}>
            <Form.Item label="Rok">
              <Controller
                name={`pregnancies.${index}.year`}
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={1900}
                    max={new Date().getFullYear()}
                    style={{ width: 100 }}
                  />
                )}
              />
            </Form.Item>

            <Form.Item label="Výsledek">
              <Controller
                name={`pregnancies.${index}.outcome`}
                control={control}
                render={({ field }) => (
                  <Select {...field} style={{ width: 150 }}>
                    <Select.Option value="birth">Porod</Select.Option>
                    <Select.Option value="miscarriage">Potrat</Select.Option>
                    <Select.Option value="abortion">Interrupce</Select.Option>
                    <Select.Option value="stillbirth">Mrtvý plod</Select.Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Space>

          <Form.Item label="Komplikace">
            <Controller
              name={`pregnancies.${index}.complications`}
              control={control}
              render={({ field }) => (
                <TextArea {...field} rows={2} placeholder="Komplikace..." />
              )}
            />
          </Form.Item>
        </Card>
      ))}

      <Button
        type="dashed"
        onClick={() =>
          append({
            year: new Date().getFullYear(),
            outcome: 'birth',
            complications: '',
          })
        }
        icon={<PlusOutlined />}
        style={{ width: '100%', marginBottom: 24 }}
      >
        Přidat těhotenství
      </Button>

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
