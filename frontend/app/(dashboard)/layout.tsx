'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Layout, Menu, Button, Typography, Avatar } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  LogoutOutlined,
  HomeOutlined,
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
    } else if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} theme="light">
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            Profema
          </Title>
        </div>

        <Menu
          mode="inline"
          defaultSelectedKeys={['patients']}
          items={[
            {
              key: 'patients',
              icon: <UserOutlined />,
              label: 'Pacientky',
              onClick: () => router.push('/dashboard'),
            },
            {
              key: 'questionnaires',
              icon: <FileTextOutlined />,
              label: 'Dotazníky',
              onClick: () => router.push('/dashboard/questionnaires'),
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            <HomeOutlined /> Dashboard
          </Title>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar icon={<UserOutlined />} />
            <span>
              {user.first_name} {user.last_name}
            </span>
            <Button icon={<LogoutOutlined />} onClick={handleLogout}>
              Odhlásit
            </Button>
          </div>
        </Header>

        <Content style={{ margin: '24px', padding: 24, background: '#fff', borderRadius: 8 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
