import type { SkillEdge, SkillGraph, SkillNode, SkillStatus } from "@/types/skills";
import { ApiError, UNEXPECTED_ERROR_MESSAGE, getJson, isRecord } from "./http";

function isStatus(value: unknown): value is SkillStatus {
  return value === "STRONG" || value === "DEVELOPING" || value === "WEAK";
}

function isSkillNode(value: unknown): value is SkillNode {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    (value.type === "POSITION" || value.type === "TECHNIQUE") &&
    typeof value.name === "string" &&
    typeof value.attempts === "number" &&
    typeof value.successes === "number" &&
    typeof value.failures === "number" &&
    (value.successRate === null || typeof value.successRate === "number") &&
    (value.status === null || isStatus(value.status))
  );
}

function isSkillEdge(value: unknown): value is SkillEdge {
  if (!isRecord(value) || typeof value.id !== "string") {
    return false;
  }
  if (typeof value.source !== "string" || typeof value.target !== "string") {
    return false;
  }
  if (value.type === "ATTEMPTED_TECHNIQUE") {
    return (
      typeof value.attempts === "number" &&
      typeof value.successes === "number" &&
      typeof value.failures === "number" &&
      typeof value.successRate === "number" &&
      isStatus(value.status)
    );
  }
  return (
    value.type === "TRANSITIONED_TO" &&
    (value.context === "AFTER_SUCCESS" || value.context === "AFTER_FAILURE") &&
    typeof value.count === "number"
  );
}

function isSkillGraph(value: unknown): value is SkillGraph {
  return (
    isRecord(value) &&
    Array.isArray(value.nodes) &&
    value.nodes.every(isSkillNode) &&
    Array.isArray(value.edges) &&
    value.edges.every(isSkillEdge)
  );
}

export const skillsApi = {
  async fetchMine(token: string): Promise<SkillGraph> {
    const data = await getJson("/api/skills/me", token);
    if (!isSkillGraph(data)) {
      throw new ApiError(500, UNEXPECTED_ERROR_MESSAGE);
    }
    return data;
  },
};
