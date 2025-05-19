import React from 'react';
import { Box, Typography, IconButton, Avatar, Button, Paper, Grid, useTheme } from '@mui/material';
import { Search, Notifications, Add, MoreVert, OpenInFull } from '@mui/icons-material';
import './AdminDashboard.css';

// Activity timeline card component
const ActivityTimeline = () => {
  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ fontSize: '15px', fontWeight: 600 }}>My activity</Typography>
        <IconButton size="small"><OpenInFull fontSize="small" /></IconButton>
      </Box>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px', mb: 2 }}>
        What is waiting for you today
      </Typography>
      
      {/* Timeline header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        {['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00'].map((time) => (
          <Typography key={time} variant="caption" sx={{ color: 'text.secondary', fontSize: '10px' }}>
            {time}
          </Typography>
        ))}
      </Box>
      
      {/* Timeline items */}
      <Box className="timeline-container">
        <div className="timeline-line"></div>
        
        {/* Project onboarding */}
        <Box className="task-card project-onboarding">
          <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '11px' }}>
            Project onboarding
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: '2px' }}>
            <Typography variant="caption" sx={{ fontSize: '10px' }}>Google Meeting</Typography>
            <Avatar sx={{ width: 18, height: 18, ml: 'auto' }} />
          </Box>
        </Box>
        
        {/* Design research */}
        <Box className="task-card design-research">
          <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '11px' }}>
            Design research
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: '2px' }}>
            <Typography variant="caption" sx={{ fontSize: '10px' }}>Figma</Typography>
            <Avatar sx={{ width: 18, height: 18, ml: 'auto' }} />
          </Box>
        </Box>
        
        {/* Coffee break */}
        <Box className="task-card coffee-break">
          <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '11px' }}>
            Coffee break
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: '2px' }}>
            <Typography variant="caption" sx={{ fontSize: '10px' }}>CoGo Cafe</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// To-do list component
const TodoList = () => {
  return (
    <Box sx={{ height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontSize: '15px', fontWeight: 600 }}>To-do list</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px' }}>
            Wednesday, 17 May
          </Typography>
        </Box>
        <IconButton size="small"><OpenInFull fontSize="small" /></IconButton>
      </Box>
      
      {/* Todo item */}
      <Box sx={{ mt: 2, p: 1, borderRadius: '8px', border: '1px solid #eee' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Client Review & Feedback
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px' }}>
              Website homepage redesign
            </Typography>
          </Box>
          <IconButton sx={{ bgcolor: '#e9f7e9', color: '#4caf50', width: 24, height: 24 }}>
            ✓
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '10px' }}>
            Today
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '10px', mx: 1 }}>
            10:00 AM - 11:45 PM
          </Typography>
          <Box sx={{ display: 'flex', ml: 'auto' }}>
            <Avatar sx={{ width: 20, height: 20 }} />
            <Avatar sx={{ width: 20, height: 20, ml: -0.5 }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// Performance chart component
const PerformanceChart = () => {
  return (
    <Box sx={{ height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontSize: '15px', fontWeight: 600 }}>Summary</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px' }}>
            Track your performance
          </Typography>
        </Box>
        <Box sx={{ display: 'flex' }}>
          <IconButton size="small"><MoreVert fontSize="small" /></IconButton>
          <IconButton size="small"><OpenInFull fontSize="small" /></IconButton>
        </Box>
      </Box>
      
      {/* Chart placeholder */}
      <Box sx={{ 
        mt: 2, 
        height: '90px', 
        position: 'relative', 
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'flex-end',
        px: 1
      }}>
        {/* Y-axis labels */}
        <Box sx={{ position: 'absolute', left: 0, top: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary' }}>400</Typography>
          <Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary' }}>300</Typography>
          <Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary' }}>200</Typography>
        </Box>
        
        {/* Line chart - represented as a svg path */}
        <Box sx={{ width: '100%', height: '100%', position: 'relative', mt: 2 }}>
          <svg width="100%" height="70px" viewBox="0 0 280 70" style={{ position: 'absolute', bottom: 0 }}>
            <path
              d="M0,50 C20,40 40,60 60,45 C80,30 100,55 120,50 C140,45 160,15 180,25 C200,35 220,15 240,5 C260,-5 280,10 300,5"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="2"
            />
            <path
              d="M0,50 C20,40 40,60 60,45 C80,30 100,55 120,50 C140,45 160,15 180,25 C200,35 220,15 240,5 C260,-5 280,10 300,5"
              fill="none"
              stroke="#333"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
            <circle cx="240" cy="5" r="4" fill="#333" />
            <rect x="235" y="0" width="20" height="10" fill="#333" rx="5" />
            <text x="245" y="7.5" fontSize="6" fontWeight="bold" fill="white" textAnchor="middle" dominantBaseline="middle">317</text>
          </svg>
        </Box>
      </Box>
    </Box>
  );
};

// Chat component
const ChatBox = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      bgcolor: '#fff',
      borderRadius: '12px',
      overflow: 'hidden',
      p: 2
    }}>
      <Box sx={{ display: 'flex', mb: 2 }}>
        <IconButton size="small" sx={{ mr: 1 }}>+</IconButton>
        <IconButton size="small" sx={{ mr: 1 }}>○</IconButton>
        <IconButton size="small" sx={{ mr: 1 }}>⊡</IconButton>
      </Box>
      
      <Box className="custom-scrollbar" sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
        <Box sx={{ display: 'flex', mb: 2 }}>
          <Avatar sx={{ width: 32, height: 32, mr: 1.5 }} />
          <Box sx={{ maxWidth: '80%' }}>
            <Typography variant="body2" sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: '8px' }}>
              Hi there! I'm a virtual assistant.<br />
              How can I help you today?
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '10px', mt: 0.5 }}>
              9:32
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        p: 1,
        borderRadius: '8px',
        border: '1px solid #eee'
      }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', flex: 1 }}>
          Write a message
        </Typography>
        <IconButton size="small">😊</IconButton>
        <IconButton size="small">📎</IconButton>
        <IconButton size="small">🎤</IconButton>
      </Box>
    </Box>
  );
};

const AdminDashboard = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#f5f7fa',
      display: 'flex'
    }}>
      {/* Sidebar */}
      <Box sx={{ 
        width: '70px', 
        bgcolor: '#fff',
        borderRight: '1px solid #eee',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 2
      }}>
        <Avatar sx={{ width: 36, height: 36, mb: 4 }}>I</Avatar>
        <Typography sx={{ fontWeight: 500, mb: 3 }}>Intellecta</Typography>
        
        {/* Sidebar icons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', mt: 2 }}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: '10px',
            bgcolor: '#f5f5f5'
          }}>
            <Typography sx={{ fontSize: 20 }}>◻</Typography>
          </Box>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: '10px'
          }}>
            <Typography sx={{ fontSize: 20 }}>◯</Typography>
          </Box>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: '10px'
          }}>
            <Typography sx={{ fontSize: 20 }}>◇</Typography>
          </Box>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: '10px'
          }}>
            <Typography sx={{ fontSize: 20 }}>◻</Typography>
          </Box>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: '10px'
          }}>
            <Typography sx={{ fontSize: 20 }}>◻</Typography>
          </Box>
        </Box>
        
        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: '10px',
            bgcolor: '#f5f5f5'
          }}>
            <Typography sx={{ fontSize: 20 }}>◯</Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Main content */}
      <Box sx={{ flex: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>Good morning, Mike!</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Let's make this day productive.
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center', 
              bgcolor: '#fff',
              borderRadius: '20px',
              p: '4px 12px',
              mr: 2
            }}>
              <Search sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
              <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}></Typography>
              <IconButton size="small" sx={{ ml: 1 }}>★</IconButton>
            </Box>
            <IconButton>
              <Notifications />
            </IconButton>
            <Avatar sx={{ ml: 2 }} />
          </Box>
        </Box>
        
        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Paper sx={{ 
              p: 2, 
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12, mb: 1 }}>
                Tasks done
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  2,543
                </Typography>
                <IconButton size="small" sx={{ color: 'success.main', mb: 0.5, ml: 1 }}>↑</IconButton>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ 
              p: 2, 
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12, mb: 1 }}>
                Hours saved
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  82%
                </Typography>
                <IconButton size="small" sx={{ color: 'success.main', mb: 0.5, ml: 1 }}>↑</IconButton>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Main content grid */}
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Paper sx={{ 
              borderRadius: '12px',
              height: '350px',
              overflow: 'hidden'
            }}>
              <ChatBox />
            </Paper>
          </Grid>
          <Grid item xs={8}>
            <Paper sx={{ 
              p: 2, 
              borderRadius: '12px',
              height: '350px'
            }}>
              <ActivityTimeline />
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper sx={{ 
              p: 2, 
              borderRadius: '12px',
              height: '200px'
            }}>
              <TodoList />
            </Paper>
          </Grid>
          <Grid item xs={8}>
            <Paper sx={{ 
              p: 2, 
              borderRadius: '12px',
              height: '200px'
            }}>
              <PerformanceChart />
            </Paper>
          </Grid>
        </Grid>
        
        {/* Add task button */}
        <Button
          className="add-task-btn"
          variant="contained"
          startIcon={<Add />}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            borderRadius: '24px',
            bgcolor: '#000',
            color: '#fff',
            px: 3,
            py: 1.5,
            '&:hover': {
              bgcolor: '#333'
            }
          }}
        >
          Add task
        </Button>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 