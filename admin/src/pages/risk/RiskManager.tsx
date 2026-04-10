import { useState, useEffect } from 'react';
import { Table, Button, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';

interface RiskEvent {
  id: number;
  userId: number;
  reason: string;
  fingerprint: string;
  score: number;
  createdAt: string;
}

const RiskManager = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/risk/events');
      setEvents(response.data);
    } catch (e) {
      message.error(t('common:fetchFailed') || 'Failed to fetch risk events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getRiskLevel = (score: number) => {
    if (score < 30) return { text: 'Low', color: 'green' };
    if (score < 70) return { text: 'Medium', color: 'orange' };
    return { text: 'High', color: 'red' };
  };

  const columns: Columns<RiskEvent> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: t('risk:userId') || 'User ID', dataIndex: 'userId', key: 'userId', width: 80 },
    { title: t('risk:reason') || 'Reason', dataIndex: 'reason', key: 'reason' },
    { title: t('risk:score') || 'Risk Score', dataIndex: 'score', key: 'score',
      render: (score) => {
        const level = getRiskLevel(score);
        return <Tag color={level.color}>{level.text} ({score})</Tag>;
      }
    },
    { title: t('common:createdAt') || 'Created At', dataIndex: 'createdAt', key: 'createdAt',
      render: (date) => new Date(date).toLocaleString()
    },
  ];

  return (
    <div className="risk-manager">
      <div className="page-header">
        <h1>{t('risk:title') || 'Risk & Security Management'}</h1>
        <Button onClick={fetchEvents}>{t('common:refresh') || 'Refresh'}</Button>
      </div>

      <Table
        columns={columns}
        dataSource={events}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
};

export default RiskManager;
