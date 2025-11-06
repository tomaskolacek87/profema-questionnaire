'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Layout } from 'antd';
import { DashboardOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';

const { Sider } = Layout;

interface AppSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export default function AppSidebar({ collapsed, onCollapse }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined style={{ fontSize: 18 }} />,
      label: 'Dashboard',
    },
    {
      key: '/patients',
      icon: <UserOutlined style={{ fontSize: 18 }} />,
      label: 'Pacientky',
    },
    {
      key: '/questionnaires',
      icon: <FileTextOutlined style={{ fontSize: 18 }} />,
      label: 'Dotazníky',
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          onClick={() => onCollapse(true)}
          className="mobile-overlay"
        />
      )}

      <Sider
        width={250}
        collapsedWidth={0}
        collapsed={collapsed}
        onCollapse={onCollapse}
        breakpoint="lg"
        className="app-sidebar"
        style={{
          background: 'linear-gradient(180deg, #2d1b4e 0%, #1a1a2e 100%)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.3)',
          overflow: 'auto',
          height: '100vh',
        }}
      >
        {/* Logo */}
        <div style={{
          padding: '24px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <img
            src="https://www.profema.cz/wp-content/uploads/2019/12/logo_profema_white_big.png"
            alt="Profema"
            style={{
              width: '100%',
              maxWidth: '180px',
              height: 'auto'
            }}
          />
        </div>

        {/* Menu Items */}
        <div style={{ marginTop: 16 }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.key;

            return (
              <div
                key={item.key}
                onClick={() => {
                  router.push(item.key);
                  // Auto-close on mobile after navigation
                  if (window.innerWidth < 992) {
                    onCollapse(true);
                  }
                }}
                style={{
                  padding: '16px 24px',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                  borderLeft: isActive ? '4px solid #a855f7' : '4px solid transparent',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                  }
                }}
              >
                {item.icon}
                <span style={{ fontWeight: 500 }}>{item.label}</span>
              </div>
            );
          })}
        </div>
      </Sider>

      <style jsx global>{`
        /* Desktop: static sidebar */
        @media (min-width: 992px) {
          .app-sidebar {
            position: static !important;
          }

          .mobile-overlay {
            display: none !important;
          }
        }

        /* Mobile/Tablet: fixed sidebar */
        @media (max-width: 991px) {
          .app-sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 100;
          }

          .mobile-overlay {
            display: block !important;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 99;
          }
        }
      `}</style>
    </>
  );
}
