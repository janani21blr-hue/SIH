function Header() {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
      <div>
        <h1 className="text-xl font-semibold">
          Criminal Network Analysis System
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Investigation Intelligence Platform
        </p>
      </div>

      <div className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300">
        Investigator
      </div>
    </header>
  )
}

export default Header