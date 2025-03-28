'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_TODO } from '../graphql/todoQueries';
import { UPDATE_TODO, DELETE_TODO } from '../graphql/todoMutations';
import { 
  TodoData, 
  TodoVariables, 
  UpdateTodoVariables, 
  DeleteTodoVariables,
  UpdateTodoData,
  DeleteTodoData
} from '../types/todo';
import {
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  Grid,
  Divider
} from '@mui/material';
import { useState } from 'react';

export const TodoDetail: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { loading, error, data } = useQuery<TodoData, TodoVariables>(GET_TODO, {
    variables: { id },
    onCompleted: (data) => {
      if (data.todo) {
        setTitle(data.todo.title);
        setDescription(data.todo.description || '');
        setCompleted(data.todo.completed);
      }
    }
  });

  const [updateTodo, { loading: updateLoading }] = useMutation<UpdateTodoData, UpdateTodoVariables>(UPDATE_TODO, {
    onCompleted: () => {
      setIsEditing(false);
    }
  });

  const [deleteTodo, { loading: deleteLoading }] = useMutation<DeleteTodoData, DeleteTodoVariables>(DELETE_TODO, {
    onCompleted: () => {
      router.push('/');
    }
  });

  const handleToggleEdit = () => {
    if (isEditing) {
      // Cancel editing - reset to original values
      if (data?.todo) {
        setTitle(data.todo.title);
        setDescription(data.todo.description || '');
        setCompleted(data.todo.completed);
      }
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    updateTodo({
      variables: {
        updateTodoInput: {
          id,
          title,
          description: description || undefined,
          completed
        }
      }
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      deleteTodo({
        variables: { id }
      });
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error loading todo: {error.message}</Alert>;
  if (!data || !data.todo) return <Alert severity="error">Todo not found</Alert>;

  return (
    <Paper elevation={2} style={{ padding: '20px', marginTop: '20px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">
          {isEditing ? 'Edit Todo' : 'Todo Details'}
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleToggleEdit} 
            style={{ marginRight: '10px' }}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={() => router.push('/')}
          >
            Back
          </Button>
        </Box>
      </Box>
      
      <Divider style={{ marginBottom: '20px' }} />
      
      {isEditing ? (
        <Box>
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            margin="normal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
              />
            }
            label="Completed"
          />
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={updateLoading}
              style={{ marginRight: '10px' }}
            >
              Save
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              Delete
            </Button>
          </Box>
        </Box>
      ) : (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Title:</Typography>
              <Typography variant="body1" paragraph>{data.todo.title}</Typography>
            </Grid>
            
            {data.todo.description && (
              <Grid item xs={12}>
                <Typography variant="subtitle1">Description:</Typography>
                <Typography variant="body1" paragraph>{data.todo.description}</Typography>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Typography variant="subtitle1">Status:</Typography>
              <Typography variant="body1" paragraph>
                {data.todo.completed ? 'Completed' : 'Not Completed'}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1">Created:</Typography>
              <Typography variant="body1" paragraph>
                {new Date(data.todo.createdAt).toLocaleString()}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1">Last Updated:</Typography>
              <Typography variant="body1" paragraph>
                {new Date(data.todo.updatedAt).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
          
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            Delete
          </Button>
        </Box>
      )}
    </Paper>
  );
};


