import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid, type GridColDef, type GridRenderCellParams, type GridPaginationModel } from '@mui/x-data-grid';
import {
    Box,
    Typography,
    Paper,
    Chip,
    TextField,
    InputAdornment,
    IconButton,
    Menu,
    MenuItem,
    Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Block as BlockIcon,
    Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { userAPI } from '../lib/api';

interface User {
    id: number;
    email: string;
    name: string | null;
    role: string;
    provider: string;
    avatar: string | null;
    createdAt: string;
}

export default function UsersPage() {
    const [rows, setRows] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10,
    });
    const [error, setError] = useState<string | null>(null);

    // Context menu state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const navigate = useNavigate();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // API uses 1-based index for page
            const apiPage = paginationModel.page + 1;
            const data = await userAPI.getAll({
                page: apiPage,
                limit: paginationModel.pageSize,
                q: searchQuery
            });

            // Backend returns { data: User[], page: number, limit: number }
            setRows(data.data || []);
            setRowCount(Number(data.total) || 0);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, [paginationModel, searchQuery]);

    useEffect(() => {
        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [fetchUsers]);


    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await userAPI.delete(selectedUser.id);
            setRows(rows.filter(row => row.id !== selectedUser.id));
            handleMenuClose();
        } catch (err) {
            console.error(err);
            setError('Failed to delete user');
        }
    };

    const handleViewAnalytics = () => {
        if (selectedUser) {
            navigate(`/users/${selectedUser.id}`);
            handleMenuClose();
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        {
            field: 'email',
            headerName: 'Email',
            width: 250,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {params.row.avatar && (
                        <img
                            src={params.row.avatar}
                            alt=""
                            style={{ width: 24, height: 24, borderRadius: '50%' }}
                        />
                    )}
                    {params.value}
                </Box>
            )
        },
        { field: 'name', headerName: 'Name', width: 200 },
        {
            field: 'role',
            headerName: 'Role',
            width: 130,
            renderCell: (params: GridRenderCellParams) => {
                const colors: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
                    ADMIN: 'error',
                    USER: 'primary',
                    ROOT: 'secondary'
                };
                return (
                    <Chip
                        label={params.value}
                        color={colors[params.value as string] || 'default'}
                        size="small"
                        variant="outlined"
                    />
                );
            }
        },
        { field: 'provider', headerName: 'Provider', width: 120 },
        {
            field: 'createdAt',
            headerName: 'Registered',
            width: 180,
            valueFormatter: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <IconButton onClick={(e) => handleMenuOpen(e, params.row)}>
                    <MoreVertIcon />
                </IconButton>
            )
        }
    ];

    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h1">
                    User Management
                </Typography>
                <TextField
                    placeholder="Search users..."
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: 300 }}
                />
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    rowCount={rowCount}
                    loading={loading}
                    paginationMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 25, 50, 100]}
                    disableRowSelectionOnClick
                />
            </Paper>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleViewAnalytics}>
                    <AnalyticsIcon fontSize="small" sx={{ mr: 1 }} /> Analytics
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                    <BlockIcon fontSize="small" sx={{ mr: 1 }} /> Ban/Block
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
                </MenuItem>
            </Menu>
        </Box>
    );
}
