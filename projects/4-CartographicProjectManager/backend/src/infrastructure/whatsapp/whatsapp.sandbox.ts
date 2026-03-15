/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since March 15, 2026
 * @file backend/src/infrastructure/whatsapp/whatsapp.sandbox.ts
 * @desc In-memory WhatsApp sandbox outbox for testing optional integrations.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 * @see {@link https://typescripttutorial.net}
 */

import crypto from 'node:crypto';

export interface WhatsAppSandboxMessage {
  readonly id: string;
  readonly toUserId: string;
  readonly text: string;
  readonly meta: Record<string, unknown> | null;
  readonly createdAt: Date;
}

const outbox: WhatsAppSandboxMessage[] = [];

export function enqueueSandboxMessage(input: {
  toUserId: string;
  text: string;
  meta?: Record<string, unknown> | null;
}): WhatsAppSandboxMessage {
  const message: WhatsAppSandboxMessage = {
    id: crypto.randomUUID(),
    toUserId: input.toUserId,
    text: input.text,
    meta: input.meta ?? null,
    createdAt: new Date(),
  };

  outbox.push(message);
  return message;
}

export function listSandboxMessages(filter?: {
  toUserId?: string;
}): WhatsAppSandboxMessage[] {
  if (!filter?.toUserId) {
    return [...outbox];
  }

  return outbox.filter((message) => message.toUserId === filter.toUserId);
}

export function clearSandboxMessages(filter?: {
  toUserId?: string;
}): number {
  if (!filter?.toUserId) {
    const count = outbox.length;
    outbox.splice(0, outbox.length);
    return count;
  }

  const before = outbox.length;
  for (let index = outbox.length - 1; index >= 0; index--) {
    if (outbox[index]?.toUserId === filter.toUserId) {
      outbox.splice(index, 1);
    }
  }

  return before - outbox.length;
}
