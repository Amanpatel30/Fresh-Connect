import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Tooltip } from '@mui/material';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const LogoutButton = ({ variant = 'icon', color = 'error', size = 'medium' }) => {
  const [open, setOpen] = useState(false);
  const { logout } = useUser();
  const navigate = useNavigate();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/login');
  };

  return (
    <>
      {variant === 'icon' ? (
        <Tooltip title="Logout">
          <IconButton onClick={handleClickOpen} color={color} size={size}>
            <LogOut size={size === 'small' ? 18 : 24} />
          </IconButton>
        </Tooltip>
      ) : (
        <Button
          variant={variant}
          color={color}
          onClick={handleClickOpen}
          startIcon={<LogOut size={18} />}
          size={size}
        >
          Logout
        </Button>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Logout"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to log out? You will need to log in again to access your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogout} color="error" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LogoutButton; 