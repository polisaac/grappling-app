import type { CreateLogPayload, CreatedLog } from "@/types/log";
import { ApiError, UNEXPECTED_ERROR_MESSAGE, isRecord, postJson } from "./http";

function isCreatedLog(value: unknown): value is CreatedLog {
  return isRecord(value) && typeof value.id === "string";
}

export const logsApi = {
  async create(token: string, payload: CreateLogPayload): Promise<CreatedLog> {
    const data = await postJson("/api/logs", payload, token);
    if (!isCreatedLog(data)) {
      throw new ApiError(500, UNEXPECTED_ERROR_MESSAGE);
    }
    return data;
  },
};
