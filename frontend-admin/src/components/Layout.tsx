import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { DesktopOutlined, UserOutlined } from '@ant-design/icons';
import { Link, Outlet, useLocation } from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;

function getItem(label: React.ReactNode, key: React.Key, icon?: React.ReactNode, children?: any[]) {
    return {
        key,
        icon,
        children,
        label,
    };
}

const items = [
    getItem(<Link to="/">Inspirations</Link>, '/', <DesktopOutlined />),
    getItem(<Link to="/users">Users</Link>, '/users', <UserOutlined />),
];

const AppLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
                <Menu theme="dark" defaultSelectedKeys={[location.pathname]} mode="inline" items={items} />
            </Sider>
            <Layout className="site-layout">
                <Header style={{ padding: 0, background: '#fff' }} />
                <Content style={{ margin: '16px' }}>
                    <div style={{ padding: 24, minHeight: 360, background: '#fff' }}>
                        <Outlet />
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>Admin Panel ©2023 Created by BuildProduct</Footer>
            </Layout>
        </Layout>
    );
};

export default AppLayout;
