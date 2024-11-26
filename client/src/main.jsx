import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {store} from "./store/store.js";
import {Provider} from "react-redux";
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Provider store={store}>
      <QueryClientProvider client={new QueryClient()}>
        <App />
      </QueryClientProvider>
    </Provider>
    </BrowserRouter>
  </StrictMode>,
)
