import React, { useState, useEffect } from 'react';
import { styled, Box, Typography, Checkbox, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const TodoContainer = styled(Box)(({ theme }) => ({
  borderRadius: '20px',
  boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  height: '500px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  padding: theme.spacing(2),
}));

const TodoHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 3, 2, 3),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const TodoTopSection = styled(Box)(({ theme }) => ({
  background: 'rgba(245, 245, 248, 0.7)',
  padding: theme.spacing(2, 3),
  borderRadius: '20px 20px 0 0',
  width: '98%',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const TodoBodySection = styled(Box)(({ theme }) => ({
  background: 'rgba(245, 245, 248, 0.7)',
  padding: theme.spacing(2, 3, 3, 3),
  borderTop: '1px solid rgba(230, 230, 235, 0.8)',
  width: '98%',
  margin: '0 auto',
  height: '73%',
  borderRadius: '0 0 20px 20px',
}));

const TodoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5, 0),
  borderBottom: '1px solid rgba(238, 238, 238, 0.5)',
}));

const TodoItemContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
}));

const AddTodoButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: '#6C63FF',
  color: 'white',
  width: '32px',
  height: '32px',
  '&:hover': {
    backgroundColor: '#5046e5',
  },
}));

const TodoList = (props) => {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Review project requirements', completed: true },
    { id: 2, text: 'Prepare presentation slides', completed: false },
    { id: 3, text: 'Schedule meeting with design team', completed: false },
    { id: 4, text: 'Update project documentation', completed: false },
    // { id: 5, text: 'Finalize Q3 reporting', completed: false },
  ]);

  const handleToggle = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDelete = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  useEffect(() => {
    console.log('TodoList component loaded');
  }, []);

  return (
    <TodoContainer {...props}>
      <TodoHeader>
        <Box>
          <Typography variant="h6" fontWeight="600">
            To-do list
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Wednesday, 11 May
          </Typography>
        </Box>
        <AddTodoButton size="small">
          <AddIcon fontSize="small" />
        </AddTodoButton>
      </TodoHeader>

      <TodoTopSection>
        <Typography variant="subtitle2" fontWeight={500}>
          Client Review & Feedback
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Landing page redesign
        </Typography>
      </TodoTopSection>

      <TodoBodySection>
        {todos.map((todo) => (
          <TodoItem key={todo.id}>
            <Checkbox 
              checked={todo.completed} 
              onChange={() => handleToggle(todo.id)}
              sx={{ 
                color: '#6C63FF',
                '&.Mui-checked': {
                  color: '#6C63FF',
                },
              }}
            />
            <TodoItemContent data-completed={todo.completed ? "true" : "false"} sx={{
              textDecoration: todo.completed ? 'line-through' : 'none',
              color: todo.completed ? 'text.secondary' : 'text.primary',
            }}>
              <Typography variant="body2">{todo.text}</Typography>
            </TodoItemContent>
            <IconButton 
              size="small" 
              onClick={() => handleDelete(todo.id)}
              sx={{ color: 'text.secondary' }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </TodoItem>
        ))}
      </TodoBodySection>
    </TodoContainer>
  );
};

export default TodoList; 