import { Routes,Route } from 'react-router-dom';
import './App.css'
import Playground from './Pages/PlayGround';
import HomePage from './Pages/HomePage';

function App() {

  return (
    <div>
        <div className="main-content">
                <Routes>
                    <Route path="/playground" element={<Playground />} />
                    <Route path="/" element={<HomePage />} />
                </Routes>
            </div>
    </div>  
  )
}

export default App
