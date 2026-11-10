import type { Position, Technique } from "@/constants/ontology";
import type { CreateLogPayload, Modality, ScrambleResult } from "@/types/log";

// Estado del formulario de F02 y reglas de validación (docs/specs/features/F02-registrar-bitacora.md).

export interface ScrambleDraft {
  key: string; // Identificador local para la lista; no se envía al backend.
  position: Position | null;
  technique: Technique | null;
  result: ScrambleResult | null;
}

export interface LogFormState {
  date: string; // AAAA-MM-DD
  time: string; // HH:mm
  modality: Modality | null;
  location: string;
  satisfaction: number | null;
  note: string;
  scrambles: ScrambleDraft[];
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^(\d{2}):(\d{2})$/;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Fecha y hora "automáticas": se precargan con el momento actual y el usuario puede editarlas.
export function createInitialForm(now: Date = new Date()): LogFormState {
  return {
    date: formatDate(now),
    time: formatTime(now),
    modality: null,
    location: "",
    satisfaction: null,
    note: "",
    scrambles: [],
  };
}

export function createEmptyScramble(): ScrambleDraft {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    position: null,
    technique: null,
    result: null,
  };
}

// Devuelve null si la fecha u hora no son válidas (p. ej. 2026-02-31 o 25:00).
export function parseTrainedAt(date: string, time: string): Date | null {
  const dateMatch = DATE_PATTERN.exec(date.trim());
  const timeMatch = TIME_PATTERN.exec(time.trim());
  if (!dateMatch || !timeMatch) {
    return null;
  }

  const [year, month, day] = [Number(dateMatch[1]), Number(dateMatch[2]), Number(dateMatch[3])];
  const [hours, minutes] = [Number(timeMatch[1]), Number(timeMatch[2])];
  const parsed = new Date(year, month - 1, day, hours, minutes);

  const isRoundTrip =
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day &&
    parsed.getHours() === hours &&
    parsed.getMinutes() === minutes;

  return isRoundTrip ? parsed : null;
}

export function validateTrainedAt(date: string, time: string): string | null {
  if (date.trim().length === 0 || time.trim().length === 0) {
    return "La fecha y la hora son obligatorias";
  }
  return parseTrainedAt(date, time) ? null : "Usa el formato AAAA-MM-DD y HH:mm";
}

function isScrambleComplete(scramble: ScrambleDraft): boolean {
  return scramble.position !== null && scramble.result !== null;
}

// "Publicar" se deshabilita si falta algún dato obligatorio (F02, casos de error).
export function isLogFormValid(form: LogFormState): boolean {
  return (
    validateTrainedAt(form.date, form.time) === null &&
    form.modality !== null &&
    form.scrambles.every(isScrambleComplete)
  );
}

// Construye el payload del backend. Devuelve null si el formulario no es válido.
export function buildLogPayload(form: LogFormState): CreateLogPayload | null {
  const trainedAt = parseTrainedAt(form.date, form.time);
  if (!trainedAt || form.modality === null) {
    return null;
  }

  const scrambles: CreateLogPayload["scrambles"] = [];
  for (const scramble of form.scrambles) {
    if (scramble.position === null || scramble.result === null) {
      return null;
    }
    scrambles.push({
      position: scramble.position,
      technique: scramble.technique,
      result: scramble.result,
    });
  }

  const location = form.location.trim();
  const note = form.note.trim();

  return {
    trainedAt: trainedAt.toISOString(),
    modality: form.modality,
    location: location.length > 0 ? location : null,
    satisfaction: form.satisfaction,
    note: note.length > 0 ? note : null,
    scrambles,
  };
}
