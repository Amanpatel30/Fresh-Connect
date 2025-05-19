import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, List, ListItem, ListItemIcon, ListItemText, Tooltip, Drawer, styled } from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  VerifiedUser as VerifiedUserIcon,
  Category as CategoryIcon,
  ShoppingCart as OrdersIcon,
  Payment as PaymentIcon,
  Assessment as ReportIcon,
  Article as ContentIcon,
  BarChart as AnalyticsIcon,
  ReportProblem as ComplaintsIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon
} from '@mui/icons-material';

// Styled components
const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  width: open ? 240 : 80,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    width: open ? 240 : 80,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
}));

const StyledNavItem = styled(ListItem)(({ theme, active }) => ({
  margin: '8px 10px',
  padding: '8px 16px',
  borderRadius: '10px',
  cursor: 'pointer',
  backgroundColor: active ? theme.palette.primary.lighter : 'transparent',
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.lighter : theme.palette.action.hover,
  },
}));

const NavItem = ({ icon, text, to, open }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Tooltip title={!open ? text : ''} placement="right" arrow>
      <StyledNavItem active={isActive ? 1 : 0} component={Link} to={to}>
        <ListItemIcon 
          sx={{ 
            minWidth: 0, 
            mr: open ? 2 : 0, 
            justifyContent: 'center',
            color: isActive ? 'primary.main' : 'text.secondary'
          }}
        >
          {icon}
        </ListItemIcon>
        {open && <ListItemText primary={text} />}
      </StyledNavItem>
    </Tooltip>
  );
};

const AdminNavbar = () => {
  // For simplicity, let's just use a state for the drawer open status
  const [open, setOpen] = React.useState(false);

  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, to: '/admin' },
    { text: 'Users', icon: <PeopleIcon />, to: '/admin/users' },
    { text: 'Seller Verification', icon: <VerifiedUserIcon />, to: '/admin/seller-verification' },
    { text: 'Categories', icon: <CategoryIcon />, to: '/admin/categories' },
    { text: 'Orders', icon: <OrdersIcon />, to: '/admin/orders' },
    { text: 'Payments', icon: <PaymentIcon />, to: '/admin/payments' },
    { text: 'Reports', icon: <ReportIcon />, to: '/admin/reports' },
    { text: 'Content', icon: <ContentIcon />, to: '/admin/content' },
    { text: 'Analytics', icon: <AnalyticsIcon />, to: '/admin/analytics' },
    { text: 'Complaints', icon: <ComplaintsIcon />, to: '/admin/complaints' },
    { text: 'Settings', icon: <SettingsIcon />, to: '/admin/settings' },
  ];

  return (
    <StyledDrawer
      variant="permanent"
      open={open}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: open ? 'space-between' : 'center',
        padding: '16px'
      }}>
        {open && <Box component="img" src="/logo.png" alt="Logo" sx={{ height: 40 }} />}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 40,
            height: 40,
            borderRadius: '8px',
            backgroundColor: 'action.hover',
            cursor: 'pointer',
          }}
          onClick={() => setOpen(!open)}
        >
          <MenuIcon />
        </Box>
      </Box>
      
      <List sx={{ mt: 2 }}>
        {navItems.map((item) => (
          <NavItem
            key={item.text}
            icon={item.icon}
            text={item.text}
            to={item.to}
            open={open}
          />
        ))}
      </List>
    </StyledDrawer>
  );
};

export default AdminNavbar; 