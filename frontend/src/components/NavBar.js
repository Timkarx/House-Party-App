import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

export default function ButtonAppBar(props) {
    const settings = props.settingsCallback;
    const settingsButton = props.settingsButtonCallback;
    const host = props.host;
    const leaveButton = props.leaveButton;

  return (
    <Box sx={{ flexGrow: 1, width:"100%" }}>
      <AppBar position="static" sx={{bgcolor: '#6574b8'}}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Room Code: {props.room_code}
          </Typography>
          {host ? settingsButton() : null}
          {leaveButton()}
        </Toolbar>
      </AppBar>
    </Box>
  );
}