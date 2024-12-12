import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense} from "react";
import './App.css';
import HomePage from './Pages/HomePage';
import SignupPage from './Pages/SignUpPage';
import SigninPage from './Pages/SignInPage';

const LazyPlayground = lazy(() => import('./Pages/PlayGround'));

function App() {
  return (
    <div>
      <div className="main-content">
        <Routes>
          <Route path="/playground" element={
            <Suspense fallback={<div>Loading Playground...</div>}>
              <LazyPlayground />
            </Suspense>
          } />
          <Route path="/" element={<HomePage />} />
          <Route path="/sign-up" element={<SignupPage />} />
          <Route path="/sign-in" element={<SigninPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;