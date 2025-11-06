'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout } from 'antd';
import AppSidebar from '@/components/common/AppSidebar';
import AppHeader from '@/components/common/AppHeader';

const { Content } = Layout;

// Page titles mapping
const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/calendar': 'Kalendář',
  '/doctors': 'Lékaři',
  '/patients': 'Pacientky',
  '/questionnaires': 'Dotazníky',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true); // Start collapsed on mobile

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Check screen size on mount
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setCollapsed(false); // Desktop: show sidebar
      } else {
        setCollapsed(true); // Mobile: hide sidebar
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get page title based on current path
  const getPageTitle = () => {
    // Check exact match first
    if (pageTitles[pathname]) {
      return pageTitles[pathname];
    }

    // Check for dynamic routes
    if (pathname.includes('/dashboard/new-questionnaire-gynecology')) {
      return 'Gynekologický dotazník';
    }
    if (pathname.includes('/dashboard/new-questionnaire')) {
      return 'Dotazník pro těhotné';
    }
    if (pathname.startsWith('/patients/')) {
      return 'Detail pacientky';
    }
    if (pathname.startsWith('/questionnaires/')) {
      return 'Detail dotazníku';
    }

    return 'Profema';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppSidebar collapsed={collapsed} onCollapse={setCollapsed} />

      <Layout style={{ background: '#1a1a2e', marginLeft: collapsed ? 0 : 250, transition: 'margin-left 0.2s' }}>
        <AppHeader title={getPageTitle()} onMenuClick={() => setCollapsed(!collapsed)} />

        <Content style={{ padding: '16px' }} className="dashboard-content">
          {children}
        </Content>
      </Layout>

      <style jsx global>{`
        @media (max-width: 768px) {
          .dashboard-content {
            padding: 12px !important;
          }
        }

        @media (max-width: 576px) {
          .dashboard-content {
            padding: 8px !important;
          }
        }
      `}</style>
    </Layout>
  );
}
