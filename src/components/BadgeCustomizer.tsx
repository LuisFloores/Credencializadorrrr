import React from 'react';
import { Palette } from 'lucide-react';
import { BadgeConfig } from '../types';

interface BadgeCustomizerProps {
  config: BadgeConfig;
  onChange: (config: BadgeConfig) => void;
}

const COLOR_PRESETS = [
  { name: 'Azul Corporativo', primary: '#1e3a8a', secondary: '#4b5563', textBanda: '#ffffff' },
  { name: 'Esmeralda', primary: '#0f766e', secondary: '#4b5563', textBanda: '#ffffff' },
  { name: 'Naranja Técnico', primary: '#c2410c', secondary: '#374151', textBanda: '#ffffff' },
  { name: 'Rojo Energía', primary: '#b91c1c', secondary: '#374151', textBanda: '#ffffff' },
  { name: 'Carbono Elegante', primary: '#1f2937', secondary: '#4b5563', textBanda: '#ffffff' },
  { name: 'Púrpura Creativo', primary: '#6d28d9', secondary: '#4b5563', textBanda: '#ffffff' },
];

export default function BadgeCustomizer({ config, onChange }: BadgeCustomizerProps) {
  const handlePresetSelect = (preset: typeof COLOR_PRESETS[0]) => {
    onChange({
      ...config,
      colorPrincipal: preset.primary,
      colorSecundario: preset.secondary,
      colorTextoBanda: preset.textBanda,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-gray-700" />
        2. Personalizar Diseño de Credenciales
      </h2>

      {/* Paleta de Colores */}
      <div className="mb-2">
        <label className="text-xs font-semibold text-gray-700 block mb-2">Paleta de Colores Corporativos:</label>
        
        {/* Presets */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {COLOR_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetSelect(preset)}
              className="flex items-center gap-1.5 p-1.5 rounded-lg border text-[10px] font-medium text-gray-600 border-gray-150 bg-gray-50/50 hover:bg-gray-50 cursor-pointer text-left transition-colors"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                style={{ backgroundColor: preset.primary }}
              />
              <span className="truncate">{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Custom selectors */}
        <div className="grid grid-cols-2 gap-3.5 p-3 rounded-xl bg-gray-50 border border-gray-150">
          <div>
            <span className="text-[10px] font-medium text-gray-500 block mb-1">Color Principal</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.colorPrincipal}
                onChange={(e) => onChange({ ...config, colorPrincipal: e.target.value })}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0.5 bg-white shrink-0"
              />
              <input
                type="text"
                value={config.colorPrincipal}
                onChange={(e) => onChange({ ...config, colorPrincipal: e.target.value })}
                className="w-full text-xs font-mono uppercase bg-white border border-gray-200 px-2 py-1 rounded"
              />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-medium text-gray-500 block mb-1">Color Secundario</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.colorSecundario}
                onChange={(e) => onChange({ ...config, colorSecundario: e.target.value })}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0.5 bg-white shrink-0"
              />
              <input
                type="text"
                value={config.colorSecundario}
                onChange={(e) => onChange({ ...config, colorSecundario: e.target.value })}
                className="w-full text-xs font-mono uppercase bg-white border border-gray-200 px-2 py-1 rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
