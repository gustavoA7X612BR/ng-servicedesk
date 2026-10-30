import type { DemoActor } from '../models/demo-actor.model';

export const DEMO_ACTORS: readonly DemoActor[] = [
  { id: 'requester-01', displayName: 'Camila Nunes', role: 'Solicitante' },
  { id: 'support-agent-01', displayName: 'John Doe', role: 'Agente de suporte' },
  { id: 'administrator-01', displayName: 'Alex Costa', role: 'Administrador' },
];

export const ACTIVE_DEMO_ACTOR = DEMO_ACTORS[1];
