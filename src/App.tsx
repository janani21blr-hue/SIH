import { BrowserRouter, Routes, Route } from "react-router-dom"
import AppLayout from "./layouts/AppLayout"
import Dashboard from "./pages/Dashboard"
import Investigations from "./pages/Investigations"
import Entities from "./pages/Entities"
import Reports from "./pages/Reports"
import { NetworkFilterProvider } from "./context/NetworkFilterContext"

function App() {
  return (
    <BrowserRouter>
      <NetworkFilterProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/investigations" element={<Investigations />} />
            <Route path="/entities" element={<Entities />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </AppLayout>
      </NetworkFilterProvider>
    </BrowserRouter>
  )
}

export default App
