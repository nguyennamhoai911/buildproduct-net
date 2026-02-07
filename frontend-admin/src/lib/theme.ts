import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#00ffff', // Cyan for spaceship theme
            light: '#66ffff',
            dark: '#00cccc',
            contrastText: '#0a0e27',
        },
        secondary: {
            main: '#8a2be2', // Purple for spaceship theme
            light: '#a855f7',
            dark: '#6b21a8',
            contrastText: '#fff',
        },
        background: {
            default: '#0a0e27', // Dark space background
            paper: 'rgba(26, 31, 58, 0.9)',
        },
        text: {
            primary: '#ffffff',
            secondary: '#00ffff',
        },
    },
    typography: {
        fontFamily: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: { fontSize: '2rem', fontWeight: 700 },
        h2: { fontSize: '1.75rem', fontWeight: 700 },
        h3: { fontSize: '1.5rem', fontWeight: 600 },
        h4: { fontSize: '1.25rem', fontWeight: 600 },
        h5: { fontSize: '1.1rem', fontWeight: 600 },
        h6: { fontSize: '1rem', fontWeight: 600 },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 8,
                },
                contained: {
                    boxShadow: 'none',
                    backgroundImage: 'linear-gradient(45deg, #0052cc 30%, #2684ff 90%)',
                    '&:hover': {
                        boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                        backgroundImage: 'linear-gradient(45deg, #0042a3 30%, #1e6bcf 90%)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
                elevation1: {
                    boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.12)',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 600,
                    backgroundColor: '#f9fafb',
                    color: '#42526e',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    color: '#172b4d',
                    boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)',
                },
            },
        },
    },
});

export default theme;
