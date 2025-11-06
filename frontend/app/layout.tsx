import { ReactNode } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import csCZ from 'antd/locale/cs_CZ';
import { Providers } from './providers';
import './globals.css';

export const metadata = {
  title: 'Profema - Gynekologický dotazník',
  description: 'Anamnestický dotazník pro těhotné pacientky',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="cs">
      <body>
        <Providers>
          <AntdRegistry>
            <ConfigProvider
              locale={csCZ}
              theme={{
                token: {
                  colorPrimary: '#1890ff',
                  borderRadius: 6,
                },
              }}
            >
              {children}
            </ConfigProvider>
          </AntdRegistry>
        </Providers>
      </body>
    </html>
  );
}
