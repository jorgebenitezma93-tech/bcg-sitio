/**
 * ÁREAS DE PRÁCTICA (primera versión del sitio)
 * Los tres primeros nodos coinciden con los tres nodos de cobre del logo
 * (vértices alternados del hexágono). La cuarta línea es el centro.
 * `at` es la posición del nodo dentro del viewBox 120 × 120 del logo.
 * `labelLines` es el texto corto junto al nodo en la explicación del logo.
 *
 * Líneas reservadas para una siguiente etapa (no se publican): ver `futureAreas`.
 */
export interface Area {
  id: string;
  name: string;
  blurb: string;
  services: string[];
  at: [number, number];
  labelLines: string[];
}

export const areas: Area[] = [
  {
    id: 'ingenieria-materiales',
    name: 'Ingeniería y Materiales',
    blurb: 'Qué falló, por qué y cómo evitar que se repita.',
    services: [
      'Selección de materiales',
      'Análisis de falla',
      'Caracterización bajo normas ASTM',
      'Caracterización de materiales: mecánica, física y química',
      'Materiales compuestos y polímeros',
    ],
    at: [33, 13.23],
    labelLines: ['Ingeniería y', 'Materiales'],
  },
  {
    id: 'asesoramiento-cientifico',
    name: 'Asesoramiento científico',
    blurb: 'Criterio científico para respaldar una decisión.',
    services: [
      'Dictámenes y opiniones técnico-científicas',
      'Diseño de protocolos y metodología experimental',
      'Interpretación de resultados de ensayos',
      'Revisión de literatura y estado del arte',
    ],
    at: [114, 60],
    labelLines: ['Asesoramiento', 'científico'],
  },
  {
    id: 'asesoramiento-tecnologico-ingenieril',
    name: 'Asesoramiento tecnológico e ingenieril',
    blurb: 'De la especificación a la implementación, con sustento técnico.',
    services: [
      'Evaluación de tecnologías y procesos',
      'Especificación técnica de materiales y componentes',
      'Apoyo en diseño y manufactura (CAD y manufactura asistida por computadora)',
      'Acompañamiento durante la implementación',
      'Servicios digitales: sitios web, prototipos interactivos y accesibilidad para instituciones',
    ],
    at: [33, 106.77],
    labelLines: ['Asesoramiento', 'tecnológico e', 'ingenieril'],
  },
  {
    id: 'academia-formacion',
    name: 'Academia y Formación',
    blurb: 'El centro de la estructura: conocimiento que se transmite.',
    services: [
      'Capacitación técnica especializada',
      'Diseño curricular',
      'Asesoría en investigación y publicación científica',
    ],
    at: [60, 60],
    labelLines: ['Academia y', 'Formación'],
  },
];

/** Líneas que se abrirán en una etapa posterior. NO se muestran en el sitio. */
export const futureAreas = [
  {
    name: 'Análisis Económico y Financiero',
    services: ['Factibilidad de proyectos', 'Evaluación económica', 'Análisis de datos para la toma de decisiones'],
  },
  {
    name: 'Economía y Estrategia',
    services: ['Estudios sectoriales', 'Análisis de mercado', 'Sustento técnico-económico de inversiones'],
  },
];
