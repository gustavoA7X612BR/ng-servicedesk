export enum TicketCategory {
  Hardware = 'Hardware',
  Software = 'Software',
  Network = 'Rede',
  Access = 'Acesso e permissões',
  Other = 'Outros',
}

export enum TicketPriority {
  Low = 'Baixa',
  Medium = 'Média',
  High = 'Alta',
  Critical = 'Crítica',
}

export enum TicketStatus {
  Open = 'Aberto',
  InProgress = 'Em atendimento',
  WaitingForRequester = 'Aguardando solicitante',
  Resolved = 'Resolvido',
  Closed = 'Fechado',
}

export enum TicketOrigin {
  Local = 'local',
  JsonPlaceholder = 'jsonplaceholder',
}

export enum TicketHistoryEventType {
  Created = 'created',
  Imported = 'imported',
  StatusChanged = 'status-changed',
  PriorityChanged = 'priority-changed',
  AgentAssigned = 'agent-assigned',
  CommentAdded = 'comment-added',
  Resolved = 'resolved',
  Closed = 'closed',
}

export interface TicketHistoryEvent {
  id: string;
  type: TicketHistoryEventType;
  description: string;
  author: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  requester: string;
  requesterEmail: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAgent?: string;
  createdAt: string;
  updatedAt: string;
  history: TicketHistoryEvent[];
  origin: TicketOrigin;
  externalPostId?: number;
}

export type TicketList = Ticket[];

export interface NewTicketInput {
  title: string;
  description: string;
  requester: string;
  requesterEmail: string;
  category: TicketCategory;
  priority: TicketPriority;
}
