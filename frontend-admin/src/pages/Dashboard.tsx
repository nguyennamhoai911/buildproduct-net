import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    LinearProgress,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import {
    Memory as MemoryIcon,
    Storage as StorageIcon,
    Speed as SpeedIcon,
    CloudQueue as CloudIcon,
} from '@mui/icons-material';

interface SystemMetric {
    name: string;
    value: number;
    max: number;
    unit: string;
    status: 'normal' | 'warning' | 'critical';
    icon: React.ReactNode;
}

const Dashboard: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [metrics] = useState<SystemMetric[]>([
        {
            name: 'CPU Usage',
            value: 45,
            max: 100,
            unit: '%',
            status: 'normal',
            icon: <SpeedIcon />,
        },
        {
            name: 'Memory',
            value: 6.2,
            max: 16,
            unit: 'GB',
            status: 'normal',
            icon: <MemoryIcon />,
        },
        {
            name: 'Database',
            value: 234,
            max: 1000,
            unit: 'MB',
            status: 'normal',
            icon: <StorageIcon />,
        },
        {
            name: 'Network',
            value: 125,
            max: 1000,
            unit: 'Mbps',
            status: 'normal',
            icon: <CloudIcon />,
        },
    ]);

    const services = [
        { name: 'API Server', status: 'Online', uptime: '99.98%', responseTime: '45ms' },
        { name: 'Database', status: 'Online', uptime: '99.99%', responseTime: '12ms' },
        { name: 'Cache Server', status: 'Online', uptime: '99.95%', responseTime: '8ms' },
        { name: 'File Storage', status: 'Online', uptime: '99.97%', responseTime: '23ms' },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const getStatusColor = (status: string) => {
        return status === 'Online' ? 'success' : 'error';
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
                    System Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {currentTime.toLocaleString('vi-VN')}
                </Typography>
            </Box>

            {/* System Metrics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {metrics.map((metric, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Paper sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ 
                                    mr: 2, 
                                    color: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    {metric.icon}
                                </Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    {metric.name}
                                </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                                {metric.value.toFixed(1)}
                                <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                                    {metric.unit}
                                </Typography>
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={(metric.value / metric.max) * 100}
                                sx={{ mb: 1, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                                Max: {metric.max} {metric.unit}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Services Status */}
            <Paper sx={{ mb: 4 }}>
                <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Services Status
                    </Typography>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Service Name</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Uptime</TableCell>
                                <TableCell>Response Time</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {services.map((service, index) => (
                                <TableRow key={index} hover>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {service.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={service.status}
                                            color={getStatusColor(service.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{service.uptime}</TableCell>
                                    <TableCell>{service.responseTime}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* System Info */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            System Information
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">OS:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>Windows Server 2022</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Node Version:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>v20.11.0</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Database:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>PostgreSQL 15.3</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Uptime:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>15 days 7 hours</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Quick Stats
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Total Users:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>1,234</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Active Sessions:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>89</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">API Requests (24h):</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>45,678</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Storage Used:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>234 MB / 10 GB</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
