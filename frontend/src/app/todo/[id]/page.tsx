'use client';

import React from 'react';
import { TodoDetail } from '../../../components/TodoDetail';
import { Container } from '@mui/material';

export default function TodoDetailPage() {
  return (
    <Container maxWidth="md" style={{ paddingTop: '20px' }}>
      <TodoDetail />
    </Container>
  );
} 