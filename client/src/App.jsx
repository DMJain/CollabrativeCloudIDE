import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense} from "react";
import './App.css';
import HomePage from './Pages/HomePage';

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
        </Routes>
      </div>
    </div>
  );
}

export default App;