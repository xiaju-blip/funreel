import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import './AssetManager.css';

interface Asset {
  id: number;
  name: string;
  description: string;
  target_amount: number;
  raised_amount: number;
  apy: number;
  duration_days: number;
  status: number;
  start_time: string;
  end_time: string;
}

const AssetManager = () => {
  const { t } = useTranslation();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/assets');
      setAssets(response.data);
    } catch (e) {
      message.error(t('common:fetchFailed') || 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const columns: ColumnsType<Asset> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: t('assets:name') || 'Name', dataIndex: 'name', key: 'name' },
    { title: t('assets:targetAmount') || 'Target Amount', dataIndex: 'target_amount', key: 'target_amount' },
    { title: t('assets:raisedAmount') || 'Raised', dataIndex: 'raised_amount', key: 'raised_amount' },
    { title: t('assets:apy') || 'APY', dataIndex: 'apy', key: 'apy', render: (val) => `${val}%` },
    { title: t('assets:duration') || 'Duration', dataIndex: 'duration_days', key: 'duration_days', render: (val) => `${val} days` },
    { title: t('assets:status') || 'Status', dataIndex: 'status', key: 'status',
      render: (status) => {
        const statusText = ['Draft', 'Open', 'Closed', 'Settled'];
        return statusText[status] || 'Unknown';
      }
    },
  ];

  const handleCreate = () => {
    setModalVisible(true);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await api.post('/admin/assets/create', values);
      message.success(t('common:created') || 'Asset created');
      setModalVisible(false);
      fetchAssets();
    } catch (e) {
      message.error(t('common:createFailed') || 'Failed to create asset');
    }
  };

  return (
    <div className="asset-manager">
      <div className="page-header">
        <h1>{t('assets:title') || 'Asset Management'}</h1>
        <Button type="primary" onClick={handleCreate}>
          {t('assets:create') || 'Create Asset'}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={assets}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={t('assets:create') || 'Create Asset'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={t('assets:name') || 'Asset Name'}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label={t('assets:description') || 'Description'}
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="target_amount"
            label={t('assets:targetAmount') || 'Target Amount (USDT)'}
            rules={[{ required: true }]}
          >
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="apy"
            label={t('assets:apy') || 'APY (%)'}
            rules={[{ required: true }]}
          >
            <InputNumber min={0} max={100} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="duration_days"
            label={t('assets:durationDays') || 'Duration (Days)'}
            rules={[{ required: true }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="start_time"
            label={t('assets:startTime') || 'Start Time'}
            rules={[{ required: true }]}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="end_time"
            label={t('assets:endTime') || 'End Time'}
            rules={[{ required: true }]}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AssetManager;
