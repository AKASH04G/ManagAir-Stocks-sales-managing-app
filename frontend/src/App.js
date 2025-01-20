import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import MainPage from './components/Main';
 
const App = () => {
  return (
    < >
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
         <Route path="/*" element={<MainPage />} />
      </Routes>
    </ >
  );
};

export default App;
