// DeepLux shared constants

export const MX_STATES = [
  { value: 'AGS', label: 'Aguascalientes' },
  { value: 'BCN', label: 'Baja California' },
  { value: 'BCS', label: 'Baja California Sur' },
  { value: 'CAM', label: 'Campeche' },
  { value: 'CHP', label: 'Chiapas' },
  { value: 'CHI', label: 'Chihuahua' },
  { value: 'CDMX', label: 'Ciudad de México' },
  { value: 'COA', label: 'Coahuila' },
  { value: 'COL', label: 'Colima' },
  { value: 'DUR', label: 'Durango' },
  { value: 'MEX', label: 'Estado de México' },
  { value: 'GTO', label: 'Guanajuato' },
  { value: 'GRO', label: 'Guerrero' },
  { value: 'HGO', label: 'Hidalgo' },
  { value: 'JAL', label: 'Jalisco' },
  { value: 'MIC', label: 'Michoacán' },
  { value: 'MOR', label: 'Morelos' },
  { value: 'NAY', label: 'Nayarit' },
  { value: 'NLE', label: 'Nuevo León' },
  { value: 'OAX', label: 'Oaxaca' },
  { value: 'PUE', label: 'Puebla' },
  { value: 'QRO', label: 'Querétaro' },
  { value: 'ROO', label: 'Quintana Roo' },
  { value: 'SLP', label: 'San Luis Potosí' },
  { value: 'SIN', label: 'Sinaloa' },
  { value: 'SON', label: 'Sonora' },
  { value: 'TAB', label: 'Tabasco' },
  { value: 'TAM', label: 'Tamaulipas' },
  { value: 'TLX', label: 'Tlaxcala' },
  { value: 'VER', label: 'Veracruz' },
  { value: 'YUC', label: 'Yucatán' },
  { value: 'ZAC', label: 'Zacatecas' },
] as const;

export const SAT_REGIMES = [
  { value: '601', label: '601 - General de Ley Personas Morales' },
  { value: '603', label: '603 - Personas Morales con Fines no Lucrativos' },
  { value: '605', label: '605 - Sueldos y Salarios e Ingresos Asimilados' },
  { value: '606', label: '606 - Arrendamiento' },
  { value: '607', label: '607 - Régimen de Enajenación o Adquisición de Bienes' },
  { value: '608', label: '608 - Demás ingresos' },
  { value: '612', label: '612 - Personas Físicas con Actividades Empresariales' },
  { value: '616', label: '616 - Sin obligaciones fiscales' },
  { value: '621', label: '621 - Incorporación Fiscal' },
  { value: '625', label: '625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas' },
  { value: '626', label: '626 - Régimen Simplificado de Confianza (RESICO)' },
] as const;

export const SPECIALTIES = [
  'Medicina Interna',
  'Cardiología',
  'Neurología',
  'Neurocirugía',
  'Cirugía General',
  'Cirugía Plástica y Reconstructiva',
  'Dermatología',
  'Endocrinología',
  'Gastroenterología',
  'Geriatría',
  'Ginecología y Obstetricia',
  'Hematología',
  'Infectología',
  'Medicina de Urgencias',
  'Medicina Familiar',
  'Medicina Física y Rehabilitación',
  'Nefrología',
  'Neumología',
  'Oftalmología',
  'Oncología Médica',
  'Ortopedia y Traumatología',
  'Otorrinolaringología',
  'Pediatría',
  'Psiquiatría',
  'Radiología',
  'Reumatología',
  'Urología',
  'Otra',
] as const;

export const USER_TYPE_LABELS: Record<string, string> = {
  super_admin: 'Super Administrador (CEO)',
  specialist: 'Especialista Médico',
  general_physician: 'Médico General / Internista',
  resident: 'Médico Residente',
  intern: 'Pasante de Servicio Social',
  student: 'Estudiante de Medicina',
  researcher: 'Investigador',
  physiotherapist: 'Fisioterapeuta / Rehabilitador',
  clinic_admin: 'Administrador de Clínica',
  other: 'Otro Profesional de la Salud',
};

export const TRUST_LEVEL_LABELS: Record<number, string> = {
  0: 'Sin verificar',
  1: 'Email confirmado',
  2: 'Documentos enviados',
  3: 'Verificado',
};

export const PLAN_BADGES: Record<string, string> = {
  libre: 'Libre',
  'profesional-basico': 'Profesional',
  'suite-medica': 'Suite Médica',
  investigador: 'Investigador',
  'clinica-starter': 'Clínica Starter',
  'clinica-pro': 'Clínica Pro',
  'clinica-enterprise': 'Enterprise',
};

// Regex validators for MX
export const RFC_REGEX = /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
export const CURP_REGEX = /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/;
export const CEDULA_REGEX = /^[0-9]{7,8}$/;
