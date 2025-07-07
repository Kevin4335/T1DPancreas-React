import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function Footer() {
    const theme = useTheme();

    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: '#f5f5f5',
                py: 2,
                mt: 'auto',
                textAlign: 'center',
                position: 'relative',
                bottom: 0,
                width: '100%'
            }}
            color='background'
        >
            <Typography variant="body2" color="text.secondary">
                Copyright &copy; Chen lab at Weill Cornell Medicine 2025 All rights reserved.
            </Typography>
        </Box>
    );
}

export default Footer; 