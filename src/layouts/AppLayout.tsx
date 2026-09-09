import type { ReactNode } from "react"
import { useLocation } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"

interface AppLayoutProps {
  children: ReactNode
}

function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const isInvestigation = location.pathname.startsWith("/investigations")

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {!isInvestigation && <Header />}

        <main className={`flex-1 ${isInvestigation ? "p-0 overflow-hidden" : "p-6"}`}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout