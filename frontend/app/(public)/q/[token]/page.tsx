'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Spin, Result, Card } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import PublicGynecologyForm from '@/components/forms/PublicGynecologyForm';
import PublicPregnancyForm from '@/components/forms/PublicPregnancyForm';

export default function PublicQuestionnairePage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (token) {
      loadQuestionnaire();
    }
  }, [token]);

  const loadQuestionnaire = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/questionnaires/public/${token}`
      );
      setQuestionnaire(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading questionnaire:', err);
      setError(err.response?.data?.message || 'Dotazník se nepodařilo načíst. Možná platnost odkazu vypršela.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 48, color: '#a855f7' }} spin />} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        <Result
          icon={<CloseCircleOutlined style={{ color: '#ef4444' }} />}
          title={<span style={{ color: 'white' }}>Chyba při načítání dotazníku</span>}
          subTitle={<span style={{ color: 'rgba(255,255,255,0.7)' }}>{error}</span>}
        />
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        <Result
          icon={<CheckCircleOutlined style={{ color: '#22c55e' }} />}
          title={<span style={{ color: 'white' }}>Dotazník byl úspěšně odeslán!</span>}
          subTitle={
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>
              Děkujeme za vyplnění dotazníku. Váš lékař byl informován a seznámí se s ním před Vaší návštěvou.
            </span>
          }
        />
      </div>
    );
  }

  // Display questionnaire form based on type
  if (questionnaire) {
    const questionnaireTitle = questionnaire.type === 'pregnant'
      ? 'Dotazník pro těhotné'
      : questionnaire.type === 'gynecology'
      ? 'Gynekologický dotazník'
      : 'Ultrazvukové vyšetření';

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 100%)',
        padding: '40px 20px'
      }}>
        {/* Header with Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <img
            src="https://www.profema.cz/wp-content/uploads/2019/12/logo_profema_white_big.png"
            alt="Profema"
            style={{
              width: '100%',
              maxWidth: '200px',
              height: 'auto',
              marginBottom: '24px'
            }}
          />
          <h1 style={{
            color: 'white',
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '12px'
          }}>
            {questionnaireTitle}
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '16px',
            marginBottom: '8px'
          }}>
            {questionnaire.patient?.first_name} {questionnaire.patient?.last_name}
          </p>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '14px',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Vítejte! Věnujte prosím pár minut vyplnění tohoto dotazníku. Informace nám pomůžou
            lépe připravit Vaši návštěvu a poskytnout Vám tu nejlepší péči. Děkujeme!
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <Card style={{
            background: 'rgba(255,255,255,0.98)',
            borderRadius: '16px',
            boxShadow: '0 12px 48px rgba(0,0,0,0.4)'
          }}>
            <div style={{ padding: '32px' }}>
              {questionnaire.type === 'pregnant' ? (
                <PublicPregnancyForm
                  token={token}
                  initialData={questionnaire}
                  onSuccess={() => setSubmitted(true)}
                />
              ) : (
                <PublicGynecologyForm
                  token={token}
                  initialData={questionnaire}
                  onSuccess={() => setSubmitted(true)}
                />
              )}
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '48px',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '14px'
        }}>
          <p style={{ margin: '4px 0' }}>© 2025 Profema - Gynekologie a porodnictví</p>
          <p style={{ margin: '4px 0', fontSize: '12px' }}>
            Vaše údaje jsou chráněny v souladu s GDPR
          </p>
        </div>
      </div>
    );
  }

  return null;
}
