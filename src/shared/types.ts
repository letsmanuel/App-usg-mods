

/**
 * Types shared between the client and server go here.
 *
 * For example, we can add zod schemas for API input validation, and derive types from them:
 *
 * export const TodoSchema = z.object({
 *   id: z.number(),
 *   name: z.string(),
 *   completed: z.number().int(), // 0 or 1
 * })
 *
 * export type TodoType = z.infer<typeof TodoSchema>;
 */

export interface Session {
  id: number;
  session_token: string;
  roblox_id: string;
  roblox_username: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

declare module "hono" {
  interface ContextVariableMap {
    session?: Session;
  }
}
