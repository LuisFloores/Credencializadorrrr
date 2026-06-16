import React from 'react';
import { Employee, BadgeConfig } from '../types';
import BadgePreview from './BadgePreview';

interface PrintSheetProps {
  employees: Employee[];
  config: BadgeConfig;
}

export default function PrintSheet({ employees, config }: PrintSheetProps) {
  // Dividir empleados en grupos de 9 (una grilla de 3x3 por página)
  const chunkEmployees = (arr: Employee[], size: number): Employee[][] => {
    const chunks: Employee[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const pages = chunkEmployees(employees, 9);

  // Configurar dimensiones físicas según el formato seleccionado
  const isA4 = config.formatoHoja === 'A4';
  const pageStyle = {
    width: isA4 ? '21cm' : '21.59cm',
    height: isA4 ? '29.7cm' : '27.94cm',
    paddingLeft: isA4 ? '1.2cm' : '1.4cm',
    paddingRight: isA4 ? '1.2cm' : '1.4cm',
    paddingTop: '1.2cm',
    paddingBottom: '1.2cm',
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {pages.map((pageEmployees, pageIdx) => (
        <div key={pageIdx} className="relative group/page">
          
          {/* Indicador superior de página en pantalla (No visible al imprimir) */}
          <div className="absolute -top-6 left-2 right-2 flex justify-between text-[11px] font-semibold text-gray-500 font-mono tracking-wider select-none print:hidden">
            <span>PÁGINA {pageIdx + 1} DE {pages.length}</span>
            <span>({pageEmployees.length} CREDENCIALES)</span>
          </div>

          {/* Hoja de Impresión Física */}
          <div
            id={`print-page-${pageIdx}`}
            className="bg-white border shadow-lg border-gray-200 rounded-xs flex flex-col justify-start print:shadow-none print:border-none print:rounded-none sheet-page print:m-0"
            style={pageStyle}
          >
            {/* Grilla de 3 Columnas por 3 Filas */}
            <div 
              className="grid grid-cols-3 justify-center align-middle w-full h-full"
              style={{
                columnGap: isA4 ? '0.8cm' : '0.9cm',
                rowGap: '0.9cm',
                alignContent: 'center',
                justifyItems: 'center'
              }}
            >
              {pageEmployees.map((emp) => (
                <BadgePreview
                  key={emp.id}
                  employee={emp}
                  config={config}
                  isPrintMode={true}
                />
              ))}

              {/* Rellenar espacios vacíos en páginas incompletas para mantener la estructura pero no imprimir bordes de corte si no hay datos */}
              {Array.from({ length: 9 - pageEmployees.length }).map((_, emptyIdx) => (
                <div
                  key={`empty-${emptyIdx}`}
                  style={{ width: '5.4cm', height: '8.5cm' }}
                  className="bg-transparent border border-dashed border-gray-100/30 print:border-none print:outline-none"
                />
              ))}
            </div>
          </div>

          {/* Separador de página visual (No visible al imprimir) */}
          <div className="w-full h-px border-b border-dashed border-gray-300 mt-4 print:hidden block" />
        </div>
      ))}
    </div>
  );
}
