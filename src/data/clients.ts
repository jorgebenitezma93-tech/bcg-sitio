/**
 * CLIENTES E INSTITUCIONES
 * ---------------------------------------------------------------------------
 * Para agregar un cliente, copie un bloque { ... } y complete los campos.
 * Para quitarlo, bórrelo o cambie `enabled` a false.
 *
 *   name     Nombre de la institución (se muestra como wordmark en Spectral)
 *   sector   Sector (ej.: "Educación superior")
 *   project  Tipo de proyecto (se ve al voltear la tarjeta)
 *   logo     OPCIONAL. Ruta a un logotipo en /public/img/clientes/… — úselo solo
 *            si cuenta con autorización escrita de la institución.
 *   enabled  false = no se muestra en el sitio
 */
export interface Client {
  name: string;
  sector: string;
  project: string;
  logo?: string;
  /** OPCIONAL. Lista corta (materias, entregables…) que se muestra al voltear la tarjeta. */
  topics?: string[];
  enabled?: boolean;
}

export const clients: Client[] = [
  {
    name: 'Universidad Anáhuac México',
    sector: 'Educación superior',
    project: 'Formación académica y docencia en ciencia e ingeniería de materiales',
    topics: ['Diseño CAD', 'Mecánica de materiales', 'Manufactura asistida por computadora'],
  },
  {
    name: 'CAMI Xochimilco',
    sector: 'Salud',
    project:
      'Rediseño del sitio web, prototipo interactivo, guía de estilo, revisión de accesibilidad WCAG 2.1 AA y diseño de la tarjeta de recompensa',
  },
  // Plantilla para el siguiente cliente (cambie enabled a true al completarla):
  {
    name: '[Agregar cliente]',
    sector: '[Sector]',
    project: '[Proyecto]',
    enabled: false,
  },
];
