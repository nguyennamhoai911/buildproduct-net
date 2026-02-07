import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    CssBaseline,
} from '@mui/material';
import {
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Users Management', icon: <PeopleIcon />, path: '/users' },
];

export default function AppLayout() {
    const [open, setOpen] = useState(true);
    const location = useLocation();

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: 'white',
                    color: 'text.primary',
                    boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)',
                    ...(open && {
                        marginLeft: drawerWidth,
                        width: `calc(100% - ${drawerWidth}px)`,
                    }),
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{
                            marginRight: 5,
                            ...(open && { display: 'none' }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ color: 'text.primary' }}>
                        Admin Panel
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                open={open}
                sx={{
                    width: open ? drawerWidth : 65,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: open ? drawerWidth : 65,
                        boxSizing: 'border-box',
                        transition: 'width 0.2s',
                    },
                }}
            >
                <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton onClick={handleDrawerClose}>
                        <ChevronLeftIcon />
                    </IconButton>
                </Toolbar>
                <Divider />
                <List>
                    {menuItems.map((item) => (
                        <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                            <ListItemButton
                                component={Link}
                                to={item.path}
                                selected={location.pathname === item.path}
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                        color: location.pathname === item.path ? 'primary.main' : 'inherit'
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
                <Toolbar />
                <Outlet />
                <Box component="footer" sx={{ py: 3, textAlign: 'center', color: 'text.secondary', mt: 'auto' }}>
                    <Typography variant="body2">Admin Panel ©2023 Created by BuildProduct</Typography>
                </Box>
            </Box>
        </Box>
    );
}
