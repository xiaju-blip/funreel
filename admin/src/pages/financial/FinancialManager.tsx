import { useState, useEffect } from 'react';
import { Table, DatePicker, Button, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';

interface Transaction {
  id: number;
  userId: number;
  type: number;
  amount: number;
  status: number;
  txHash: string;
  createdAt: string;
}

const FinancialManager = () => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/financial/transactions');
      setTransactions(response.data);
    } catch (e) {
      message.error(t('common:fetchFailed') || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getTypeText = (type: number): string => {
    const types = [
      'Points Exchange',
      'VIP Purchase',
      'Staking Reward',
      'Withdraw',
      'Airdrop',
    ];
    return types[type - 1] || 'Unknown';
  };

  const columns: ColumnsType<Transaction> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: t('financial:userId') || 'User ID', dataIndex: 'userId', key: 'userId', width: 80 },
    { title: t('financial:type') || 'Type', dataIndex: 'type', key: 'type',
      render: (type) => getTypeText(type)
    },
    { title: t('financial:amount') || 'Amount', dataIndex: 'amount', key: 'amount',
      render: (amount) => amount.toFixed(4)
    },
    { title: t('financial:txHash') || 'Tx Hash', dataIndex: 'txHash', key: 'txHash',
      render: (hash) => hash ? hash.substring(0, 10) + '...' : '-'
    },
    { title: t('common:createdAt') || 'Created At', dataIndex: 'createdAt', key: 'createdAt',
      render: (date) => new Date(date).toLocaleString()
    },
  ];

  return (
    <div className="financial-manager">
      <div className="page-header">
        <h1>{t('financial:title') || 'Financial Management'}</h1>
        <div>
          <DatePicker.RangePicker />
          <Button onClick={fetchTransactions} style={{ marginLeft: 8 }}>
            {t('common:query') || 'Query'}
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={transactions}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
};

export default FinancialManager;
