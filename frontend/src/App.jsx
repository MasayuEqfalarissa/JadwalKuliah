import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Schedules from './pages/Schedules';
import Assignments from './pages/Assignments';
import Exams from './pages/Exams';
import Settings from './pages/Settings';

const App = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Toaster position="top-right" />
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                            <Route index element={<Dashboard />} />
                            <Route path="schedules" element={<Schedules />} />
                            <Route path="assignments" element={<Assignments />} />
                            <Route path="exams" element={<Exams />} />
                            <Route path="settings" element={<Settings />} />
                        </Route>
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
