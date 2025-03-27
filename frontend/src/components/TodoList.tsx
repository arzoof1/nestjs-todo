'use client';

import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_TODOS } from '../graphql/todoQueries';
import { UPDATE_TODO, DELETE_TODO } from '../graphql/todoMutations';
import { TodosData, UpdateTodoVariables, DeleteTodoVariables } from '../types/todo';
import { useRouter } from 'next/navigation';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Checkbox,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';

export const TodoList: React.FC = () => {
  const router = useRouter();
  const { loading, error, data } = useQuery<TodosData>(GET_TODOS);
  
  const [updateTodo] = useMutation<any, UpdateTodoVariables>(UPDATE_TODO, {
    refetchQueries: [{ query: GET_TODOS }]
  });
  
  const [deleteTodo] = useMutation<any, DeleteTodoVariables>(DELETE_TODO, {
    refetchQueries: [{ query: GET_TODOS }]
  });

  const handleToggleComplete = (id: string, completed: boolean) => {
    updateTodo({
      variables: {
        updateTodoInput: {
          id,
          completed: !completed
        }
      }
    });
  };

  const handleDeleteTodo = (id: string) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      deleteTodo({
        variables: { id }
      });
    }
  };

  const navigateToDetail = (id: string) => {
    router.push(`/todo/${id}`);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error loading todos: {error.message}</Alert>;
  if (!data || !data.todos || data.todos.length === 0) {
    return (
      <Paper elevation={2} style={{ padding: '20px', marginTop: '20px' }}>
        <Typography variant="h6">No todos found</Typography>
        <Typography variant="body2">Create a new todo to get started</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} style={{ padding: '20px', marginTop: '20px' }}>
      <Typography variant="h5" gutterBottom>
        Todo List
      </Typography>
      <List>
        {data.todos.map((todo) => (
          <ListItem
            key={todo.id}
            secondaryAction={
              <>
                <Tooltip title="View Details">
                  <IconButton 
                    edge="end" 
                    aria-label="details" 
                    onClick={() => navigateToDetail(todo.id)}
                    style={{ marginRight: '8px' }}
                  >
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton 
                    edge="end" 
                    aria-label="delete" 
                    onClick={() => handleDeleteTodo(todo.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            }
          >
            <Checkbox
              edge="start"
              checked={todo.completed}
              onChange={() => handleToggleComplete(todo.id, todo.completed)}
            />
            <ListItemText
              primary={todo.title}
              secondary={todo.description}
              style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
              onClick={() => navigateToDetail(todo.id)}
              sx={{ cursor: 'pointer' }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};


