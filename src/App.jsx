import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import ClientIntakePage from './pages/ClientIntakePage'
import RecommendationsPage from './pages/RecommendationsPage'
import DestinationPage from './pages/DestinationPage'
import ItineraryBuilderPage from './pages/ItineraryBuilderPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/client-intake" element={<ClientIntakePage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/destination/:slug" element={<DestinationPage />} />
        <Route path="/itinerary-builder" element={<ItineraryBuilderPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App