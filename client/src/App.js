import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';

function App() {
    return (
        <BrowserRouter>
            {/* Toaster for notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    success: {
                        theme: {
                            primary: '#4aed88', // success toast color
                        },
                    },
                    error: {
                        theme: {
                            primary: '#ff4d4f', // error toast color
                        },
                    },
                }}
            />

            {/* App Routes */}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/editor/:roomId" element={<EditorPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
