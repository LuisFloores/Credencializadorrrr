import React, { useRef, useState } from 'react';
import { Images, CheckCircle, AlertOctagon, HelpCircle, UserCheck } from 'lucide-react';
import { Employee } from '../types';

interface BulkPhotoUploaderProps {
  employees: Employee[];
  onPhotosMatched: (updatedEmployees: Employee[]) => void;
  onLogMessage: (message: string) => void;
}

export default function BulkPhotoUploader({ employees, onPhotosMatched, onLogMessage }: BulkPhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [results, setResults] = useState<{ matched: number; unmatched: number; list: { filename: string; matchedName?: string }[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanString = (str: string): string => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // eliminar acentos
      .replace(/[^a-z0-9]/g, ' ')      // reemplazar caracteres no alfanuméricos con espacios
      .replace(/\s+/g, ' ')            // colapsar espacios múltiples
      .trim();
  };

  const processPhotos = (files: FileList) => {
    if (employees.length === 0) {
      onLogMessage('Primero debes cargar un archivo Excel con empleados para poder emparejar fotos.');
      return;
    }

    const fileArray = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (fileArray.length === 0) {
      onLogMessage('No se seleccionaron archivos de imagen válidos.');
      return;
    }

    const updatedEmployees = [...employees];
    let matchedCount = 0;
    const matchDetails: { filename: string; matchedName?: string }[] = [];

    fileArray.forEach(file => {
      // Quitar extensión del archivo
      const lastDotIndex = file.name.lastIndexOf('.');
      const rawName = lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) : file.name;
      
      const cleanedFile = cleanString(rawName);
      const fileWords = cleanedFile.split(' ').filter(w => w.length > 2); // palabras significativas > 2 letras

      let bestMatchEmployee: Employee | null = null;
      let highestScore = 0;

      updatedEmployees.forEach(emp => {
        const cleanedEmpName = cleanString(emp.nombre);
        const empWords = cleanedEmpName.split(' ').filter(w => w.length > 2);

        // Nivel 1: Coincidencia exacta o casi exacta
        if (cleanedEmpName === cleanedFile || cleanedEmpName.includes(cleanedFile) || cleanedFile.includes(cleanedEmpName)) {
          bestMatchEmployee = emp;
          highestScore = 100; // Máxima prioridad
          return;
        }

        // Nivel 2: Intersección de palabras
        if (fileWords.length > 0 && empWords.length > 0) {
          const commonWords = fileWords.filter(word => empWords.includes(word));
          const score = (commonWords.length / Math.max(fileWords.length, empWords.length)) * 100;
          
          if (score > highestScore && score >= 40) { // Al menos 40% de coincidencia
            highestScore = score;
            bestMatchEmployee = emp;
          }
        }
      });

      if (bestMatchEmployee && highestScore >= 40) {
        // Encontrar índice del empleado y actualizar su foto
        const empIndex = updatedEmployees.findIndex(e => e.id === (bestMatchEmployee as Employee).id);
        if (empIndex !== -1) {
          // Si ya tiene una foto del objeto creado previamente, idealmente la liberamos de memoria,
          // pero el recolector lo maneja si se sobrescribe.
          updatedEmployees[empIndex] = {
            ...updatedEmployees[empIndex],
            fotoUrl: URL.createObjectURL(file)
          };
          matchedCount++;
          matchDetails.push({
            filename: file.name,
            matchedName: (bestMatchEmployee as Employee).nombre
          });
        }
      } else {
        matchDetails.push({
          filename: file.name,
          matchedName: undefined
        });
      }
    });

    onPhotosMatched(updatedEmployees);
    setResults({
      matched: matchedCount,
      unmatched: fileArray.length - matchedCount,
      list: matchDetails
    });

    onLogMessage(`Emparejamiento de fotos en lote finalizado: ${matchedCount} fotos asignadas.`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processPhotos(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processPhotos(e.target.files);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 mb-6">
      <div className="flex flex-col mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Images className="w-5 h-5 text-gray-700" />
          Subida de Fotos en Lote (Opcional)
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Sube múltiples imágenes simultáneamente. La aplicación asociará cada imagen al empleado correspondiente analizando el nombre del archivo.
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (employees.length === 0) {
            onLogMessage('Primero debes cargar el Excel de empleados.');
            return;
          }
          fileInputRef.current?.click();
        }}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          employees.length === 0
            ? 'border-gray-100 bg-gray-50/50 cursor-not-allowed opacity-60'
            : isDragging
            ? 'border-gray-500 bg-gray-100 scale-[1.01]'
            : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50/50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          disabled={employees.length === 0}
          className="hidden"
        />
        
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
          employees.length === 0 ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-700'
        }`}>
          <Images className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-gray-700 mb-0.5">
          {employees.length === 0 ? 'Bloqueado hasta cargar empleados' : 'Suelta todas las imágenes de los empleados aquí'}
        </p>
        <p className="text-xs text-gray-400">
          Usa nombres de archivo descriptivos como: <span className="font-mono text-[11px] bg-gray-100 px-1 py-0.5 rounded text-gray-650">juan_perez.jpg</span>
        </p>
      </div>

      {results && (
        <div className="mt-4 p-4 rounded-xl border border-gray-100 bg-gray-50 text-xs">
          <div className="flex items-center justify-between font-medium text-gray-705 pb-2 mb-2 border-b border-gray-200">
            <span>Resultados de Emparejamiento</span>
            <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full font-bold">
              {results.matched} / {results.matched + results.unmatched} Asignadas
            </span>
          </div>

          <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
            {results.list.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] py-0.5">
                <span className="text-gray-500 truncate max-w-[180px]" title={item.filename}>
                  {item.filename}
                </span>
                
                {item.matchedName ? (
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <UserCheck className="w-2.5 h-2.5" />
                    → {item.matchedName}
                  </span>
                ) : (
                  <span className="text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <HelpCircle className="w-2.5 h-2.5" />
                    Sin coincidencia clara
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
