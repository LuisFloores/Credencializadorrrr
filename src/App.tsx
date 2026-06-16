import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Printer, 
  FileDown, 
  FileSpreadsheet, 
  Sparkles, 
  UserPlus, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle,
  CreditCard,
  Edit2
} from 'lucide-react';
import { Employee, BadgeConfig } from './types';
import BulkPhotoUploader from './components/BulkPhotoUploader';
import BadgeCustomizer from './components/BadgeCustomizer';
import BadgePreview from './components/BadgePreview';
import PrintSheet from './components/PrintSheet';

// Inicializar biblioteca jsPDF y html2canvas de forma perezosa/segura
let jsPDFClass: any = null;
let html2canvasClass: any = null;

// Helper to clean up oklch, oklab, and rgb(from ...) colors for html2canvas compatibility
const cleanRelativeColors = (cssText: string): string => {
  if (!cssText) return cssText;
  
  let output = '';
  let i = 0;
  while (i < cssText.length) {
    if (cssText.startsWith('rgb(from', i) || cssText.startsWith('rgba(from', i)) {
      // Find balanced parenthesis of rgb/rgba function
      let open = 1;
      let j = cssText.indexOf('(', i) + 1;
      while (j < cssText.length && open > 0) {
        if (cssText[j] === '(') open++;
        else if (cssText[j] === ')') open--;
        j++;
      }
      const fullBlock = cssText.substring(i, j);
      const matchAlpha = fullBlock.match(/\/\s*([0-9.%]+)\s*\)$/);
      let alpha = '1';
      if (matchAlpha) {
        const aVal = matchAlpha[1];
        if (aVal.endsWith('%')) {
          alpha = (parseFloat(aVal) / 100).toString();
        } else {
          alpha = aVal;
        }
      }
      
      if (fullBlock.includes('indigo')) {
        output += `rgba(79, 70, 229, ${alpha})`;
      } else if (fullBlock.includes('rose') || fullBlock.includes('red')) {
        output += `rgba(224, 30, 90, ${alpha})`;
      } else if (fullBlock.includes('slate') || fullBlock.includes('gray')) {
        output += `rgba(71, 85, 105, ${alpha})`;
      } else {
        output += `rgba(71, 85, 105, ${alpha})`;
      }
      i = j;
    } else if (cssText.startsWith('oklch(', i)) {
      // Find balanced parenthesis
      let open = 1;
      let j = i + 6;
      while (j < cssText.length && open > 0) {
        if (cssText[j] === '(') open++;
        else if (cssText[j] === ')') open--;
        j++;
      }
      const fullBlock = cssText.substring(i, j);
      
      const innerText = fullBlock.substring(6, fullBlock.length - 1).trim();
      const parts = innerText.split(/[\s,/]+/).filter(Boolean);
      
      if (parts.length >= 3) {
        const lStr = parts[0];
        const hStr = parts[2];
        const aStr = parts[3];
        
        const LVal = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
        let alpha = '1';
        if (aStr) {
          alpha = aStr.endsWith('%') ? (parseFloat(aStr) / 100).toString() : aStr;
        }
        
        if (LVal > 0.93) {
          output += `rgba(248, 250, 252, ${alpha})`;
        } else if (LVal > 0.85) {
          output += `rgba(241, 245, 249, ${alpha})`;
        } else if (LVal < 0.20) {
          output += `rgba(15, 23, 42, ${alpha})`;
        } else {
          const HVal = parseFloat(hStr);
          if (!isNaN(HVal)) {
            if (HVal >= 240 && HVal <= 290) {
              output += `rgba(79, 70, 229, ${alpha})`;
            } else if (HVal >= 0 && HVal <= 40) {
              output += `rgba(224, 30, 90, ${alpha})`;
            } else {
              output += `rgba(71, 85, 105, ${alpha})`;
            }
          } else {
            output += `rgba(71, 85, 105, ${alpha})`;
          }
        }
      } else {
        output += 'rgba(71, 85, 105, 1)';
      }
      i = j;
    } else if (cssText.startsWith('oklab(', i)) {
      // Find balanced parenthesis
      let open = 1;
      let j = i + 6;
      while (j < cssText.length && open > 0) {
        if (cssText[j] === '(') open++;
        else if (cssText[j] === ')') open--;
        j++;
      }
      const fullBlock = cssText.substring(i, j);
      
      const innerText = fullBlock.substring(6, fullBlock.length - 1).trim();
      const parts = innerText.split(/[\s,/]+/).filter(Boolean);
      
      if (parts.length >= 3) {
        const lStr = parts[0];
        const aStrVal = parts[1];
        const bStrVal = parts[2];
        const aStr = parts[3];
        
        const LVal = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
        let alpha = '1';
        if (aStr) {
          alpha = aStr.endsWith('%') ? (parseFloat(aStr) / 100).toString() : aStr;
        }
        
        if (LVal > 0.93) {
          output += `rgba(248, 250, 252, ${alpha})`;
        } else if (LVal > 0.85) {
          output += `rgba(241, 245, 249, ${alpha})`;
        } else if (LVal < 0.20) {
          output += `rgba(15, 23, 42, ${alpha})`;
        } else {
          const aVal = parseFloat(aStrVal);
          const bVal = parseFloat(bStrVal);
          if (!isNaN(aVal) && !isNaN(bVal)) {
            if (aVal > 0.05) {
              output += `rgba(224, 30, 90, ${alpha})`;
            } else if (bVal < -0.05) {
              output += `rgba(79, 70, 229, ${alpha})`;
            } else {
              output += `rgba(71, 85, 105, ${alpha})`;
            }
          } else {
            output += `rgba(71, 85, 105, ${alpha})`;
          }
        }
      } else {
        output += 'rgba(71, 85, 105, 1)';
      }
      i = j;
    } else {
      output += cssText[i];
      i++;
    }
  }
  return output;
};

const DEFAULT_CONFIG: BadgeConfig = {
  nombreEmpresaDefecto: 'Sinergia S.A.',
  colorPrincipal: '#1e3a8a', // Azul Corporativo
  colorSecundario: '#4b5563', // Gris Oscuro
  colorTextoBanda: '#ffffff',
  logoUrl: undefined,
  tipografia: 'Inter',
  formatoHoja: 'Letter',
  mostrarBordedeCorte: true,
  estiloDiseno: 'clasico'
};

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'mock-1',
    empresa: 'TecnoCorp Inc.',
    nombre: 'Elena Garza Ramos',
    puesto: 'Ingeniera de Software Sr.',
    tipoSangre: 'O Rh+',
    nss: '124-587-9031',
  },
  {
    id: 'mock-2',
    empresa: 'TecnoCorp Inc.',
    nombre: 'Roberto Valdez Castro',
    puesto: 'Coordinador de Seguridad',
    tipoSangre: 'AB Rh-',
    nss: '820-114-5594'
  },
  {
    id: 'mock-3',
    empresa: 'TecnoCorp Inc.',
    nombre: 'Sofía Martínez Alva',
    puesto: 'Diseñadora UX/UI',
    tipoSangre: 'A Rh+',
    nss: '445-667-8890'
  }
];

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [config, setConfig] = useState<BadgeConfig>(DEFAULT_CONFIG);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('mock-1');
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Auto descartar notificaciones
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Limpiar estilos oklch, oklab y relativos en la carga y dinámicamente
  useEffect(() => {
    const cleanedLinks = new Set<string>();

    const cleanStylesheets = async () => {
      try {
        // 1. Limpiar todas las etiquetas <style> internas actuales
        const styles = Array.from(document.getElementsByTagName('style'));
        styles.forEach((style) => {
          if (style.textContent && (style.textContent.includes('oklch') || style.textContent.includes('oklab') || style.textContent.includes('from '))) {
            style.textContent = cleanRelativeColors(style.textContent);
          }
        });

        // 2. Limpiar hojas de estilo externas <link>
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
        for (const link of links) {
          const href = link.href;
          if (href && !cleanedLinks.has(href)) {
            cleanedLinks.add(href);
            try {
              const res = await fetch(href);
              if (res.ok) {
                const cssText = await res.text();
                if (cssText.includes('oklch') || cssText.includes('oklab') || cssText.includes('from ')) {
                  const cleanedText = cleanRelativeColors(cssText);
                  const styleEl = document.createElement('style');
                  styleEl.setAttribute('data-href', href);
                  styleEl.textContent = cleanedText;
                  document.head.appendChild(styleEl);
                  
                  // Deshabilitar y eliminar el link original
                  link.disabled = true;
                  link.parentNode?.removeChild(link);
                }
              }
            } catch (err) {
              console.warn('No se pudo procesar la hoja de estilo externa para oklch:', href, err);
            }
          }
        }
      } catch (e) {
        console.warn('Error al limpiar estilos globales:', e);
      }
    };

    cleanStylesheets();

    // Observar inserciones dinámicas de etiquetas style (por ejemplo, recargas del dev server)
    const observer = new MutationObserver((mutations) => {
      let shouldClean = false;
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeName === 'STYLE') {
            shouldClean = true;
          }
        });
      });
      if (shouldClean) {
        cleanStylesheets();
      }
    });

    observer.observe(document.head, { childList: true });
    return () => observer.disconnect();
  }, []);

  const triggerNotification = (type: 'success' | 'info' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const handleEmployeesLoaded = (newEmployees: Employee[]) => {
    // Al cargar empleados nuevos, reemplazados o los adicionamos
    setEmployees(newEmployees);
    if (newEmployees.length > 0) {
      setSelectedEmployeeId(newEmployees[0].id);
      triggerNotification('success', `Se han importado ${newEmployees.length} colaboradores correctamente.`);
    }
  };

  const handlePhotosMatched = (updatedEmployees: Employee[]) => {
    setEmployees(updatedEmployees);
    triggerNotification('success', 'Fotografías vinculadas exitosamente.');
  };

  const handleSinglePhotoUploaded = (id: string, file: File) => {
    const url = URL.createObjectURL(file);
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, fotoUrl: url } : emp));
    triggerNotification('success', 'Fotografía actualizada para el colaborador.');
  };

  // Agregar nuevo empleado vacío
  const addNewEmployee = () => {
    const newEmp: Employee = {
      id: `manual-${Date.now()}`,
      empresa: employees[0]?.empresa || config.nombreEmpresaDefecto || 'Nueva Empresa',
      nombre: 'Nuevo Colaborador',
      puesto: 'Asistente de Operaciones',
      tipoSangre: 'O Rh+',
      nss: '000-000-0000'
    };
    setEmployees(prev => [...prev, newEmp]);
    setSelectedEmployeeId(newEmp.id);
    triggerNotification('info', 'Nuevo perfil creado. Puedes editar los campos directamente en la tabla.');
  };

  // Eliminar un empleado
  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    if (selectedEmployeeId === id) {
      const remaining = employees.filter(emp => emp.id !== id);
      if (remaining.length > 0) {
        setSelectedEmployeeId(remaining[0].id);
      }
    }
    triggerNotification('info', 'Colaborador removido de la planilla.');
  };

  // Modificar registro de empleado directamente en la tabla
  const updateCellValue = (id: string, key: keyof Employee, value: string) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, [key]: value } : emp));
  };

  // Limpiar toda la planilla
  const clearAllEmployees = () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar todos los registros? Perderás las fotos cargadas.')) {
      setEmployees([]);
      setSelectedEmployeeId('');
      triggerNotification('info', 'Se ha limpiado el listado de colaboradores.');
    }
  };

  // Cargar mock data nuevamente
  const reloadMockData = () => {
    setEmployees(MOCK_EMPLOYEES);
    setSelectedEmployeeId('mock-1');
    triggerNotification('info', 'Cargado el set de demostración.');
  };

  // Imprimir usando el print nativo del navegador configurado con estilo de hoja
  const handlePrint = () => {
    if (employees.length === 0) {
      triggerNotification('error', 'No hay colaboradores para imprimir.');
      return;
    }
    window.print();
  };

  // Generar PDF usando jsPDF + html2canvas con alta resolución
  const handleGeneratePDF = async () => {
    if (employees.length === 0) {
      triggerNotification('error', 'No hay colaboradores para generar el PDF.');
      return;
    }
    setIsGeneratingPdf(true);
    triggerNotification('info', 'Generando PDF de alta definición página por página. Por favor espera...');

    try {
      // Importar dinámicamente jsPDF y html2canvas de forma segura
      if (!jsPDFClass) {
        const jspdfModule = await import('jspdf');
        jsPDFClass = jspdfModule.default || jspdfModule;
      }
      if (!html2canvasClass) {
        const html2canvasModule = await import('html2canvas');
        html2canvasClass = html2canvasModule.default || html2canvasModule;
      }

      const isA4 = config.formatoHoja === 'A4';
      const doc = new jsPDFClass({
        orientation: 'portrait',
        unit: 'mm',
        format: isA4 ? 'a4' : 'letter',
        compress: true
      });

      const pageWidth = isA4 ? 210 : 215.9;
      const pageHeight = isA4 ? 297 : 279.4;

      const pagesCount = Math.ceil(employees.length / 9);

      for (let i = 0; i < pagesCount; i++) {
        const pageElement = document.getElementById(`print-page-${i}`);
        if (!pageElement) continue;

        // Renderizar el elemento HTML en un lienzo/canvas a alta resolución (2x DPI)
        const canvas = await html2canvasClass(pageElement, {
          scale: 2, // calidad fotográfica
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc: Document) => {
            // 1. Gather all CSS rules from document.styleSheets and style tags, clean them, and put into a single style tag.
            let combinedCSS = '';
            
            try {
              Array.from(document.styleSheets).forEach((sheet) => {
                try {
                  Array.from(sheet.cssRules || []).forEach((rule) => {
                    combinedCSS += rule.cssText + '\n';
                  });
                } catch (e) {
                  // Ignore security/access restriction errors
                }
              });
            } catch (err) {
              console.warn('Could not read styleSheets rules', err);
            }

            Array.from(document.getElementsByTagName('style')).forEach((style) => {
              if (style.textContent) {
                combinedCSS += style.textContent + '\n';
              }
            });

            const cleanedCSS = cleanRelativeColors(combinedCSS);

            // Strip existing style tags and external stylesheet links from page element
            const stylesToRemove = Array.from(clonedDoc.querySelectorAll('style, link[rel="stylesheet"]'));
            stylesToRemove.forEach((el) => el.parentNode?.removeChild(el));

            // Inject the cleaned styles
            const newStyle = clonedDoc.createElement('style');
            newStyle.textContent = cleanedCSS;
            clonedDoc.head.appendChild(newStyle);

            // 2. Clean inline style attributes of every element in the cloned document
            const allElements = clonedDoc.getElementsByTagName('*');
            for (let idx = 0; idx < allElements.length; idx++) {
              const el = allElements[idx] as HTMLElement;
              if (el && el.style) {
                const styleAttr = el.getAttribute('style');
                if (styleAttr && (styleAttr.includes('oklch') || styleAttr.includes('oklab') || styleAttr.includes('from'))) {
                  el.setAttribute('style', cleanRelativeColors(styleAttr));
                }
              }
            }

            // 3. Shim computedStyle inside the cloned window frame context to safely intercept queries
            if (clonedDoc.defaultView) {
              const originalGetComputedStyle = clonedDoc.defaultView.getComputedStyle;
              clonedDoc.defaultView.getComputedStyle = function (elt, pseudoElt) {
                const style = originalGetComputedStyle.call(this, elt, pseudoElt);
                return new Proxy(style, {
                  get(target, prop) {
                    const val = Reflect.get(target, prop);
                    if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab') || val.includes('from'))) {
                      return cleanRelativeColors(val);
                    }
                    if (typeof val === 'function') {
                      return val.bind(target);
                    }
                    return val;
                  }
                });
              };
            }
          }
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        if (i > 0) {
          doc.addPage();
        }

        doc.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
      }

      doc.save(`Planilla_Credenciales_${new Date().toISOString().slice(0, 10)}.pdf`);
      triggerNotification('success', '¡PDF descargado con éxito! Listo para la imprenta.');
    } catch (err) {
      console.error(err);
      triggerNotification('error', 'Ocurrió un fallo al renderizar el documento PDF con html2canvas.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800">
      
      {/* Estilo Dinámico Inyectado para imprimir con precisión milimétrica */}
      <style>{`
        @media print {
          /* Forzar la impresión de colores, degradados, fondos e imágenes */
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Ocultar toda la UI interactiva */
          body * {
            visibility: hidden;
          }
          /* Mostrar únicamente la zona de impresión */
          #print-zone, #print-zone * {
            visibility: visible;
          }
          #print-zone {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          /* Forzar corte de página físico al imprimir */
          .sheet-page {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
          }
          @page {
            size: auto;
            margin: 0mm;
          }
        }
      `}</style>

      {/* Cabecera / Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 px-6 py-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <CreditCard className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight flex items-center gap-2">
                Generador de Credenciales Imprimibles
                <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                  CR80 (5.4x8.5 cm)
                </span>
              </h1>
              <p className="text-xs text-gray-500">
                Diseño, personalización y maquetación de credenciales a partir de un formulario interactivo.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {employees.length > 0 && (
              <>
                <button
                  onClick={handlePrint}
                  disabled={isGeneratingPdf}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-200 rounded-xl shadow-xs cursor-pointer transition-all disabled:opacity-50"
                  id="btn-print"
                >
                  <Printer className="w-4 h-4 text-gray-500" />
                  Imprimir por Navegador
                </button>
                
                <button
                  onClick={handleGeneratePDF}
                  disabled={isGeneratingPdf}
                  className="flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm cursor-pointer transition-all duration-150 disabled:bg-indigo-400"
                  id="btn-pdf"
                >
                  {isGeneratingPdf ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Procesando PDF...
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4" />
                      Generar PDF Imprimible (Pro)
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Notificación Toast Flotante / Alerta de Sistema */}
        {notification && (
          <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-lg border flex items-start gap-3 transition-all duration-300 transform translate-y-0 max-w-sm ${
            notification.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : notification.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-indigo-50 border-indigo-200 text-indigo-800'
          }`}>
            <Sparkles className={`w-5 h-5 shrink-0 mt-0.5 ${
              notification.type === 'success' ? 'text-emerald-600' : 'text-indigo-600'
            }`} />
            <div>
              <p className="text-xs font-semibold leading-relaxed">{notification.message}</p>
            </div>
          </div>
        )}

        {/* COLUMNA IZQUIERDA: Configuración y carga (5 columnas de ancho) */}
        <div className="lg:col-span-5 flex flex-col gap-1">
          
          {/* Subida de fotos en corte lote */}
          <BulkPhotoUploader 
            employees={employees}
            onPhotosMatched={handlePhotosMatched}
            onLogMessage={(msg) => triggerNotification('info', msg)}
          />

          {/* Personalización Física y gráfica */}
          <BadgeCustomizer 
            config={config}
            onChange={(newCfg) => setConfig(newCfg)}
          />

        </div>

        {/* COLUMNA DERECHA: Vista previa en vivo y Editor interactivo de datos (7 columnas de ancho) */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Panel de Enfoque / Tarjeta y Previsualización Individual */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Previsualización Activa y Ajuste Fino
            </h2>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              
              {/* Tarjeta Visual de Credencial */}
              <div className="flex flex-col items-center gap-1 shrink-0 p-4 bg-slate-50 border border-slate-100 rounded-xl shadow-inner group/preview">
                {selectedEmployee ? (
                  <>
                    <BadgePreview 
                      employee={selectedEmployee}
                      config={config}
                      onPhotoUploaded={handleSinglePhotoUploaded}
                    />
                    <span className="text-[10px] text-gray-400 mt-2 text-center leading-normal">
                      ID actual: <span className="font-mono text-[9px] bg-gray-200 px-1 rounded text-gray-600">{selectedEmployee.id.split('-')[0]}</span>
                      <br />
                      Haga clic en el recuadro de la foto <br /> para cambiar la imagen actual
                    </span>
                  </>
                ) : (
                  <div className="w-[180px] h-[283px] border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-4 text-center text-gray-400 text-xs">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mb-2 animate-bounce" />
                    Carga o añade un colaborador para verlo en vivo.
                  </div>
                )}
              </div>

              {/* Controles rápidos sobre el seleccionado */}
              <div className="flex-1 w-full space-y-3.5">
                {selectedEmployee ? (
                  <>
                    <div className="pb-2 border-b border-gray-100">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Colaborador en Edición</span>
                      <h4 className="text-base font-bold text-gray-900 truncate">{selectedEmployee.nombre}</h4>
                      <p className="text-xs text-gray-500 font-medium">{selectedEmployee.puesto}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-1">Empresa</label>
                        <input 
                          type="text"
                          value={selectedEmployee.empresa}
                          onChange={(e) => updateCellValue(selectedEmployee.id, 'empresa', e.target.value)}
                          className="w-full text-xs p-2 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-indigo-500 rounded-lg font-medium outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-1">Nombre Completo</label>
                        <input 
                          type="text"
                          value={selectedEmployee.nombre}
                          onChange={(e) => updateCellValue(selectedEmployee.id, 'nombre', e.target.value)}
                          className="w-full text-xs p-2 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-indigo-500 rounded-lg font-medium outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-1">Puesto / Cargo</label>
                        <input 
                          type="text"
                          value={selectedEmployee.puesto}
                          onChange={(e) => updateCellValue(selectedEmployee.id, 'puesto', e.target.value)}
                          className="w-full text-xs p-2 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-indigo-500 rounded-lg font-medium outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-1">Tipo Sangre (GS)</label>
                        <input 
                          type="text"
                          value={selectedEmployee.tipoSangre}
                          onChange={(e) => updateCellValue(selectedEmployee.id, 'tipoSangre', e.target.value)}
                          className="w-full text-xs p-2 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-indigo-500 rounded-lg font-medium outline-hidden"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 block mb-1">Número de Seguro Social (NSS/IMSS - 11 caracteres sugeridos)</label>
                        <input 
                          type="text"
                          value={selectedEmployee.nss}
                          onChange={(e) => updateCellValue(selectedEmployee.id, 'nss', e.target.value)}
                          className="w-full text-xs p-2 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-indigo-500 rounded-lg font-medium outline-hidden"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <p className="text-xs">No hay datos de selección.</p>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Tabla Interactiva de Gestión (Hoja de Datos Directa) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-gray-500" />
                  Editor de Colaboradores ({employees.length})
                </h2>
                <p className="text-xs text-gray-400">Edita directamente cualquier casilla de la tabla inferior.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={addNewEmployee}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-100 rounded-lg cursor-pointer transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Agregar Manual
                </button>
                {employees.length > 0 ? (
                  <button
                    onClick={clearAllEmployees}
                    className="flex items-center gap-1 py-1.5 px-3 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 hover:border-rose-250 border border-rose-150 rounded-lg cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Vaciar Todo
                  </button>
                ) : (
                  <button
                    onClick={reloadMockData}
                    className="flex items-center gap-1 py-1.5 px-3 text-xs font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-250 rounded-lg cursor-pointer transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Recargar Demos
                  </button>
                )}
              </div>
            </div>

            {employees.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                <AlertTriangle className="w-9 h-9 text-amber-500 mx-auto mb-2.5" />
                <p className="text-sm font-semibold text-gray-700">No hay colaboradores cargados</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                  Sube tu plantilla Excel o utiliza el botón de &quot;Agregar Manual&quot; para registrar tus credenciales desde cero.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs text-left text-gray-500">
                  <thead className="text-[10px] uppercase font-bold text-gray-400 bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-3 py-3">Empresa</th>
                      <th className="px-3 py-3">Puesto</th>
                      <th className="px-2 py-3">Rh Sanguíneo</th>
                      <th className="px-3 py-3">NSS</th>
                      <th className="px-3 py-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {employees.map((emp) => (
                      <tr 
                        key={emp.id}
                        className={`hover:bg-slate-50 transition-colors ${selectedEmployeeId === emp.id ? 'bg-indigo-50/20' : ''}`}
                      >
                        {/* Nombre */}
                        <td className="px-4 py-2 font-medium text-gray-900">
                          <input 
                            type="text"
                            value={emp.nombre}
                            onChange={(e) => updateCellValue(emp.id, 'nombre', e.target.value)}
                            onFocus={() => setSelectedEmployeeId(emp.id)}
                            className="bg-transparent border-none hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-indigo-200 outline-hidden w-full p-1 rounded font-bold"
                          />
                        </td>
                        {/* Empresa */}
                        <td className="px-3 py-2 text-gray-600">
                          <input 
                            type="text"
                            value={emp.empresa}
                            onChange={(e) => updateCellValue(emp.id, 'empresa', e.target.value)}
                            onFocus={() => setSelectedEmployeeId(emp.id)}
                            className="bg-transparent border-none hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-indigo-200 outline-hidden w-full p-1 rounded"
                          />
                        </td>
                        {/* Puesto */}
                        <td className="px-3 py-2 text-gray-600">
                          <input 
                            type="text"
                            value={emp.puesto}
                            onChange={(e) => updateCellValue(emp.id, 'puesto', e.target.value)}
                            onFocus={() => setSelectedEmployeeId(emp.id)}
                            className="bg-transparent border-none hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-indigo-200 outline-hidden w-full p-1 rounded"
                          />
                        </td>
                        {/* Sangre */}
                        <td className="px-2 py-2 text-gray-600 text-center">
                          <input 
                            type="text"
                            value={emp.tipoSangre}
                            onChange={(e) => updateCellValue(emp.id, 'tipoSangre', e.target.value)}
                            onFocus={() => setSelectedEmployeeId(emp.id)}
                            className="bg-transparent border-none hover:bg-gray-100 text-center focus:bg-white focus:ring-1 focus:ring-indigo-200 outline-hidden w-16 p-1 rounded"
                          />
                        </td>
                        {/* NSS */}
                        <td className="px-3 py-2">
                          <input 
                            type="text"
                            value={emp.nss}
                            onChange={(e) => updateCellValue(emp.id, 'nss', e.target.value)}
                            onFocus={() => setSelectedEmployeeId(emp.id)}
                            className="bg-transparent border-none hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-indigo-200 font-mono outline-hidden w-full p-1 rounded"
                          />
                        </td>
                        {/* Acciones */}
                        <td className="px-3 py-2 text-center flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedEmployeeId(emp.id)}
                            className={`p-1 rounded cursor-pointer ${
                              selectedEmployeeId === emp.id 
                                ? 'bg-indigo-100 text-indigo-700' 
                                : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
                            }`}
                            title="Ver en previsualización de edición"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => deleteEmployee(emp.id)}
                            className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Eliminar de la lista"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* PLANILLA COMPLETA DE IMPRESIÓN (Visible en pantalla y capturada por el PDF renderer) */}
      <section className="bg-slate-200 py-10 px-4 mt-6 border-t border-slate-300">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center justify-center gap-2 select-none">
              <Printer className="w-5 h-5 text-gray-600" />
              Vista Previa de la Planilla de Impresión de Hojas Completa
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Las credenciales mostradas a continuación representan la maquetación exacta con la que se imprimirá el PDF o la página física.
              La disposición se calcula de 9 en 9 y se acomoda automáticamente para reducir el desperdicio de material físico.
            </p>
          </div>

          <div className="flex justify-center transition-all">
            <div id="print-zone" className="bg-transparent p-0">
              {employees.length > 0 ? (
                <PrintSheet employees={employees} config={config} />
              ) : (
                <div className="bg-white border rounded-xl p-16 text-center text-gray-400 max-w-xl mx-auto shadow-sm">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-semibold">No hay credenciales en la planilla</p>
                  <p className="text-xs mt-1">Sube datos para ver la planilla distribuida lista para su impresión.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Pie de página */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 px-6 mt-16 select-none print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 leading-relaxed">
          <div className="flex items-center gap-2 font-medium">
            <CreditCard className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-200">Generador de Credenciales</span>
            <span className="text-slate-600">|</span>
            <span>Local-First &amp; Libre de Servidores</span>
          </div>
          <div className="text-center md:text-right">
            <p>Diseño físico exacto para tarjetas CR80 (5.4 cm x 8.5 cm).</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Compatible con impresoras de inyección, láser y PVC termosensibles.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
