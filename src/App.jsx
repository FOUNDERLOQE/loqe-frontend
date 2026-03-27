import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import DestinationPage from './pages/DestinationPage'
import ClientIntakePage from './pages/ClientIntakePage'
import RecommendationsPage from './pages/RecommendationsPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/destination/:slug" element={<DestinationPage />} />
        <Route path="/client-intake" element={<ClientIntakePage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App