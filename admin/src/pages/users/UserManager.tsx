import { useState, useEffect } from 'react';
import { Table, Button, Input, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import './UserManager.css';

interface User {
  id: number;
  email: string;
  phone: string;
  nickname: string;
  kycLevel: number;
  vipLevel: number;
  inviteCode: string;
  inviterId: number;
  status: number;
  createdAt: string;
}

const UserManager = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (e) {
      message.error(t('common:fetchFailed') || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns: ColumnsType<User> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: t('users:email') || 'Email', dataIndex: 'email', key: 'email' },
    { title: t('users:nickname') || 'Nickname', dataIndex: 'nickname', key: 'nickname' },
    { title: t('users:kycLevel') || 'KYC Level', dataIndex: 'kycLevel', key: 'kycLevel' },
    { title: t('users:vipLevel') || 'VIP Level', dataIndex: 'vipLevel', key: 'vipLevel' },
    { title: t('users:status') || 'Status', dataIndex: 'status', key: 'status',
      render: (status) => status === 1 ? 'Active' : 'Disabled'
    },
    { title: t('users:createdAt') || 'Created At', dataIndex: 'createdAt', key: 'createdAt',
      render: (date) => new Date(date).toLocaleString()
    },
  ];

  return (
    <div className="user-manager">
      <div className="page-header">
        <h1>{t('users:title') || 'User Management'}</h1>
        <div>
          <Input.Search
            placeholder={t('users:searchPlaceholder') || 'Search email/nickname'}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            onSearch={() => { /* filter logic */ }}
            allowClear
          />
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
};

export default UserManager;
