import { useEffect, useRef, useState } from "react"
export type ActionLog = { t: number; type: string; payload?: any }
const KEY = "resell_action_log_v1"
function readInitial(): ActionLog[] {
    if (typeof window === "undefined") return []
    try {
        const raw = localStorage.getItem(KEY)
        return raw ? (JSON.parse(raw) as ActionLog[]) : []
    } catch {
        return []
    }
}
export function useActionLog() {
    const [logs, setLogs] = useState<ActionLog[]>(readInitial)
    const isInit = useRef(true)
    useEffect(() => {
        if (!isInit.current) {
            localStorage.setItem(KEY, JSON.stringify(logs.slice(-20)))
        }
        isInit.current = false
    }, [logs])
    function push(type: string, payload?: any) {
        setLogs((prev) => [...prev.slice(-(20 - 1)), { t: Date.now(), type, payload }])
    }
    return { logs, push }
}
