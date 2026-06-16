export interface Employee {
  id: string; // ID único interno
  empresa: string;
  nombre: string;
  puesto: string;
  tipoSangre: string;
  nss: string;
  fotoUrl?: string; // URL.createObjectURL para visualización rápida
}

export interface BadgeConfig {
  nombreEmpresaDefecto: string;
  colorPrincipal: string; // Color principal de bandas y acentos (Hex)
  colorSecundario: string; // Color secundario (Hex)
  colorTextoBanda: string; // Color del texto sobre la banda principal (generalmente #ffffff o #000000)
  logoUrl?: string; // Logotipo corporativo general (Base64 u Object URL)
  tipografia: 'Inter' | 'Roboto' | 'Arial' | 'Playfair';
  formatoHoja: 'Letter' | 'A4';
  mostrarBordedeCorte: boolean;
  estiloDiseno: 'moderno' | 'clasico' | 'minimalista' | 'tech';
}
