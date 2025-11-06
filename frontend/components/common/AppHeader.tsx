'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Space, Avatar, Badge, Tooltip, Typography, Dropdown, Button } from 'antd';
import { BellOutlined, LogoutOutlined, UserOutlined, MenuOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

interface AppHeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function AppHeader({ title, onMenuClick }: AppHeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const userMenuItems = [
    {
      key: 'logout',
      label: 'Odhlásit se',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        background: 'linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 100%)',
        padding: '0 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}
    >
      <Space size="middle">
        {/* Hamburger menu pro mobily */}
        <Button
          type="text"
          icon={<MenuOutlined style={{ fontSize: 20, color: 'white' }} />}
          onClick={onMenuClick}
          className="mobile-menu-button"
          style={{
            display: 'none',
            padding: '4px 8px',
            height: 'auto'
          }}
        />

        <Title level={4} style={{ margin: 0, color: 'white' }} className="header-title">
          {title}
        </Title>
      </Space>

      <Space size="large" className="header-actions">
        <Tooltip title="Notifikace">
          <Badge count={0} showZero={false}>
            <BellOutlined style={{ fontSize: 20, color: 'white', cursor: 'pointer' }} />
          </Badge>
        </Tooltip>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space size={12} style={{ cursor: 'pointer' }} className="user-dropdown">
            <Avatar style={{ backgroundColor: '#a855f7' }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </Avatar>
            <div className="user-info">
              <div style={{ color: 'white', fontWeight: 500, fontSize: 14, lineHeight: '20px' }}>
                {user?.first_name} {user?.last_name}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: '16px' }}>
                {user?.role === 'admin' ? 'Administrátor' : 'Lékař'}
              </div>
            </div>
          </Space>
        </Dropdown>
      </Space>

      <style jsx global>{`
        @media (max-width: 992px) {
          .mobile-menu-button {
            display: inline-flex !important;
          }

          .header-title {
            font-size: 18px !important;
          }
        }

        @media (max-width: 576px) {
          .header-title {
            font-size: 16px !important;
          }

          .user-info {
            display: none;
          }

          .header-actions {
            gap: 12px !important;
          }
        }
      `}</style>
    </Header>
  );
}
