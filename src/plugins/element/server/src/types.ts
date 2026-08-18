export type ElementEventPayload = Record<string, unknown>;

export interface NormalizedElementEvent {
  externalId: string;
  payload: ElementEventPayload;
}
