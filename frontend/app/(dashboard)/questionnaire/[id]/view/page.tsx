'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, Descriptions, Button, Space, Typography, Tag, Spin, message, Divider } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, EditOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { enhancedQuestionnairesApi } from '@/lib/api';
import { format } from 'date-fns';

const { Title, Text } = Typography;

export default function QuestionnaireViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: questionnaire, isLoading } = useQuery({
    queryKey: ['questionnaire', id],
    queryFn: async () => {
      const response = await enhancedQuestionnairesApi.getOne(id);
      return response.data;
    },
  });

  const handleDownloadPdf = async () => {
    try {
      const response = await enhancedQuestionnairesApi.downloadPdf(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `questionnaire_${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      message.success('PDF staženo');
    } catch (error) {
      message.error('Chyba při stahování PDF');
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!questionnaire) {
    return <div>Dotazník nenalezen</div>;
  }

  const basicInfo = questionnaire.basic_info || {};
  const pregnancyInfo = questionnaire.pregnancy_info || {};
  const healthHistory = questionnaire.health_history || {};
  const previousPregnancies = questionnaire.previous_pregnancies || [];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          style={{ marginBottom: 16 }}
        >
          Zpět
        </Button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Dotazník pacientky
            </Title>
            <Text type="secondary">
              {questionnaire.patient?.first_name} {questionnaire.patient?.last_name}
            </Text>
          </div>

          <Space>
            <Tag color={questionnaire.status === 'completed' ? 'green' : 'orange'}>
              {questionnaire.status === 'completed' ? 'Dokončeno' : 'Rozpracováno'}
            </Tag>
            <Button
              icon={<EditOutlined />}
              onClick={() => router.push(`/questionnaire?id=${id}`)}
            >
              Upravit
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownloadPdf}
            >
              Stáhnout PDF
            </Button>
          </Space>
        </div>
      </div>

      {/* Basic Info */}
      <Card title="Základní údaje" style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
          <Descriptions.Item label="Jméno">
            {questionnaire.patient?.first_name} {questionnaire.patient?.last_name}
          </Descriptions.Item>
          <Descriptions.Item label="Rodné číslo">
            {questionnaire.patient?.birth_number}
          </Descriptions.Item>
          <Descriptions.Item label="Datum narození">
            {questionnaire.patient?.date_of_birth
              ? format(new Date(questionnaire.patient.date_of_birth), 'dd.MM.yyyy')
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Telefon">{basicInfo.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="Email">{basicInfo.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="Adresa">
            {basicInfo.street}, {basicInfo.city}, {basicInfo.postal_code}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Pregnancy Info */}
      <Card title="Současné těhotenství" style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
          <Descriptions.Item label="Poslední menstruace">
            {pregnancyInfo.last_period
              ? format(new Date(pregnancyInfo.last_period), 'dd.MM.yyyy')
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Termín porodu">
            {pregnancyInfo.expected_due_date
              ? format(new Date(pregnancyInfo.expected_due_date), 'dd.MM.yyyy')
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Týden těhotenství">
            {pregnancyInfo.current_week || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Způsob početí">
            {pregnancyInfo.conception_method || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Počet plodů">
            {pregnancyInfo.number_of_fetuses || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Typ těhotenství">
            {pregnancyInfo.pregnancy_type || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Previous Pregnancies */}
      {previousPregnancies.length > 0 && (
        <Card title="Předchozí těhotenství" style={{ marginBottom: 16 }}>
          {previousPregnancies.map((preg: any, index: number) => (
            <Card key={index} type="inner" title={`Těhotenství ${index + 1}`} style={{ marginBottom: 16 }}>
              <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                <Descriptions.Item label="Rok">{preg.year || '-'}</Descriptions.Item>
                <Descriptions.Item label="Výsledek">{preg.outcome || '-'}</Descriptions.Item>
                <Descriptions.Item label="Týden">{preg.week || '-'}</Descriptions.Item>
                <Descriptions.Item label="Komplikace">{preg.complications || 'Žádné'}</Descriptions.Item>
              </Descriptions>
            </Card>
          ))}
        </Card>
      )}

      {/* Health History */}
      <Card title="Zdravotní anamnéza" style={{ marginBottom: 16 }}>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Chronická onemocnění">
            {healthHistory.chronic_diseases || 'Žádná'}
          </Descriptions.Item>
          <Descriptions.Item label="Pravidelně užívané léky">
            {healthHistory.medications || 'Žádné'}
          </Descriptions.Item>
          <Descriptions.Item label="Alergie">
            {healthHistory.allergies || 'Žádné'}
          </Descriptions.Item>
          <Descriptions.Item label="Předchozí operace">
            {healthHistory.surgeries || 'Žádné'}
          </Descriptions.Item>
          <Descriptions.Item label="Rodinná anamnéza">
            {healthHistory.family_history || 'Neuvedeno'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Additional Notes */}
      {questionnaire.additional_notes?.notes && (
        <Card title="Doplňující informace" style={{ marginBottom: 16 }}>
          <Text>{questionnaire.additional_notes.notes}</Text>
        </Card>
      )}

      {/* Metadata */}
      <Card title="Metadata" style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2 }} bordered>
          <Descriptions.Item label="Vytvořeno">
            {format(new Date(questionnaire.created_at), 'dd.MM.yyyy HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Vytvořil">
            {questionnaire.created_by?.first_name} {questionnaire.created_by?.last_name}
          </Descriptions.Item>
          {questionnaire.completed_at && (
            <Descriptions.Item label="Dokončeno">
              {format(new Date(questionnaire.completed_at), 'dd.MM.yyyy HH:mm')}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="ID">{questionnaire.id}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
