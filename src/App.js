// import logo from './logo.svg';
// import './App.css';
import Home from './component/Home';
import About from './component/About'
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />}>

      </Route>
    </Routes>
  );
}

export default App;
