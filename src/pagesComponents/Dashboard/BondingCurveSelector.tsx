import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { styled } from '@mui/material/styles';
import { brandFont } from "@src/fonts/fonts";

export const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: '12px !important',
    padding: '4px',
    display: 'flex',
    width: '100%',
    height: '36px',
    '& .MuiToggleButton-root': {
        color: '#fff',
        borderRadius: '12px !important',
        textTransform: 'none',
        padding: '6px 16px',
        fontFamily: brandFont.style.fontFamily,
        fontSize: '16px',
        lineHeight: '20px',
        border: 'none',
        flex: 1, // Make each button take up equal space
        '&.Mui-selected': {
            backgroundColor: '#fff',
            color: '#000',
            boxShadow: '0px 0px 4px rgba(0,0,0,0.2)',
            borderRadius: '12px !important',
            '&:hover': {
                backgroundColor: '#fff',
            }
        },
        '&:not(.Mui-selected):hover': {
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: '12px !important',
        }
    }
}));
