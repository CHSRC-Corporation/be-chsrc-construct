export const INCIDENT_MODES = ['degraded', 'error', 'slow'] as const;

export type IncidentMode = (typeof INCIDENT_MODES)[number];

export type IncidentState = {
  active: boolean;
  mode: IncidentMode | null;
  activatedAt: string | null;
};

let currentState: IncidentState = {
  active: false,
  mode: null,
  activatedAt: null,
};

export function getIncidentState(): IncidentState {
  return { ...currentState };
}

export function activateIncident(mode: IncidentMode): IncidentState {
  currentState = {
    active: true,
    mode,
    activatedAt: new Date().toISOString(),
  };

  return getIncidentState();
}

export function resetIncident(): IncidentState {
  currentState = {
    active: false,
    mode: null,
    activatedAt: null,
  };

  return getIncidentState();
}

export function isIncidentModeActive(mode: IncidentMode): boolean {
  return currentState.active && currentState.mode === mode;
}

export function demoIncidentsEnabled(): boolean {
  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_DEMO_INCIDENTS === 'true'
  );
}
