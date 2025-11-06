'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout } from 'antd';
import AppSidebar from '@/components/common/AppSidebar';
import AppHeader from '@/components/common/AppHeader';

const { Content } = Layout;

// Page titles mapping
const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
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

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

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
      <AppSidebar />

      <Layout style={{ background: '#1a1a2e' }}>
        <AppHeader title={getPageTitle()} />

        <Content style={{ padding: '24px' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
