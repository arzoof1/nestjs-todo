'use client';

import React from 'react';
import { TodoList } from '../components/TodoList';
import { CreateTodoForm } from '../components/CreateTodoForm';
import { Container, Typography, Box } from '@mui/material';

export default function Home() {
  return (
    <Container maxWidth="md">
      <Box mt={4} mb={2}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Todo Application
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" paragraph>
          Manage your tasks with this simple Todo application
        </Typography>
      </Box>
      <CreateTodoForm />
      <TodoList />
    </Container>
  );
}
