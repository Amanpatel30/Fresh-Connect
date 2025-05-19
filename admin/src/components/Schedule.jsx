import React, { useEffect } from 'react';
import { styled, Box, Typography } from '@mui/material';

const ScheduleContainer = styled(Box)(({ theme }) => ({
  borderRadius: '20px',
  boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  height: '80%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const ScheduleHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 3, 2, 3),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const ScheduleTopSection = styled(Box)(({ theme }) => ({
  background: 'rgba(245, 245, 248, 0.7)',
  padding: theme.spacing(0, 3, 2, 3),
  borderRadius: '20px 20px 0 0',
  width: '94%',
  marginLeft: '25px',
}));

const ScheduleBottomSection = styled(Box)(({ theme }) => ({
  background: 'rgba(245, 245, 248, 0.7)',
  padding: theme.spacing(2, 3, 3, 3),
  borderTop: '1px solid rgba(230, 230, 235, 0.8)',
  width: '94%',
  marginLeft: '25px',
  height: '70% ',
  overflow: 'auto',
  borderRadius: '0 0 20px 20px',
}));

const TimelineContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  width: '100%',
  marginTop: theme.spacing(1),
  
}));

const TimeMarker = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
  position: 'relative',
}));

const TimeLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: 'text.secondary',
  marginBottom: theme.spacing(1),
}));

const TimeLine = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '24px',
  left: 0,
  right: 0,
  height: '1px',
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  zIndex: 1,
}));

const CurrentTimeIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '24px',
  left: '50%',
  width: '2px',
  height: '200px',
  backgroundColor: '#6C63FF',
  zIndex: 2,
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '-5px',
    left: '-4px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#6C63FF',
  },
}));

const ActivityBox = styled(Box)(({ theme, color }) => ({
  backgroundColor: color || '#e3f2fd',
  borderRadius: '10px',
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  position: 'relative',
  width: '100%',
}));

const AttendeeAvatar = styled(Box)(({ theme, bgcolor }) => ({
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  backgroundColor: bgcolor || '#6C63FF',
  position: 'absolute',
  right: '10px',
  bottom: '10px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '0.7rem',
  color: 'white',
  fontWeight: 'bold',
}));

const CalendarIcon = styled(Box)(({ theme }) => ({
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  backgroundColor: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.05)',
  fontSize: '18px',
}));

const Schedule = (props) => {
  const timeSlots = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '01:00', '02:00'];
  
  const activities = [
    { 
      title: "Project onboarding", 
      subtitle: "Google Meeting", 
      color: "#deebc0", 
      avatar: "+2",
      avatarColor: "#81c784"
    },
    { 
      title: "Design research", 
      subtitle: "Figma file", 
      color: "#d8d8d8", 
      avatar: "+5",
      avatarColor: "#757575"
    },
    { 
      title: "Coffee break", 
      subtitle: "CosCo Café", 
      color: "#e0d6ff", 
      avatar: "",
      avatarColor: ""
    }
  ];

  useEffect(() => {
    console.log('Schedule.jsx is fully loaded without errors');
  }, []);

  return (
    <ScheduleContainer {...props}>
      <ScheduleHeader>
        <Box>
          <Typography variant="h6" fontWeight={600}>My activity</Typography>
          <Typography variant="body2" color="text.secondary">
            What is waiting for you today
          </Typography>
        </Box>
        <CalendarIcon>📅</CalendarIcon>
      </ScheduleHeader>

      <ScheduleTopSection>
        <TimelineContainer>
          {timeSlots.map((time, index) => (
            <TimeMarker key={index}>
              <TimeLabel>{time}</TimeLabel>
            </TimeMarker>
          ))}
          <TimeLine />
          <CurrentTimeIndicator sx={{ left: '37%', height: '200px' }} />
        </TimelineContainer>
      </ScheduleTopSection>

      <ScheduleBottomSection>
        {activities.map((activity, index) => (
          <ActivityBox key={index} color={activity.color}>
            <Typography variant="subtitle2" fontWeight={500}>
              {activity.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {activity.subtitle}
            </Typography>
            {activity.avatar && (
              <AttendeeAvatar bgcolor={activity.avatarColor}>
                {activity.avatar}
              </AttendeeAvatar>
            )}
          </ActivityBox>
        ))}
      </ScheduleBottomSection>
    </ScheduleContainer>
  );
};

export default Schedule; 