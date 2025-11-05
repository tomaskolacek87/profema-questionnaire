'use client';

import { Form, Input, DatePicker, Button, Row, Col } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientBasicInfoSchema, PatientBasicInfo as PatientBasicInfoType } from '@/lib/validation';
import dayjs from 'dayjs';

interface Props {
  initialData?: Partial<PatientBasicInfoType>;
  onNext: (data: PatientBasicInfoType) => void;
}

export default function PatientBasicInfo({ initialData, onNext }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientBasicInfoType>({
    resolver: zodResolver(patientBasicInfoSchema),
    defaultValues: initialData || {},
  });

  const onSubmit = (data: PatientBasicInfoType) => {
    onNext(data);
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <h2>Základní údaje pacientky</h2>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Jméno"
            validateStatus={errors.first_name ? 'error' : ''}
            help={errors.first_name?.message}
            required
          >
            <Controller
              name="first_name"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Jana" />}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Příjmení"
            validateStatus={errors.last_name ? 'error' : ''}
            help={errors.last_name?.message}
            required
          >
            <Controller
              name="last_name"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Nová" />}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Datum narození"
            validateStatus={errors.birth_date ? 'error' : ''}
            help={errors.birth_date?.message}
            required
          >
            <Controller
              name="birth_date"
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
          <Form.Item
            label="Rodné číslo"
            validateStatus={errors.birth_number ? 'error' : ''}
            help={errors.birth_number?.message}
            required
          >
            <Controller
              name="birth_number"
              control={control}
              render={({ field }) => <Input {...field} placeholder="9501011234" maxLength={10} />}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Číslo pojištěnce">
            <Controller
              name="insurance_number"
              control={control}
              render={({ field }) => <Input {...field} placeholder="123456789" />}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Pojišťovna">
            <Controller
              name="insurance_company"
              control={control}
              render={({ field }) => <Input {...field} placeholder="VZP, ČPZP, ..." />}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Telefon"
            validateStatus={errors.phone ? 'error' : ''}
            help={errors.phone?.message}
          >
            <Controller
              name="phone"
              control={control}
              render={({ field }) => <Input {...field} placeholder="+420 123 456 789" />}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Email"
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => <Input {...field} type="email" placeholder="jana@email.cz" />}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Adresa">
        <Controller
          name="address"
          control={control}
          render={({ field }) => <Input {...field} placeholder="Ulice a číslo popisné" />}
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Město">
            <Controller
              name="city"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Praha" />}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="PSČ">
            <Controller
              name="postal_code"
              control={control}
              render={({ field }) => <Input {...field} placeholder="110 00" />}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Button type="primary" htmlType="submit" size="large">
          Další krok
        </Button>
      </Form.Item>
    </Form>
  );
}
