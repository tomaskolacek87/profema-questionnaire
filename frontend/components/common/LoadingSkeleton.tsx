'use client';

import { Card, Skeleton, Space } from 'antd';

export function DashboardSkeleton() {
  return (
    <div>
      <Skeleton.Button active style={{ width: 200, marginBottom: 24 }} />
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          ))}
        </div>
        <Card>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </Space>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <Card>
      <Skeleton.Input active style={{ width: '100%', marginBottom: 16 }} />
      <Skeleton active paragraph={{ rows: 10 }} />
    </Card>
  );
}

export function FormSkeleton() {
  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton.Input key={i} active style={{ width: '100%' }} />
        ))}
      </Space>
    </Card>
  );
}
