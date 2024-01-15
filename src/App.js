// import logo from './logo.svg';
// import './App.css';
import Home from './component/Home';
import About from './component/About';
import Test from './component/Test1';
import SignUp from './component/SignUp';
import Login from './component/Login';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/test" element={<Test />} >

      </Route>
    </Routes>
  );
}

export default App;
