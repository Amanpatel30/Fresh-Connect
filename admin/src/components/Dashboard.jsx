import React from 'react';
import { styled, Box, Paper, Typography, Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import Sidebar from './Sidebar';
import ChatSection from './ChatSection';
import Schedule from './Schedule';
import TodoList from './TodoList';
import SummaryChart from './SummaryChart';

const StyledContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  width: '100%',
  boxSizing: 'border-box',
  overflow: 'hidden',
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginLeft: '120px',
  overflowY: 'auto',
  height: '100vh',
  scrollbarWidth: 'thin',
  scrollbarColor: '#5046e5 rgba(241, 241, 241, 0.3)',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'linear-gradient(180deg, #5046e5 0%, #6C63FF 100%)',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'rgba(241, 241, 241, 0.3)',
    borderRadius: '10px',
  },
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
}));

const GreetingSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginBottom: theme.spacing(4),
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  minWidth: 200, 
  textAlign: 'center',
  borderRadius: '20px',
  background: 'transparent',
  backdropFilter: 'blur(10px)',
  boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.06)',
  border: 'none',
}));

const MainContent = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(-5),
}));

const BottomContent = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: theme.spacing(3),
}));

const Dashboard = () => {
  return (
    <StyledContainer>
      <Sidebar />
      <ContentContainer>
        <HeaderContainer>
          <Typography variant="h4" fontWeight="600">
            Intellecta
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'white' }, borderRadius: '50%', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)' }}>
              <LightModeOutlinedIcon />
            </IconButton>
            <IconButton sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'white' }, borderRadius: '50%', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)' }}>
              <SettingsOutlinedIcon />
            </IconButton>
            <IconButton sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'white' }, borderRadius: '50%', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)' }}>
              <SearchOutlinedIcon />
            </IconButton>
            <Box 
              component="img"
              src="/logo192.png"
              alt="user avatar"
              sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%',
                ml: 1,
                bgcolor: '#ddd',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
              }}
            />
          </Box>
        </HeaderContainer>

        <GreetingSection>
          <Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Good morning, Mike!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Let's make this day productive.
            </Typography>
          </Box>
        </GreetingSection>

        <StatsContainer>
          <StatCard>
            <Typography color="text.secondary" gutterBottom>Tasks done</Typography>
            <Typography variant="h3" fontWeight="bold">2,543</Typography>
          </StatCard>
          <StatCard>
            <Typography color="text.secondary" gutterBottom>Hours saved</Typography>
            <Typography variant="h3" fontWeight="bold">82%</Typography>
          </StatCard>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{ 
              bgcolor: '#333',
              color: 'white',
              '&:hover': { bgcolor: '#444' },
              px: 4,
              py: 1.5,
              height: '100%',
              alignSelf: 'center',
              borderRadius: '12px',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.15)',
              fontSize: '1rem',
              minWidth: '150px'
            }}
          >
            Add task
          </Button>
        </StatsContainer>

        <MainContent>
          <ChatSection />
          <Schedule />
        </MainContent>

        <BottomContent>
          <TodoList />
          <SummaryChart />
        </BottomContent>
      </ContentContainer>
    </StyledContainer>
  );
};

export default Dashboard; 