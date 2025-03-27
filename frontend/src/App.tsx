import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { client } from './lib/apollo-client';
import { TodoList } from './components/TodoList';
import { CreateTodoForm } from './components/CreateTodoForm';
import { TodoDetail } from './components/TodoDetail';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                  <CreateTodoForm />
                  <TodoList />
                </div>
              }
            />
            <Route
              path="/todo/:id"
              element={
                <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
                  <TodoDetail />
                </div>
              }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </ApolloProvider>
  );
};

export default App; 