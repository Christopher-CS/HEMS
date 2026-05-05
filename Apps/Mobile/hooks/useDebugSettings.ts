import { useDebugStore } from '../state/debug/store';

export function useDebugSettings() {
  const { state, setMode, setLatency, setFailRate, clearLog } = useDebugStore();
  return {
    mode: state.mode,
    latencyMs: state.latencyMs,
    failRate: state.failRate,
    log: state.log,
    hydrated: state.hydrated,
    setMode,
    setLatency,
    setFailRate,
    clearLog,
  };
}
