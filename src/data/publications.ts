/**
 * PERFIL ACADÉMICO Y PUBLICACIONES
 * Fuentes: registro público de ORCID (0000-0003-2316-6946), perfil de Google Scholar y
 * repositorio de tesis de la UNAM, consultados el 19-oct-2026. `publications` son
 * artículos de revista con DOI verificado; `otherWorks` son tesis (con su enlace al
 * repositorio institucional). Para agregar o quitar elementos, edite estas listas.
 */
export const profiles = {
  orcid: 'https://orcid.org/0000-0003-2316-6946',
  scholar: 'https://scholar.google.com/citations?user=DdNML84AAAAJ&hl=es',
};

export const education = [
  'Doctorado en Ciencia e Ingeniería de Materiales — Instituto de Investigaciones en Materiales, UNAM (2023)',
  'Maestría en Ciencias e Ingeniería de Materiales — Instituto de Investigaciones en Materiales, UNAM (2019)',
];

export interface Publication {
  title: string;
  journal: string;
  year: number;
  doi: string;
}

export const publications: Publication[] = [
  {
    title: 'Quantitative and objective full-field strain measurements of healthy human skin during distal upper extremity range of motion',
    journal: 'Ingeniería Investigación y Tecnología',
    year: 2025,
    doi: '10.22201/fi.25940732e.2025.26.4.025',
  },
  {
    title: 'Sponge shape semi-interpenetrating polymeric networks based on PDMS/CS/PVA/GEN to capture an azo dye',
    journal: 'Journal of Materials Science',
    year: 2025,
    doi: '10.1007/s10853-025-11487-0',
  },
  {
    title: 'Redes poliméricas semi-interpenetradas: una alternativa atractiva en la ingeniería de tejidos y en la remediación ambiental',
    journal: 'Materiales Avanzados',
    year: 2024,
    doi: '10.22201/iim.rma.2024.41.109',
  },
  {
    title: 'Electrospinning Lysine-Polypeptide Copolymers: Creating Microfiber Meshes for Biomedical Applications',
    journal: 'ACS Applied Polymer Materials',
    year: 2024,
    doi: '10.1021/acsapm.4c00344',
  },
  {
    title: "Experimental and numerical characterization of a flexible strain sensor based on polydimethylsiloxane polymeric network and MWCNT's",
    journal: 'Journal of Polymer Research',
    year: 2024,
    doi: '10.1007/s10965-024-04048-7',
  },
  {
    title: 'Subcutaneous Application of a Gelatin/Hyaluronic Acid Hydrogel Induces the Production of Skin Extracellular Matrix',
    journal: 'Polymers',
    year: 2024,
    doi: '10.3390/polym16050573',
  },
  {
    title: 'Physicochemical characterization and biological response of PDMS/CS/PVA/GEN semi-interpenetrating networks as a function of CS/PVA/GEN ratio for tissue engineering',
    journal: 'Applied Physics A',
    year: 2023,
    doi: '10.1007/s00339-023-06821-9',
  },
  {
    title: 'Influence of Genipin and Multi-walled Carbon Nanotubes on the Dye Capture Response of CS/PVA Hybrid Hydrogels',
    journal: 'Journal of Polymers and the Environment',
    year: 2022,
    doi: '10.1007/s10924-022-02534-x',
  },
  {
    title: 'Photomechanical Polymer Nanocomposites for Drug Delivery Devices',
    journal: 'Molecules',
    year: 2021,
    doi: '10.3390/molecules26175376',
  },
  {
    title: 'Semi-interpenetrating polymeric networks based on poly(dimethylsiloxane)-chitosan-poly(vinyl alcohol) crosslinked with genipin with possible use in biomedical applications',
    journal: 'Journal of Materials Science',
    year: 2021,
    doi: '10.1007/s10853-020-05683-3',
  },
];

export interface OtherWork {
  title: string;
  kind: string;
  institution: string;
  year: number;
  url: string;
}

/** Otros trabajos: tesis, con enlace al repositorio institucional de la UNAM. */
export const otherWorks: OtherWork[] = [
  {
    title:
      'Síntesis y caracterización de redes poliméricas semi-interpenetradas basadas en poli(dimetilsiloxano)/quitosano/poli(alcohol vinílico) entrecruzadas con genipin para emular el comportamiento mecánico de la piel humana',
    kind: 'Tesis de doctorado',
    institution: 'Posgrado en Ciencia e Ingeniería de Materiales, UNAM',
    year: 2023,
    url: 'https://hdl.handle.net/20.500.14330/TES01000849312',
  },
  {
    title:
      'Síntesis y caracterización de membranas poliméricas basadas en poli(dimetilsiloxano)/poli(alcohol vinílico) entrecruzadas con genipin y glutaraldehído',
    kind: 'Tesis de maestría',
    institution: 'Posgrado en Ciencia e Ingeniería de Materiales, UNAM',
    year: 2019,
    url: 'https://hdl.handle.net/20.500.14330/TES01000790584',
  },
  {
    title: 'Medición de la deformación en piel humana utilizando correlación de imágenes digitales',
    kind: 'Tesis de licenciatura (con J. D. López Lugo)',
    institution: 'Facultad de Ingeniería, UNAM',
    year: 2017,
    url: 'https://hdl.handle.net/20.500.14330/TES01000758846',
  },
];
