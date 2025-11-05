'use client';

import { Form, DatePicker, InputNumber, Button, Row, Col, Switch, Space } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pregnancyInfoSchema, PregnancyInfo as PregnancyInfoType } from '@/lib/validation';
import dayjs from 'dayjs';

interface Props {
  initialData?: Partial<PregnancyInfoType>;
  onNext: (data: PregnancyInfoType) => void;
  onBack: () => void;
}

export default function PregnancyInfo({ initialData, onNext, onBack }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PregnancyInfoType>({
    resolver: zodResolver(pregnancyInfoSchema),
    defaultValues: initialData || { is_high_risk: false },
  });

  const onSubmit = (data: PregnancyInfoType) => {
    onNext(data);
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <h2>Informace o těhotenství</h2>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Datum poslední menstruace (LMP)"
            validateStatus={errors.lmp_date ? 'error' : ''}
            help={errors.lmp_date?.message}
            required
          >
            <Controller
              name="lmp_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={date => field.onChange(date?.toDate())}
                  format="DD.MM.YYYY"
                  placeholder="Vyberte datum"
                  style={{ width: '100%' }}
                />
              )}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Předpokládaný termín porodu (EDD)">
            <Controller
              name="edd_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={date => field.onChange(date?.toDate())}
                  format="DD.MM.YYYY"
                  placeholder="Vyberte datum"
                  style={{ width: '100%' }}
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Gestační týden"
            validateStatus={errors.gestational_weeks ? 'error' : ''}
            help={errors.gestational_weeks?.message}
          >
            <Controller
              name="gestational_weeks"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={0}
                  max={42}
                  placeholder="Např. 12"
                  style={{ width: '100%' }}
                />
              )}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Gestační den"
            validateStatus={errors.gestational_days ? 'error' : ''}
            help={errors.gestational_days?.message}
          >
            <Controller
              name="gestational_days"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={0}
                  max={6}
                  placeholder="Např. 3"
                  style={{ width: '100%' }}
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Vysokorizikové těhotenství">
        <Controller
          name="is_high_risk"
          control={control}
          render={({ field }) => (
            <Switch checked={field.value} onChange={field.onChange} checkedChildren="Ano" unCheckedChildren="Ne" />
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
