const activities = [
  {
    title: "New entity identified",
    description: "Rajesh Kumar added to investigation INV-001",
    time: "10 min ago",
  },
  {
    title: "Network updated",
    description: "New relationship detected in Operation Nexus",
    time: "32 min ago",
  },
  {
    title: "Investigation reviewed",
    description: "Operation Shadow marked for review",
    time: "1 hour ago",
  },
  {
    title: "High-risk network flagged",
    description: "Network requires investigator attention",
    time: "2 hours ago",
  },
]

function ActivityList() {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div
          key={index}
          className="flex items-start justify-between border-b border-slate-800 pb-4 last:border-0 last:pb-0"
        >
          <div>
            <p className="font-medium">
              {activity.title}
            </p>

            <p className="mt-1 text-sm muted-text">
              {activity.description}
            </p>
          </div>

          <span className="ml-4 whitespace-nowrap text-xs muted-text">
            {activity.time}
          </span>
        </div>
      ))}
    </div>
  )
}

export default ActivityList