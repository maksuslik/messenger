import ReactDOM from 'react-dom/client'
import MainRoute from './MainRoute'
import { AuthProvider } from './AuthContext'
import { BrowserRouter } from 'react-router-dom'
import React from 'react';
import ReactDOMM from 'react-dom';

console.log('React version:', React.version);
console.log('ReactDOM version:', ReactDOMM.version);

ReactDOM.createRoot(document.getElementById('root')!!).render(
  <AuthProvider>
      <BrowserRouter><MainRoute /></BrowserRouter>
  </AuthProvider>
)
