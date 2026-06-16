import React, { useRef } from 'react';
import { Camera, ShieldAlert, Heart, User, Award } from 'lucide-react';
import { Employee, BadgeConfig } from '../types';

interface BadgePreviewProps {
  key?: string | number;
  employee: Employee;
  config: BadgeConfig;
  onPhotoUploaded?: (id: string, file: File) => void;
  className?: string;
  isPrintMode?: boolean; // Si es para imprimir, usa dimensiones físicas rígidas (cm)
}

export default function BadgePreview({
  employee,
  config,
  onPhotoUploaded,
  className = '',
  isPrintMode = false,
}: BadgePreviewProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    if (onPhotoUploaded) {
      photoInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onPhotoUploaded) {
      onPhotoUploaded(employee.id, e.target.files[0]);
    }
  };

  // Configuración de Tipografía
  const fontStyle = {
    fontFamily:
      config.tipografia === 'Playfair'
        ? '"Playfair Display", Georgia, serif'
        : config.tipografia === 'Inter'
        ? '"Inter", sans-serif'
        : 'Arial, sans-serif',
  };

  // Determinar los colores principales
  const primaryBg = { backgroundColor: config.colorPrincipal };
  const primaryText = { color: config.colorPrincipal };
  const secondaryText = { color: config.colorSecundario };
  const primaryBorder = { borderColor: config.colorPrincipal };

  // Renderizador de código de barras sintético para el estilo 'tech'
  const renderSyntheticBarcode = (seed: string) => {
    const barsCount = 28;
    const nssCleaned = seed.replace(/[^0-9]/g, '');
    const primeSeed = nssCleaned ? parseInt(nssCleaned.substring(0, 4)) || 1234 : 1234;
    
    return (
      <div className="flex items-end justify-center gap-[1px] h-6 w-full px-2 mt-1 opacity-80">
        {Array.from({ length: barsCount }).map((_, idx) => {
          // Generación de un patrón pseudo-aleatorio deterministic basado en NSS
          const val = Math.sin(primeSeed + idx) * 1000;
          const isWide = Math.floor(Math.abs(val)) % 3 === 0;
          const isExtraWide = Math.floor(Math.abs(val)) % 7 === 0;
          let barWidth = 'w-[1px]';
          if (isWide) barWidth = 'w-[2px]';
          if (isExtraWide) barWidth = 'w-[3px]';

          return (
            <div
              key={idx}
              className={`bg-gray-800 h-full ${barWidth}`}
              style={{ opacity: (Math.floor(Math.abs(val)) % 2 === 0) ? 1 : 0.2 }}
            />
          );
        })}
      </div>
    );
  };

  const renderLayout = () => {
    switch (config.estiloDiseno) {
      case 'clasico':
        return (
          <div className="h-full w-full flex flex-col justify-between bg-white overflow-hidden relative">
            {/* Cabecera Sólida */}
            <div className="h-16 flex flex-col items-center justify-center py-2 px-3 text-center" style={primaryBg}>
              {config.logoUrl ? (
                <img
                  src={config.logoUrl}
                  alt="Logo"
                  className="h-7 max-h-7 max-w-full object-contain mb-0.5 filter brightness-0 invert"
                  referrerPolicy="no-referrer"
                />
              ) : null}
              <span className="text-[10px] font-bold tracking-wider truncate uppercase text-white leading-tight w-full">
                {employee.empresa || config.nombreEmpresaDefecto}
              </span>
            </div>

            {/* Contenedor Medio */}
            <div className="flex-1 flex flex-col items-center justify-center px-3 py-1">
              {/* Foto */}
              <div
                onClick={handlePhotoClick}
                className={`w-24 h-24 rounded-lg overflow-hidden border-2 bg-gray-50 flex items-center justify-center relative group ${
                  onPhotoUploaded ? 'cursor-pointer' : ''
                }`}
                style={primaryBorder}
              >
                {employee.fotoUrl ? (
                  <img
                    src={employee.fotoUrl}
                    alt={employee.nombre}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center p-1.5 flex flex-col items-center justify-center">
                    <User className="w-8 h-8 text-gray-300" />
                    <span className="text-[8px] font-bold text-gray-400 uppercase mt-1">Cargar Foto</span>
                  </div>
                )}
                {onPhotoUploaded && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Datos de Empleado */}
              <div className="text-center mt-2.5 w-full">
                <h3 className="text-xs font-bold text-gray-900 leading-tight truncate px-1 uppercase" style={fontStyle}>
                  {employee.nombre || 'Nombre del Empleado'}
                </h3>
                <p className="text-[10px] font-medium mt-0.5" style={secondaryText}>
                  {employee.puesto || 'Puesto'}
                </p>
              </div>
            </div>

            {/* Banda Inferior Médica */}
            <div className="border-t border-gray-100 py-2 px-3 bg-gray-50 text-[9px] leading-tight flex flex-col gap-1">
              <div className="flex items-center justify-between text-gray-600">
                <span className="font-bold flex items-center gap-0.5">
                  <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500 shrink-0" />
                  SANGRE:
                </span>
                <span className="font-bold text-gray-800">{employee.tipoSangre || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span className="font-bold flex items-center gap-0.5">
                  <ShieldAlert className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
                  NSS:
                </span>
                <span className="font-mono text-gray-800">{employee.nss || 'N/A'}</span>
              </div>
            </div>
            {/* Línea inferior decorativa */}
            <div className="h-1" style={primaryBg} />
          </div>
        );

      case 'minimalista':
        return (
          <div className="h-full w-full flex flex-col justify-between bg-white p-3.5 overflow-hidden relative">
            {/* Cabecera Liviana */}
            <div className="flex flex-col items-center justify-center border-b border-gray-100 pb-2">
              {config.logoUrl ? (
                <img
                  src={config.logoUrl}
                  alt="Logo"
                  className="h-6 max-h-6 max-w-full object-contain mb-1"
                  referrerPolicy="no-referrer"
                />
              ) : null}
              <span className="text-[9px] font-bold tracking-widest text-slate-800 uppercase text-center truncate max-w-full">
                {employee.empresa || config.nombreEmpresaDefecto}
              </span>
            </div>

            {/* Foto Circular */}
            <div className="flex-1 flex flex-col items-center justify-center p-1">
              <div
                onClick={handlePhotoClick}
                className={`w-22 h-22 rounded-full overflow-hidden border bg-gray-50 flex items-center justify-center relative group ${
                  onPhotoUploaded ? 'cursor-pointer border-gray-200' : 'border-gray-100'
                }`}
              >
                {employee.fotoUrl ? (
                  <img
                    src={employee.fotoUrl}
                    alt={employee.nombre}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center p-1 flex flex-col items-center justify-center">
                    <User className="w-6 h-6 text-gray-300" />
                    <span className="text-[7px] text-gray-400 mt-1 font-semibold uppercase">Foto</span>
                  </div>
                )}
                {onPhotoUploaded && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Info Empleado */}
              <div className="text-center mt-3 w-full">
                <h3 className="text-[11px] font-bold text-slate-950 leading-tight uppercase tracking-tight" style={fontStyle}>
                  {employee.nombre || 'Nombre'}
                </h3>
                <div className="w-4 h-[1.5px] mx-auto my-1 bg-gray-200" style={primaryBg} />
                <p className="text-[9px] font-semibold text-slate-500 uppercase">
                  {employee.puesto || 'Puesto'}
                </p>
              </div>
            </div>

            {/* Datos mínimos al pie */}
            <div className="border-t border-slate-100 pt-2 text-[8px] flex items-center justify-between text-slate-500 font-mono">
              <div>
                <span className="block text-[7px] text-slate-400 uppercase">RH Sangre</span>
                <span className="font-bold text-slate-800">{employee.tipoSangre || 'N/A'}</span>
              </div>
              <div className="text-right">
                <span className="block text-[7px] text-slate-400 uppercase">Afil IMSS/NSS</span>
                <span className="text-slate-800">{employee.nss || 'N/A'}</span>
              </div>
            </div>
          </div>
        );

      case 'tech':
        return (
          <div className="h-full w-full flex flex-col justify-between bg-slate-900 text-slate-100 overflow-hidden relative border-t-4" style={primaryBorder}>
            {/* Grid de Fondo Decorativo */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:10px_10px]" />
            
            {/* Cabecera Digital */}
            <div className="h-12 flex flex-col items-center justify-center px-3 pt-2 pb-1 z-10">
              {config.logoUrl ? (
                <img
                  src={config.logoUrl}
                  alt="Logo"
                  className="h-5 max-h-5 max-w-full object-contain filter brightness-0 invert"
                  referrerPolicy="no-referrer"
                />
              ) : null}
              <span className="text-[8px] font-mono tracking-widest text-emerald-400 uppercase truncate text-center w-full mt-0.5">
                // SYSTEM: {employee.empresa || config.nombreEmpresaDefecto}
              </span>
            </div>

            {/* Foto Encapsulada en Caja Tech */}
            <div className="flex-1 flex flex-col items-center justify-center p-2 z-10">
              <div
                onClick={handlePhotoClick}
                className={`w-20 h-20 overflow-hidden bg-slate-950 flex items-center justify-center relative group border border-slate-705 ${
                  onPhotoUploaded ? 'cursor-pointer hover:border-emerald-500' : ''
                }`}
              >
                {/* Esquinas decorativas tech */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-emerald-400" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-emerald-400" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-emerald-400" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-emerald-400" />

                {employee.fotoUrl ? (
                  <img
                    src={employee.fotoUrl}
                    alt={employee.nombre}
                    className="w-[90%] h-[90%] object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center p-1 flex flex-col items-center justify-center">
                    <User className="w-7 h-7 text-emerald-500/60" />
                    <span className="text-[7px] font-mono text-emerald-400/80 mt-1 uppercase">UPLOAD_PIC</span>
                  </div>
                )}
                {onPhotoUploaded && (
                  <div className="absolute inset-0 bg-emerald-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="w-5 h-5 text-emerald-400" />
                  </div>
                )}
              </div>

              {/* Info Tech */}
              <div className="text-center mt-2.5 w-full">
                <h3 className="text-xs font-mono font-bold text-white truncate px-1 uppercase leading-none">
                  {employee.nombre || 'USER_ID_NAME'}
                </h3>
                <p className="text-[8px] font-mono text-emerald-400 uppercase mt-1 tracking-tight">
                  [{employee.puesto || 'OPERATOR_ROLE'}]
                </p>
              </div>
            </div>

            {/* Pie Tech con Código de barras y datos médicos */}
            <div className="bg-slate-950/90 py-2 px-3 border-t border-slate-800 z-10 select-none">
              <div className="grid grid-cols-2 gap-1 text-[8px] font-mono pb-1.5 border-b border-slate-800/60">
                <div className="flex items-center gap-1">
                  <span className="text-rose-500">RH:</span>
                  <span className="text-slate-100 font-bold">{employee.tipoSangre || 'N/A'}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">NSS:</span>{' '}
                  <span className="text-slate-200">{employee.nss || 'N/A'}</span>
                </div>
              </div>
              {/* Código de barras basado en NSS */}
              <div className="bg-white rounded-[2px] py-1 mt-1 text-center flex flex-col items-center justify-center">
                {renderSyntheticBarcode(employee.nss || employee.nombre)}
                <span className="text-[6.5px] font-mono text-gray-600 scale-75 leading-none block -mt-0.5">
                  ID-{employee.nss ? employee.nss.substring(0, 11) : '00000000000'}
                </span>
              </div>
            </div>
          </div>
        );

      case 'moderno':
      default:
        // Moderno con curvas estilizadas y diseño moderno
        return (
          <div className="h-full w-full flex flex-col justify-between bg-white overflow-hidden relative">
            {/* Elemento de Fondo Estilizado */}
            <div
              className="absolute top-0 inset-x-0 h-28 transform -skew-y-12 origin-top-left -mt-6 z-0 transition-colors duration-300"
              style={primaryBg}
            />

            {/* Cabecera */}
            <div className="h-14 flex flex-col items-center justify-center pt-2 px-3 text-center z-10 w-full">
              {config.logoUrl ? (
                <img
                  src={config.logoUrl}
                  alt="Logo"
                  className="h-6 max-h-6 max-w-full object-contain filter brightness-0 invert mb-px"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex items-center gap-1 text-white scale-90">
                  <Award className="w-3.5 h-3.5" />
                </div>
              )}
              <span className="text-[9px] font-bold tracking-wider truncate uppercase text-white leading-tight w-full">
                {employee.empresa || config.nombreEmpresaDefecto}
              </span>
            </div>

            {/* Contenido Central */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 pt-1 pb-2 z-10">
              {/* Contenedor Foto con anillo circular doble */}
              <div className="relative mb-2 shrink-0">
                <div
                  className="w-[84px] h-[84px] rounded-full p-1 border flex items-center justify-center bg-white transition-shadow shadow-xs hover:shadow-md"
                  style={{ borderColor: config.colorPrincipal }}
                >
                  <div
                    onClick={handlePhotoClick}
                    className={`w-full h-full rounded-full overflow-hidden bg-gray-50 flex items-center justify-center relative group ${
                      onPhotoUploaded ? 'cursor-pointer' : ''
                    }`}
                  >
                    {employee.fotoUrl ? (
                      <img
                        src={employee.fotoUrl}
                        alt={employee.nombre}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-1.5 flex flex-col items-center justify-center">
                        <User className="w-6 h-6 text-gray-300" />
                        <span className="text-[7px] font-bold text-gray-400 mt-1 uppercase leading-none">Foto</span>
                      </div>
                    )}
                    {onPhotoUploaded && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Nombres y Detalles */}
              <div className="text-center w-full">
                <h3 className="text-xs font-bold text-gray-900 leading-snug truncate px-1 uppercase tracking-tight" style={fontStyle}>
                  {employee.nombre || 'Nombre Empleado'}
                </h3>
                <div
                  className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 mt-1 rounded-full display inline-block bg-opacity-10"
                  style={{ backgroundColor: `${config.colorPrincipal}1a`, color: config.colorPrincipal }}
                >
                  {employee.puesto || 'Puesto o Rol'}
                </div>
              </div>
            </div>

            {/* Sección de Datos clínicos y seguro */}
            <div className="bg-gray-50/80 border-t border-gray-100/80 px-3.5 py-2.5 z-10">
              <div className="grid grid-cols-2 gap-2 text-left">
                <div className="flex flex-col">
                  <span className="text-[7px] text-gray-400 font-bold uppercase tracking-wider leading-none">RH SANGUÍNEO</span>
                  <span className="text-[10px] font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500 shrink-0" />
                    {employee.tipoSangre || 'O Rh+'}
                  </span>
                </div>

                <div className="flex flex-col border-l border-gray-200 pl-2">
                  <span className="text-[7px] text-gray-400 font-bold uppercase tracking-wider leading-none">REGISTRO NSS</span>
                  <span className="text-[10px] font-mono text-gray-700 font-bold mt-0.5 truncate" title={employee.nss}>
                    {employee.nss || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  // Encapsular entrada con input oculto
  const badgeWrapperStyles = isPrintMode
    ? {
        width: '5.4cm',
        height: '8.5cm',
        outline: config.mostrarBordedeCorte ? '1px dashed #cccccc' : 'none',
        outlineOffset: '-1px',
      }
    : {
        width: '180px', // Aproximación escalada en pantalla
        height: '283px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
      };

  return (
    <div
      style={badgeWrapperStyles}
      className={`relative select-none print-card-wrapper transition-all bg-white hover:border-gray-300 ${isPrintMode ? '' : 'rounded-xl overflow-hidden'} ${className}`}
    >
      {/* Input de archivo oculto por credencial para carga instantánea */}
      {onPhotoUploaded && (
        <input
          type="file"
          ref={photoInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      )}
      {renderLayout()}
    </div>
  );
}
