import type { ReactNode } from "react"

interface SectionCardProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

function SectionCard({
  title,
  description,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <section className={`app-surface p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-sm muted-text">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  )
}

export default SectionCard