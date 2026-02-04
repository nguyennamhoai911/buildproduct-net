import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { inspirationAPI } from '../lib/api';

const { Option } = Select;

export default function InspirationsPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await inspirationAPI.getAll();
            setData(res);
        } catch (error: any) {
            console.error(error);
            message.error(error.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (values: any) => {
        try {
            await inspirationAPI.create(values);
            message.success('Created successfully');
            setIsModalOpen(false);
            form.resetFields();
            fetchData();
        } catch (error) {
            message.error('Failed to create');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (text: string) => <Tag color={text === 'Product' ? 'blue' : 'green'}>{text}</Tag>,
        },
        {
            title: 'Field',
            dataIndex: 'field',
            key: 'field',
        },
        {
            title: 'Country',
            dataIndex: 'country',
            key: 'country',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} />
                    <Button danger icon={<DeleteOutlined />} />
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <h2>Inspirations Management</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                    Add New
                </Button>
            </div>

            <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />

            <Modal
                title="Add New Inspiration"
                open={isModalOpen}
                onOk={() => form.submit()}
                onCancel={() => setIsModalOpen(false)}
            >
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="website" label="Website" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="category" label="Category" initialValue="Product">
                        <Select>
                            <Option value="Product">Product (Case Study)</Option>
                            <Option value="Source">Source (Resource)</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="field" label="Field">
                        <Input />
                    </Form.Item>
                    <Form.Item name="style" label="Style">
                        <Input />
                    </Form.Item>
                    <Form.Item name="rating" label="Rating">
                        <Select>
                            <Option value="1">1 Star</Option>
                            <Option value="2">2 Stars</Option>
                            <Option value="3">3 Stars</Option>
                            <Option value="4">4 Stars</Option>
                            <Option value="5">5 Stars</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="country" label="Country" initialValue="Việt Nam">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
