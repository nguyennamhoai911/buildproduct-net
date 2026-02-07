import { useEffect, useState, type ChangeEvent } from 'react';
import {
    Box,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    Chip,
    Alert,
    Snackbar,
    Stack,
    Paper
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { inspirationAPI } from '../lib/api';

interface Inspiration {
    id: string | number;
    name: string;
    website: string;
    category: string;
    field: string;
    style: string;
    rating: string;
    country: string;
}

const initialFormState = {
    name: '',
    website: '',
    category: 'Product',
    field: '',
    style: '',
    rating: '5',
    country: 'Việt Nam'
};

export default function InspirationsPage() {
    const [rows, setRows] = useState<Inspiration[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await inspirationAPI.getAll();
            const mappedData = res.map((item: any, index: number) => ({
                ...item,
                id: item.id || item._id || index
            }));
            setRows(mappedData);
        } catch (error: any) {
            console.error(error);
            showSnackbar(error.message || 'Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleCreate = async () => {
        try {
            await inspirationAPI.create(formData);
            showSnackbar('Created successfully', 'success');
            setOpen(false);
            setFormData(initialFormState);
            fetchData();
        } catch (error) {
            showSnackbar('Failed to create', 'error');
        }
    };

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
        { 
            field: 'website', 
            headerName: 'Website', 
            flex: 1,
            renderCell: (params: GridRenderCellParams) => (
                <a href={params.value} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>
                    {params.value}
                </a>
            )
        },
        {
            field: 'category',
            headerName: 'Category',
            width: 120,
            renderCell: (params: GridRenderCellParams) => (
                <Chip
                    label={params.value}
                    color={params.value === 'Product' ? 'primary' : 'success'}
                    size="small"
                    variant="outlined"
                />
            )
        },
        { field: 'field', headerName: 'Field', width: 130 },
        { field: 'country', headerName: 'Country', width: 120 },
        {
            field: 'actions',
            headerName: 'Action',
            width: 100,
            sortable: false,
            renderCell: () => (
                <Stack direction="row" spacing={1}>
                    <IconButton size="small" color="primary">
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Stack>
            )
        }
    ];

    const handleChange = (field: keyof typeof initialFormState) => (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Inspirations Management
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                    Add New
                </Button>
            </Box>

            <Paper elevation={0} sx={{ height: 600, width: '100%', bgcolor: 'background.paper' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 10 },
                        },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    checkboxSelection
                    disableRowSelectionOnClick
                    sx={{ border: 0 }}
                />
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Inspiration</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            autoFocus
                            label="Name"
                            fullWidth
                            value={formData.name}
                            onChange={handleChange('name')}
                            required
                        />
                        <TextField
                            label="Website"
                            fullWidth
                            value={formData.website}
                            onChange={handleChange('website')}
                            required
                        />
                        <TextField
                            select
                            label="Category"
                            fullWidth
                            value={formData.category}
                            onChange={handleChange('category')}
                        >
                            <MenuItem value="Product">Product (Case Study)</MenuItem>
                            <MenuItem value="Source">Source (Resource)</MenuItem>
                        </TextField>
                        <TextField
                            label="Field"
                            fullWidth
                            value={formData.field}
                            onChange={handleChange('field')}
                        />
                        <TextField
                            label="Style"
                            fullWidth
                            value={formData.style}
                            onChange={handleChange('style')}
                        />
                        <TextField
                            select
                            label="Rating"
                            fullWidth
                            value={formData.rating}
                            onChange={handleChange('rating')}
                        >
                            <MenuItem value="1">1 Star</MenuItem>
                            <MenuItem value="2">2 Stars</MenuItem>
                            <MenuItem value="3">3 Stars</MenuItem>
                            <MenuItem value="4">4 Stars</MenuItem>
                            <MenuItem value="5">5 Stars</MenuItem>
                        </TextField>
                        <TextField
                            label="Country"
                            fullWidth
                            value={formData.country}
                            onChange={handleChange('country')}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
