/**
 * DATOS GENERALES DEL SITIO
 * ---------------------------------------------------------------------------
 * Edite aquí los datos de contacto y las cifras. Los campos marcados con
 * "REEMPLAZAR" (o vacíos) no se muestran en el sitio hasta que los complete.
 */

export const site = {
  legalName: 'Benítez Consulting Group, S.A.S.',
  name: 'Benítez Consulting Group',
  tagline: 'Convertimos conocimiento especializado en decisiones acertadas.',
  description:
    'Consultoría científica y tecnológica en Ciudad de México: ingeniería y materiales, asesoramiento científico, asesoramiento tecnológico e ingenieril, y formación académica.',
  year: 2026,

  // ← DATOS DE CONTACTO: complete estos marcadores ----------------------------
  contact: {
    email: 'jorge.benitezma93@gmail.com', // ← correo de contacto (público en el sitio)
    whatsapp: '525610254183', // ← número con lada país, solo dígitos
    whatsappDisplay: '+52 56 1025 4183',
    linkedin: '', // ← URL completa del perfil o página de empresa
    city: 'Ciudad de México',
    hours: 'Lunes a viernes, 9:00 a 18:00 h',
    // No se publica dirección física.
  },

  // Cifras estructurales (no son resultados de clientes). Edite o elimine.
  stats: [
    // "líneas de práctica" se calcula automáticamente desde src/data/areas.ts
    { value: 4, label: 'fases por proyecto' },
    { value: 5, label: 'principios de trabajo' },
  ],

  founder: {
    name: 'Dr. Jorge Alejandro Benítez Martínez',
    role: 'Fundador y director',
    bio: 'Doctor en Ciencia de Materiales, investigador con publicaciones en revistas indexadas (JCR/Scopus), docente universitario en ingeniería de materiales.',
    photo: '/img/fundador.jpg', // ← coloque la fotografía en public/img/fundador.jpg
  },
};

/** Un dato está "pendiente" si está vacío o contiene REEMPLAZAR. */
export const isSet = (v: string | undefined | null): v is string => !!v && !v.toUpperCase().includes('REEMPLAZAR');

export const navLinks = [
  { label: 'Áreas', href: '#areas' },
  { label: 'Método', href: '#metodo' },
  { label: 'Clientes', href: '#clientes' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Contacto', href: '#contacto' },
];
