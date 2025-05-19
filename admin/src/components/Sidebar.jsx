import React from 'react';
import { styled, Box, IconButton, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

const SidebarContainer = styled(Box)(({ theme }) => ({
  width: '120px',
  height: '100vh',
  position: 'fixed',
  left: 0,
  top: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  backdropFilter: 'blur(10px)',
  boxShadow: 'none',
  zIndex: 100,
}));

const Logo = styled(Box)(({ theme }) => ({
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  background: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
}));

const LogoInner = styled(Box)(({ theme }) => ({
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  background: 'black',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '15px',
    height: '15px',
    borderRadius: '50%',
    background: 'white',
    left: '5px',
    top: '5px',
  },
}));

const NavButton = styled(IconButton)(({ theme, active }) => ({
  margin: theme.spacing(1, 0),
  background: active ? '#333' : 'white',
  color: active ? 'white' : '#5A5A6F',
  width: '46px',
  height: '46px',
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
  '&:hover': {
    background: active ? '#444' : 'rgba(255, 255, 255, 0.9)',
  },
}));

const NavSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: theme.spacing(2),
}));

const BottomSection = styled(Box)(({ theme }) => ({
  marginTop: 'auto',
}));

const Sidebar = () => {
  return (
    <SidebarContainer>
      <Logo>
        <LogoInner />
      </Logo>
      
      <NavButton>
        <MenuIcon />
      </NavButton>
      
      <NavSection>
        <Tooltip title="Home" placement="right">
          <NavButton data-active="true" sx={{ 
            background: '#333',
            color: 'white',
            '&:hover': {
              background: '#444',
            },
          }}>
            <HomeRoundedIcon />
          </NavButton>
        </Tooltip>
        
        <Tooltip title="Apps" placement="right">
          <NavButton>
            <GridViewRoundedIcon />
          </NavButton>
        </Tooltip>
        
        <Tooltip title="Activity" placement="right">
          <NavButton>
            <BoltRoundedIcon />
          </NavButton>
        </Tooltip>
        
        <Tooltip title="Documents" placement="right">
          <NavButton>
            <ArticleRoundedIcon />
          </NavButton>
        </Tooltip>
      </NavSection>
      
      <BottomSection>
        <Tooltip title="Logout" placement="right">
          <NavButton>
            <LogoutRoundedIcon />
          </NavButton>
        </Tooltip>
      </BottomSection>
    </SidebarContainer>
  );
};

export default Sidebar; 