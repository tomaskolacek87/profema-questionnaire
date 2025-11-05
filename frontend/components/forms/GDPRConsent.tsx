'use client';

import { Form, Button, Space, Checkbox, Input, Alert } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { gdprConsentSchema, GdprConsent as GdprConsentType } from '@/lib/validation';

const { TextArea } = Input;

interface Props {
  initialData?: Partial<GdprConsentType>;
  onSubmit: (data: GdprConsentType) => void;
  onBack: () => void;
  loading: boolean;
}

export default function GDPRConsent({ initialData, onSubmit, onBack, loading }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GdprConsentType>({
    resolver: zodResolver(gdprConsentSchema),
    defaultValues: initialData || { gdpr_consent: false },
  });

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <h2>Souhlas se zpracováním osobních údajů (GDPR)</h2>

      <Alert
        message="Důležité informace o ochraně osobních údajů"
        description={
          <div style={{ lineHeight: 1.8 }}>
            <p>
              <strong>Správce osobních údajů:</strong> Gynekologická ordinace Profema
            </p>
            <p>
              Vaše osobní údaje budou zpracovány za účelem poskytnutí zdravotní péče a vedení
              zdravotnické dokumentace v souladu se zákonem č. 372/2011 Sb., o zdravotních službách.
            </p>
            <p>
              Vaše údaje budou uloženy v systému Profema (nová databáze) a zároveň synchronizovány
              do systému Astraia (legacy systém) pro zajištění kontinuity péče.
            </p>
            <p>
              <strong>Vaše práva:</strong> Máte právo na přístup k údajům, jejich opravu, výmaz,
              omezení zpracování, přenositelnost údajů a právo podat stížnost u Úřadu pro ochranu
              osobních údajů.
            </p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form.Item
        validateStatus={errors.gdpr_consent ? 'error' : ''}
        help={errors.gdpr_consent?.message}
      >
        <Controller
          name="gdpr_consent"
          control={control}
          render={({ field }) => (
            <Checkbox checked={field.value} onChange={e => field.onChange(e.target.checked)}>
              <strong>
                Souhlasím se zpracováním mých osobních údajů za účelem poskytnutí zdravotní péče
                a vedení zdravotnické dokumentace. Beru na vědomí, že moje údaje budou uloženy v
                systémech Profema a Astraia.
              </strong>
            </Checkbox>
          )}
        />
      </Form.Item>

      <Form.Item label="Dodatečné poznámky">
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              rows={4}
              placeholder="Další poznámky k dotazníku nebo speciální požadavky..."
            />
          )}
        />
      </Form.Item>

      <Alert
        message="Dokončení dotazníku"
        description="Po odeslání formuláře bude vytvořena nová pacientka v obou databázích (Profema + Astraia) pomocí transakčního dual-write mechanismu. Dotazník bude uložen a dostupný pro další zpracování."
        type="success"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form.Item>
        <Space>
          <Button onClick={onBack} disabled={loading}>
            Zpět
          </Button>
          <Button type="primary" htmlType="submit" size="large" loading={loading}>
            Odeslat dotazník
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
