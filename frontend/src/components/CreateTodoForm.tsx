'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_TODO } from '../graphql/todoMutations';
import { GET_TODOS } from '../graphql/todoQueries';
import { CreateTodoData, CreateTodoVariables } from '../types/todo';
import { 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Box,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';

export const CreateTodoForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');

  // Add debug state to display the JSON of the input
  const [debugJson, setDebugJson] = useState<string | null>(null);

  const [createTodo, { loading, error }] = useMutation<CreateTodoData, CreateTodoVariables>(CREATE_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
    onCompleted: (data) => {
      console.log('Todo created successfully:', data);
      setAlertMessage('Todo created successfully!');
      setAlertSeverity('success');
      setAlertOpen(true);
      // Reset form
      setTitle('');
      setDescription('');
      setDebugJson(null);
    },
    onError: (error) => {
      console.error('Error creating todo:', error);
      setAlertMessage(`Error creating todo: ${error.message}`);
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate title
    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    const createTodoInput = {
      title: title.trim(),
      description: description.trim() || undefined
    };
    
    // Show the JSON that will be sent for debugging
    setDebugJson(JSON.stringify(createTodoInput, null, 2));
    
    createTodo({
      variables: {
        createTodoInput
      }
    }).catch(err => {
      console.error('Unhandled error in mutation:', err);
    });
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  return (
    <Paper elevation={2} style={{ padding: '20px' }}>
      <Typography variant="h5" gutterBottom>
        Create New Todo
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Title"
          variant="outlined"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setTitleError(false);
          }}
          error={titleError}
          helperText={titleError ? 'Title is required' : ''}
          required
          disabled={loading}
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
          disabled={loading}
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth 
          style={{ marginTop: '20px' }}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Creating...' : 'Create Todo'}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" style={{ marginTop: '20px' }}>
          <Typography variant="body2">Error Details:</Typography>
          <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: '100px' }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        </Alert>
      )}
      
      {debugJson && (
        <Box mt={2}>
          <Typography variant="subtitle2">Data being sent:</Typography>
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
            {debugJson}
          </pre>
        </Box>
      )}
      
      <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alertSeverity}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

