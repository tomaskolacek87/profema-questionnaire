'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authApi } from '@/lib/api';

const { Title } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  console.log('🏗️ LoginPage component rendered');
  console.log('📍 API URL:', process.env.NEXT_PUBLIC_API_URL);

  const onFinish = async (values: { email: string; password: string }) => {
    console.log('🎯 onFinish called with:', values);
    setLoading(true);
    try {
      console.log('🔐 Logging in with:', values.email);
      console.log('🌐 Making request to:', `${process.env.NEXT_PUBLIC_API_URL}/auth/login`);
      const response = await authApi.login(values.email, values.password);
      console.log('✅ Login response:', response.data);
      localStorage.setItem('auth_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      message.success('Přihlášení úspěšné!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('❌ Error details:', error.response?.data);
      message.error(error.response?.data?.message || 'Chyba přihlášení');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          Profema
        </Title>
        <Title level={4} style={{ textAlign: 'center', marginBottom: 32, fontWeight: 'normal' }}>
          Gynekologický dotazník
        </Title>

        <Form name="login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Zadejte email!' },
              { type: 'email', message: 'Neplatný email!' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Zadejte heslo!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Heslo" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Přihlásit se
            </Button>
          </Form.Item>

          <Button
            onClick={() => {
              console.log('🔴 TEST BUTTON CLICKED!');
              alert('Test button works!');
            }}
            block
            style={{ marginTop: 8 }}
          >
            Test kliknutí
          </Button>
        </Form>
      </Card>
    </div>
  );
}
