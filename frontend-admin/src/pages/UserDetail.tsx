import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Tab,
    Tabs,
    Chip,
    Button,
    Container
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { userAPI } from '../lib/api';

interface UserAnalytics {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        createdAt: string;
        provider: string;
    };
    overview: {
        totalSize: number;
        totalThumbnailSize: number;
        totalCount: number;
        totalStorage: number;
    };
    dailyStats: Array<{
        date: string;
        count: number;
        size: number;
        thumbnailSize: number;
    }>;
    activityLogs: Array<{
        id: number;
        action: string;
        ipAddress: string;
        country: string;
        device: string;
        createdAt: string;
    }>;
    assetHistory: Array<{
        id: number;
        action: string;
        assetName: string;
        assetId: number;
        createdAt: string;
    }>;
    assets: Array<{
        id: number;
        title: string;
        size: number;
        thumbnailSize: number;
        createdAt: string;
    }>;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [stats, setStats] = useState<UserAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        if (!id) return;
        const fetchStats = async () => {
            try {
                const data = await userAPI.getAnalytics(Number(id));
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch user analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [id]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    if (loading) return <Typography>Loading analytics...</Typography>;
    if (!stats) return <Typography>No data found (User not active).</Typography>;

    // Columns definitions
    const dailyColumns: GridColDef[] = [
        { field: 'date', headerName: 'Date', width: 150 },
        { field: 'count', headerName: 'Files Uploaded', width: 150 },
        {
            field: 'size',
            headerName: 'Total Size',
            width: 150,
            valueFormatter: (value) => formatBytes(Number(value))
        },
        {
            field: 'thumbnailSize',
            headerName: 'Thumbnail Size',
            width: 150,
            valueFormatter: (value) => formatBytes(Number(value))
        },
    ];

    const activityColumns: GridColDef[] = [
        { field: 'createdAt', headerName: 'Time', width: 200, valueFormatter: (value) => new Date(value).toLocaleString() },
        { field: 'action', headerName: 'Action', width: 150 },
        { field: 'country', headerName: 'Country', width: 150 },
        { field: 'ipAddress', headerName: 'IP Address', width: 150 },
        { field: 'device', headerName: 'Device', width: 250 },
    ];

    const assetColumns: GridColDef[] = [
        { field: 'createdAt', headerName: 'Time', width: 200, valueFormatter: (value) => new Date(value).toLocaleString() },
        {
            field: 'action',
            headerName: 'Action',
            width: 150,
            renderCell: (params) => (
                <Chip
                    label={params.value as string}
                    color={params.value === 'COPY' ? 'primary' : 'default'}
                    size="small"
                />
            )
        },
        { field: 'assetName', headerName: 'Asset Name', width: 300 },
    ];

    const inventoryColumns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'title', headerName: 'Asset Title', width: 250 },
        { field: 'size', headerName: 'File Size', width: 130, valueFormatter: (value) => formatBytes(Number(value)) },
        { field: 'thumbnailSize', headerName: 'Thumb Size', width: 130, valueFormatter: (value) => formatBytes(Number(value)) },
        { field: 'createdAt', headerName: 'Uploaded At', width: 200, valueFormatter: (value) => new Date(value).toLocaleString() },
    ];

    return (
        <Container maxWidth="xl">
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 2 }}>
                Back to Users
            </Button>
            
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    {stats.user.name} <Chip label={stats.user.role} color="primary" size="small" />
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                        <Typography variant="body1">{stats.user.email}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">Joined</Typography>
                        <Typography variant="body1">{new Date(stats.user.createdAt).toLocaleDateString()}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="text.secondary">Provider</Typography>
                        <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{stats.user.provider || 'Email'}</Typography>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>Total Storage Used</Typography>
                            <Typography variant="h5">{formatBytes(stats.overview.totalStorage)}</Typography>
                            <Typography variant="caption">Assets: {formatBytes(stats.overview.totalSize)} | Thumbs: {formatBytes(stats.overview.totalThumbnailSize)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>Total Files</Typography>
                            <Typography variant="h5">{stats.overview.totalCount}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Assets Inventory" />
                    <Tab label="Daily Upload Stats" />
                    <Tab label="Access Logs (Login/View)" />
                    <Tab label="Asset Usage (Copy History)" />
                </Tabs>
                
                <CustomTabPanel value={tabValue} index={0}>
                    <Box sx={{ height: 500, width: '100%' }}>
                         <DataGrid
                            rows={stats.assets}
                            columns={inventoryColumns}
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                        />
                    </Box>
                </CustomTabPanel>

                <CustomTabPanel value={tabValue} index={1}>
                    <Box sx={{ height: 500, width: '100%' }}>
                        <DataGrid
                            rows={stats.dailyStats.map((r, i) => ({ id: i, ...r }))}
                            columns={dailyColumns}
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                        />
                    </Box>
                </CustomTabPanel>

                <CustomTabPanel value={tabValue} index={2}>
                    <Box sx={{ height: 500, width: '100%' }}>
                        <DataGrid
                            rows={stats.activityLogs}
                            columns={activityColumns}
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                        />
                    </Box>
                </CustomTabPanel>

                <CustomTabPanel value={tabValue} index={3}>
                    <Box sx={{ height: 500, width: '100%' }}>
                        <DataGrid
                            rows={stats.assetHistory}
                            columns={assetColumns}
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                        />
                    </Box>
                </CustomTabPanel>
            </Paper>
        </Container>
    );
}
