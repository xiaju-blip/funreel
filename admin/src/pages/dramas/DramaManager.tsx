import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';

interface Drama {
  id: number;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  totalEpisodes: number;
  vipLevel: number;
  status: number;
  releaseDate: string;
}

const DramaManager = () => {
  const { t } = useTranslation();
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchDramas = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/dramas');
      setDramas(response.data);
    } catch (e) {
      message.error(t('common:fetchFailed') || 'Failed to fetch dramas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDramas();
  }, []);

  const handleCreate = () => {
    setModalVisible(true);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await api.post('/admin/dramas/create', values);
      message.success(t('common:created') || 'Drama created');
      setModalVisible(false);
      fetchDramas();
    } catch (e) {
      message.error(t('common:createFailed') || 'Failed to create drama');
    }
  };

  const columns: ColumnsType<Drama> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: t('dramas:titleZh') || 'Title (Chinese)',
      dataIndex: ['title', 'zh'],
      key: 'titleZh',
    },
    {
      title: t('dramas:titleEn') || 'Title (English)',
      dataIndex: ['title', 'en'],
      key: 'titleEn',
    },
    { title: t('dramas:episodes') || 'Episodes', dataIndex: 'totalEpisodes', key: 'totalEpisodes' },
    { title: t('dramas:vipLevel') || 'VIP Level', dataIndex: 'vipLevel', key: 'vipLevel' },
    {
      title: t('dramas:status') || 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (status === 1 ? 'Published' : 'Draft'),
    },
  ];

  return (
    <div className="drama-manager">
      <div className="page-header">
        <h1>{t('dramas:title') || 'Drama Management'}</h1>
        <Button type="primary" onClick={handleCreate}>
          {t('dramas:create') || 'Create Drama'}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={dramas}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />

      <Modal
        title={t('dramas:create') || 'Create Drama'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name={['title', 'zh']}
            label={t('dramas:titleZh') || 'Title (Chinese)'}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={['title', 'en']}
            label={t('dramas:titleEn') || 'Title (English)'}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={['description', 'zh']}
            label={t('dramas:descZh') || 'Description (Chinese)'}
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name={['description', 'en']}
            label={t('dramas:descEn') || 'Description (English)'}
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="totalEpisodes"
            label={t('dramas:totalEpisodes') || 'Total Episodes'}
            rules={[{ required: true }]}
            initialValue={1}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="vipLevel"
            label={t('dramas:vipLevel') || 'Required VIP Level'}
            initialValue={0}
          >
            <InputNumber min={0} max={3} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DramaManager;
