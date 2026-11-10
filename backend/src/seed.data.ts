import type { Modality, ScrambleResult } from "./generated/prisma/client";
import type { PositionName, TechniqueName } from "./ontology";

// Datos de demostración para la presentación del MVP (ver seed.ts).
// Posiciones y técnicas se tipan con los nombres de docs/ONTOLOGY.md (src/ontology): un nombre
// que no exista en la ontología no compila.

export interface ScrambleSeed {
  position: PositionName;
  technique: TechniqueName | null;
  result: ScrambleResult;
}

export interface LogSeed {
  hoursAgo: number; // cuántas horas antes de ejecutar el seed se entrenó (fechas siempre recientes)
  modality: Modality;
  location: string | null;
  satisfaction: number | null; // 1 a 5
  note: string | null;
  scrambles: ScrambleSeed[];
}

export interface UserSeed {
  name: string;
  email: string;
  follows: string[]; // correos de los usuarios a los que sigue
  logs: LogSeed[];
}

// Contraseña común de todas las cuentas de demostración (mínimo 6 caracteres, F01).
export const SEED_PASSWORD = "grappling123";

// Atajos: A favor / Fallido / En contra.
const OK: ScrambleResult = "IN_FAVOR";
const FAIL: ScrambleResult = "FAILED";
const LOSS: ScrambleResult = "AGAINST";

function s(position: PositionName, technique: TechniqueName | null, result: ScrambleResult): ScrambleSeed {
  return { position, technique, result };
}

const NOMADA = "Academia Nómada BJJ";
const ATLAS = "Atlas Jiu-Jitsu";
const IRON_MAT = "Iron Mat Club";
const KAIZEN = "Dojo Kaizen";
const CASA = "Casa del Grappling";
const TATAMI = "Tatami Norte";

export const SEED_USERS: UserSeed[] = [
  {
    name: "Carlos Gracie",
    email: "carlos.gracie@example.com",
    follows: ["sofia.rodriguez@example.com", "mateo.silva@example.com", "valentina.cruz@example.com"],
    logs: [
      {
        hoursAgo: 5.5,
        modality: "GI",
        location: NOMADA,
        satisfaction: 5,
        note: "Clase de fundamentos centrada en pasaje de guardia. Cerramos con 5 rondas de sparring y me sentí muy fluido.",
        scrambles: [
          s("Open Guard", "Torreando", OK),
          s("Closed Guard", "Triangle", OK),
          s("Half Guard", "Guillotine", FAIL),
        ],
      },
      {
        hoursAgo: 76,
        modality: "GI",
        location: NOMADA,
        satisfaction: 4,
        note: "Sparring ligero con los cinturones azules. Buen control de distancia, pero me costó sostener la presión desde arriba.",
        scrambles: [s("Side Control (Top)", "Kimura", OK), s("Mount (Top)", "Armbar", FAIL)],
      },
      {
        hoursAgo: 200,
        modality: "GI",
        location: NOMADA,
        satisfaction: 5,
        note: "Open mat dominical. Repasé la raspada de tijera hasta que salió casi automática.",
        scrambles: [
          s("Closed Guard", "Scissor Sweep", OK),
          s("Closed Guard", "Hip Bump Sweep", OK),
          s("Standing", "Single Leg", OK),
        ],
      },
    ],
  },
  {
    name: "Sofia 'The Anaconda' Rodriguez",
    email: "sofia.rodriguez@example.com",
    follows: ["carlos.gracie@example.com", "camila.ortega@example.com", "joaquin.vega@example.com"],
    logs: [
      {
        hoursAgo: 3.5,
        modality: "NO_GI",
        location: ATLAS,
        satisfaction: 5,
        note: "Entreno de No Gi puro de cadenas: guillotinas y control de espalda. Las rondas con Mateo estuvieron intensas.",
        scrambles: [
          s("Standing", "Guillotine", OK),
          s("Back Control", "Rear Naked Choke", OK),
          s("Open Guard", "Guard Retention", OK),
          s("Side Control (Bottom)", "Shrimp Escape", FAIL),
        ],
      },
      {
        hoursAgo: 30,
        modality: "GI",
        location: ATLAS,
        satisfaction: 4,
        note: "Drilling de triángulo desde guardia cerrada, 20 repeticiones por lado. Me falta ajustar el ángulo cuando el rival postura.",
        scrambles: [s("Closed Guard", "Triangle", OK), s("Closed Guard", "Armbar", FAIL)],
      },
      {
        hoursAgo: 124,
        modality: "NO_GI",
        location: ATLAS,
        satisfaction: 5,
        note: "Competencia interna del gimnasio, tres victorias por sumisión. El rear naked choke sigue siendo mi bandera.",
        scrambles: [
          s("Back Control", "Rear Naked Choke", OK),
          s("Mount (Top)", "Armbar", OK),
          s("Half Guard", "Guillotine", OK),
        ],
      },
      {
        hoursAgo: 290,
        modality: "GI",
        location: ATLAS,
        satisfaction: 3,
        note: "Día pesado. Me pasaron la guardia varias veces, toca mejorar la retención con las caderas.",
        scrambles: [s("Open Guard", "Guard Retention", LOSS), s("De La Riva", "Guard Retention", FAIL)],
      },
    ],
  },
  {
    name: "Mateo Silva",
    email: "mateo.silva@example.com",
    follows: ["carlos.gracie@example.com", "sofia.rodriguez@example.com"],
    logs: [
      {
        hoursAgo: 8,
        modality: "NO_GI",
        location: IRON_MAT,
        satisfaction: 4,
        note: "Clase de leg locks. Trabajamos entradas al heel hook desde guardia abierta, cuidando mucho la seguridad del compañero.",
        scrambles: [s("Open Guard", "Heel Hook", OK), s("De La Riva", "Heel Hook", FAIL)],
      },
      {
        hoursAgo: 100,
        modality: "NO_GI",
        location: IRON_MAT,
        satisfaction: 5,
        note: "Sparring sin kimono a ritmo alto. Saqué dos derribos y pasé a control lateral.",
        scrambles: [
          s("Standing", "Double Leg", OK),
          s("Standing", "Single Leg", OK),
          s("Side Control (Top)", "Kimura", FAIL),
        ],
      },
      {
        hoursAgo: 250,
        modality: "NO_GI",
        location: IRON_MAT,
        satisfaction: 3,
        note: "Me cansé rápido, el cardio está bajo. El escape de montada con puente y giro funcionó bien.",
        scrambles: [s("Mount (Bottom)", "Bridge & Roll", OK), s("Side Control (Bottom)", "Shrimp Escape", FAIL)],
      },
    ],
  },
  {
    name: "Valentina Cruz",
    email: "valentina.cruz@example.com",
    follows: ["sofia.rodriguez@example.com", "isabela.duarte@example.com"],
    logs: [
      {
        hoursAgo: 14,
        modality: "GI",
        location: KAIZEN,
        satisfaction: 4,
        note: "Clase de pasaje con body lock y presión de cadera. Me gusta cómo queda el control antes de abrir la guardia.",
        scrambles: [s("Open Guard", "Body Lock", OK), s("Open Guard", "Knee Slice", OK)],
      },
      {
        hoursAgo: 170,
        modality: "GI",
        location: KAIZEN,
        satisfaction: 5,
        note: "Seminario con invitado: detalles de la raspada de flor. Salió mucho mejor al final de la sesión.",
        scrambles: [
          s("Closed Guard", "Flower Sweep", OK),
          s("Closed Guard", "Scissor Sweep", FAIL),
          s("Closed Guard", "Triangle", LOSS),
        ],
      },
    ],
  },
  {
    name: "Diego 'El Toro' Ramírez",
    email: "diego.ramirez@example.com",
    follows: ["mateo.silva@example.com"],
    logs: [
      {
        hoursAgo: 11,
        modality: "JUDO",
        location: KAIZEN,
        satisfaction: 5,
        note: "Randori de judo, tres rondas de cinco minutos. Los lanzamientos de cadera salen cada vez más limpios.",
        scrambles: [
          s("Standing", "Judo Throw", OK),
          s("Standing", "Judo Throw", OK),
          s("Standing", "Judo Throw", FAIL),
          s("Standing", "Single Leg", LOSS),
        ],
      },
      {
        hoursAgo: 60,
        modality: "JUDO",
        location: KAIZEN,
        satisfaction: 4,
        note: "Uchikomi y nage-komi con el equipo de competencia. Terminé con los agarres cansados.",
        scrambles: [s("Standing", "Judo Throw", OK), s("Standing", "Double Leg", FAIL)],
      },
      {
        hoursAgo: 150,
        modality: "GI",
        location: KAIZEN,
        satisfaction: 4,
        note: "Del judo al BJJ: transición del derribo directo al control lateral. Aún me cuesta fijar el brazo.",
        scrambles: [
          s("Standing", "Judo Throw", OK),
          s("Side Control (Top)", "Kimura", OK),
          s("Side Control (Top)", "Armbar", FAIL),
        ],
      },
      {
        hoursAgo: 310,
        modality: "JUDO",
        location: KAIZEN,
        satisfaction: 3,
        note: "Práctica ligera por una molestia en el hombro. Solo trabajé caídas y desplazamientos.",
        scrambles: [s("Standing", "Judo Throw", FAIL)],
      },
    ],
  },
  {
    name: "Camila Ortega",
    email: "camila.ortega@example.com",
    follows: ["sofia.rodriguez@example.com", "carlos.gracie@example.com"],
    logs: [
      {
        hoursAgo: 20,
        modality: "GI",
        location: CASA,
        satisfaction: 5,
        note: "Clase de media guardia. Aprendí a recuperar la guardia cerrada cuando me pasan el codo.",
        scrambles: [
          s("Half Guard", "Kimura", OK),
          s("Half Guard", "Guard Retention", OK),
          s("Side Control (Bottom)", "Shrimp Escape", OK),
        ],
      },
      {
        hoursAgo: 220,
        modality: "GI",
        location: CASA,
        satisfaction: null,
        note: "Rolling con el grupo avanzado. Me atraparon en una montada tonta, lección aprendida.",
        scrambles: [s("Closed Guard", "Armbar", OK), s("Mount (Bottom)", "Bridge & Roll", LOSS)],
      },
    ],
  },
  {
    name: "Lucas Barreto",
    email: "lucas.barreto@example.com",
    follows: ["carlos.gracie@example.com"],
    logs: [
      {
        hoursAgo: 26,
        modality: "SAMBO",
        location: TATAMI,
        satisfaction: 4,
        note: "Entrenamiento de sambo: derribos y luxaciones. El kimura desde arriba me salió de lujo.",
        scrambles: [
          s("Standing", "Single Leg", OK),
          s("Side Control (Top)", "Kimura", OK),
          s("Standing", "Double Leg", FAIL),
        ],
      },
      {
        hoursAgo: 110,
        modality: "NO_GI",
        location: TATAMI,
        satisfaction: 4,
        note: "Clase de heel hooks y control de espalda. Agarre firme pero sin pasarme de fuerza.",
        scrambles: [s("Open Guard", "Heel Hook", OK), s("Back Control", "Rear Naked Choke", FAIL)],
      },
      {
        hoursAgo: 270,
        modality: "SAMBO",
        location: TATAMI,
        satisfaction: 5,
        note: "Sesión de sambo con el equipo, buenas rondas de lucha de pie. Cierre con rolling suave.",
        scrambles: [s("Standing", "Single Leg", OK), s("Standing", "Judo Throw", OK)],
      },
    ],
  },
  {
    name: "Isabela Duarte",
    email: "isabela.duarte@example.com",
    follows: ["valentina.cruz@example.com", "sofia.rodriguez@example.com"],
    logs: [
      {
        hoursAgo: 32,
        modality: "GI",
        location: NOMADA,
        satisfaction: 5,
        note: "Clase de competencia. Mucho énfasis en pasar la guardia rápido y asegurar el control antes de atacar.",
        scrambles: [
          s("Open Guard", "Torreando", OK),
          s("Side Control (Top)", "Armbar", OK),
          s("Mount (Top)", "Armbar", OK),
        ],
      },
      {
        hoursAgo: 180,
        modality: "GI",
        location: NOMADA,
        satisfaction: 4,
        note: "Sparring con Carlos, aprendí muchísimo viendo cómo gestiona la distancia.",
        scrambles: [
          s("Open Guard", "Body Lock", FAIL),
          s("Half Guard", "Guillotine", LOSS),
          s("Closed Guard", "Hip Bump Sweep", OK),
        ],
      },
    ],
  },
  {
    name: "Andrés Palacios",
    email: "andres.palacios@example.com",
    follows: ["diego.ramirez@example.com"],
    logs: [
      {
        hoursAgo: 41,
        modality: "NO_GI",
        location: IRON_MAT,
        satisfaction: 3,
        note: "Clase para principiantes avanzados, enfoque en escapes. Repetí la camaronera hasta el cansancio.",
        scrambles: [s("Side Control (Bottom)", "Shrimp Escape", OK), s("Mount (Bottom)", "Bridge & Roll", FAIL)],
      },
      {
        hoursAgo: 130,
        modality: "GI",
        location: IRON_MAT,
        satisfaction: null,
        note: "Primer torneo interno, perdí en semifinales pero salí con ganas de seguir.",
        scrambles: [
          s("Standing", "Double Leg", OK),
          s("Closed Guard", "Triangle", FAIL),
          s("Back Control", "Rear Naked Choke", LOSS),
        ],
      },
      {
        hoursAgo: 300,
        modality: "NO_GI",
        location: IRON_MAT,
        satisfaction: 4,
        note: "Clase de guardia abierta: retención con las piernas y pasajes contra el piso.",
        scrambles: [s("Open Guard", "Guard Retention", OK), s("Open Guard", "Knee Slice", FAIL)],
      },
    ],
  },
  {
    name: "Joaquín 'Heel Hook' Vega",
    email: "joaquin.vega@example.com",
    follows: ["sofia.rodriguez@example.com", "mateo.silva@example.com"],
    logs: [
      {
        hoursAgo: 17,
        modality: "NO_GI",
        location: IRON_MAT,
        satisfaction: 5,
        note: "Seminario de leg locks: entradas, controles y salidas seguras. Mi compañero salió ileso, que es lo importante.",
        scrambles: [
          s("De La Riva", "Heel Hook", OK),
          s("Open Guard", "Heel Hook", OK),
          s("Open Guard", "Guard Retention", OK),
        ],
      },
      {
        hoursAgo: 90,
        modality: "NO_GI",
        location: IRON_MAT,
        satisfaction: 4,
        note: "Sparring con Mateo y Sofia, dos horas de rolling sin parar. Me atraparon con una guillotina estando de pie.",
        scrambles: [s("Standing", "Guillotine", LOSS), s("Half Guard", "Kimura", OK)],
      },
      {
        hoursAgo: 240,
        modality: "GI",
        location: IRON_MAT,
        satisfaction: 4,
        note: "Clase en kimono para variar. Cuesta menos el cardio pero sufro con los agarres.",
        scrambles: [s("Open Guard", "Flower Sweep", OK), s("Closed Guard", "Armbar", FAIL)],
      },
    ],
  },
];
