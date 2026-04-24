import { useEffect, useRef, useCallback } from 'react'

const EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']

/**
 * Calls onWarn after warnAfterMs of inactivity.
 * Calls onLogout after warnAfterMs + logoutAfterMs if still idle.
 * Returns a reset function to restart the timer (call on "Stay logged in").
 */
export function useIdleTimer({ onWarn, onLogout, warnAfterMs, logoutAfterMs }) {
  const warnTimer   = useRef(null)
  const logoutTimer = useRef(null)
  const warned      = useRef(false)

  const clearTimers = useCallback(() => {
    clearTimeout(warnTimer.current)
    clearTimeout(logoutTimer.current)
  }, [])

  const reset = useCallback(() => {
    clearTimers()
    warned.current = false

    warnTimer.current = setTimeout(() => {
      warned.current = true
      onWarn()
      logoutTimer.current = setTimeout(onLogout, logoutAfterMs)
    }, warnAfterMs)
  }, [clearTimers, onWarn, onLogout, warnAfterMs, logoutAfterMs])

  // Restart timer on any user activity — but only if not already in warning state
  const handleActivity = useCallback(() => {
    if (!warned.current) reset()
  }, [reset])

  useEffect(() => {
    reset()
    EVENTS.forEach(e => window.addEventListener(e, handleActivity, { passive: true }))
    return () => {
      clearTimers()
      EVENTS.forEach(e => window.removeEventListener(e, handleActivity))
    }
  }, [reset, handleActivity, clearTimers])

  return { reset }
}
