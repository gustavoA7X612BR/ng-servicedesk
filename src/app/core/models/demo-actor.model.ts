export type DemoActorRole = 'Solicitante' | 'Agente de suporte' | 'Administrador';

export interface DemoActor {
  readonly id: string;
  readonly displayName: string;
  readonly role: DemoActorRole;
}
