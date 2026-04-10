import { useState, useEffect } from 'react';
import { Table, Button, Modal, message, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';

interface AmmSwap {
  id: number;
  poolId: number;
  userId: number;
  direction: number;
  amountIn: number;
  amountOut: number;
  price: number;
  fee: number;
  createdAt: string;
}

const TradeManager = () => {
  const { t } = useTranslation();
  const [swaps, setSwaps] = useState<AmmSwap[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSwaps = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/amm/swaps');
      setSwaps(response.data);
    } catch (e) {
      message.error(t('common:fetchFailed') || 'Failed to fetch swaps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps();
  }, []);

  const columns: ColumnsType<AmmSwap> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: t('trade:poolId') || 'Pool ID', dataIndex: 'poolId', key: 'poolId', width: 80 },
    { title: t('trade:userId') || 'User ID', dataIndex: 'userId', key: 'userId', width: 80 },
    { title: t('trade:direction') || 'Direction', dataIndex: 'direction', key: 'direction',
      render: (dir) => (
        <Tag color={dir === 1 ? 'green' : 'orange'}>
          {dir === 1 ? 'Buy IPT' : 'Sell IPT'}
        </Tag>
      )
    },
    { title: t('trade:amountIn') || 'Amount In', dataIndex: 'amountIn', key: 'amountIn' },
    { title: t('trade:amountOut') || 'Amount Out', dataIndex: 'amountOut', key: 'amountOut' },
    { title: t('trade:price') || 'Price', dataIndex: 'price', key: 'price',
      render: (val) => val.toFixed(6)
    },
    { title: t('trade:fee') || 'Fee', dataIndex: 'fee', key: 'fee' },
    { title: t('common:createdAt') || 'Created At', dataIndex: 'createdAt', key: 'createdAt',
      render: (date) => new Date(date).toLocaleString()
    },
  ];

  return (
    <div className="trade-manager">
      <div className="page-header">
        <h1>{t('trade:title') || 'Trade Management'}</h1>
        <Button onClick={fetchSwaps}>{t('common:refresh') || 'Refresh'}</Button>
      </div>

      <Table
        columns={columns}
        dataSource={swaps}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
};

export default TradeManager;
