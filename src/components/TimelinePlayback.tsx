import React, { useState, useEffect } from "react"
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Layers,
  X,
} from "lucide-react"

export interface TimelineEvent {
  step: number
  date: string
  time: string
  title: string
  description: string
  activeNodeIds: string[]
  activeLinkKeys: string[]
  category: "SIM_ACTIVATION" | "ACCOUNT_SETUP" | "HAWALA_TRANSFER" | "TOLL_ANPR" | "INTERCEPT"
}

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    step: 1,
    date: "02-Aug-2026",
    time: "11:30 AM",
    title: "1. Shell SIM & Burner Line Acquisition",
    description: "Rajesh Kumar acquires Airtel SIM (+91 9811122233) using proxy Aadhaar at Delhi vendor.",
    activeNodeIds: ["P017", "PHONE_08"],
    activeLinkKeys: ["P017-PHONE_08"],
    category: "SIM_ACTIVATION",
  },
  {
    step: 2,
    date: "14-Aug-2026",
    time: "03:15 PM",
    title: "2. Mule Current Account Registration",
    description: "HDFC current account •••• 4821 opened under 'North Star Trading Pvt Ltd' with Rajesh Kumar signatory.",
    activeNodeIds: ["P017", "ACC_12", "COMP_12", "ADDR_09"],
    activeLinkKeys: ["P017-ACC_12", "COMP_12-ADDR_09"],
    category: "ACCOUNT_SETUP",
  },
  {
    step: 3,
    date: "05-Sept-2026",
    time: "04:45 PM",
    title: "3. Logistics & Co-conspirator Linkage",
    description: "Vikram Singh operates black SUV DL 3C AB 4821; sets up secondary Axis Bank mule account •••• 7714.",
    activeNodeIds: ["P031", "PHONE_21", "ACC_19", "VEH_07", "ADDR_04"],
    activeLinkKeys: ["P031-PHONE_21", "P031-ACC_19", "P031-VEH_07", "P031-ADDR_04"],
    category: "ACCOUNT_SETUP",
  },
  {
    step: 4,
    date: "18-Sept-2026",
    time: "02:14 AM",
    title: "4. Midnight Cash Transit & Toll ANPR Logging",
    description: "Vehicle DL 3C AB 4821 pings Kherki Daula toll; CDR registers 4 short WhatsApp calls to Tariq Khan.",
    activeNodeIds: ["P017", "P031", "PHONE_08", "PHONE_21", "VEH_07", "P042"],
    activeLinkKeys: ["P017-PHONE_08", "P031-PHONE_21", "P031-VEH_07"],
    category: "TOLL_ANPR",
  },
  {
    step: 5,
    date: "22-Sept-2026",
    time: "09:00 PM",
    title: "5. Layered ₹45 Lakh Hawala Fund Settlement",
    description: "Multi-tranche circular transfer executed from HDFC •••• 4821 to Axis •••• 7714 for Hawala clearance.",
    activeNodeIds: ["P017", "ACC_12", "ACC_19", "P031", "COMP_12", "ADDR_09", "P042"],
    activeLinkKeys: ["P017-ACC_12", "ACC_12-ACC_19", "P031-ACC_19", "COMP_12-ADDR_09"],
    category: "HAWALA_TRANSFER",
  },
]

interface Props {
  isOpen: boolean
  onClose: () => void
  onStepChange: (event: TimelineEvent | null) => void
}

export default function TimelinePlayback({
  isOpen,
  onClose,
  onStepChange,
}: Props) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false)
      onStepChange(null)
      return
    }
    onStepChange(TIMELINE_EVENTS[currentStepIndex])
  }, [isOpen, currentStepIndex])

  useEffect(() => {
    let timer: any = null
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= TIMELINE_EVENTS.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 2500)
    }
    return () => clearInterval(timer)
  }, [isPlaying])

  if (!isOpen) return null

  const currentEvent = TIMELINE_EVENTS[currentStepIndex]

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900/95 backdrop-blur-md p-4 shadow-2xl text-slate-100">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Clock size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              Temporal Investigation Playback
              <span className="text-[10px] font-mono text-teal-400 px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30">
                STEP {currentStepIndex + 1} OF {TIMELINE_EVENTS.length}
              </span>
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onStepChange(null)
              onClose()
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Active Event Card */}
      <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-teal-400 font-mono">
              {currentEvent.date} · {currentEvent.time}
            </span>
            <span className="text-xs font-bold text-white">
              {currentEvent.title}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {currentEvent.description}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            Active in Step
          </span>
          <span className="text-xs font-mono font-bold text-teal-300">
            {currentEvent.activeNodeIds.length} Nodes Highlighted
          </span>
        </div>
      </div>

      {/* Playback Controls & Scrubber */}
      <div className="mt-3 flex items-center justify-between gap-4">
        {/* Play/Pause/Prev/Next buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentStepIndex(0)}
            title="Reset to beginning"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <RotateCcw size={14} />
          </button>

          <button
            type="button"
            disabled={currentStepIndex === 0}
            onClick={() => setCurrentStepIndex((p) => Math.max(0, p - 1))}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40 transition"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 shadow-md shadow-teal-500/20 transition"
          >
            {isPlaying ? (
              <>
                <Pause size={14} /> Pause
              </>
            ) : (
              <>
                <Play size={14} /> Play Sequence
              </>
            )}
          </button>

          <button
            type="button"
            disabled={currentStepIndex === TIMELINE_EVENTS.length - 1}
            onClick={() =>
              setCurrentStepIndex((p) =>
                Math.min(TIMELINE_EVENTS.length - 1, p + 1)
              )
            }
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40 transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Step dots scrubber */}
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          {TIMELINE_EVENTS.map((ev, idx) => (
            <button
              key={ev.step}
              type="button"
              onClick={() => {
                setIsPlaying(false)
                setCurrentStepIndex(idx)
              }}
              className={`h-2.5 flex-1 rounded-full transition-all ${
                idx === currentStepIndex
                  ? "bg-teal-400 shadow-md shadow-teal-400/50 scale-105"
                  : idx < currentStepIndex
                  ? "bg-teal-600/60"
                  : "bg-slate-800"
              }`}
              title={ev.title}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            onStepChange(null)
            onClose()
          }}
          className="text-xs text-slate-400 hover:text-white font-medium"
        >
          Exit Timeline View
        </button>
      </div>
    </div>
  )
}
