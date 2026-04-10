import React, { useState, useMemo } from 'react';
import { Settings2, Activity, Beaker, BarChart2, Database } from 'lucide-react';

// --- 1. BASE DE DATOS UBA ACTUALIZADA (Según guía de problemas) ---
const ACID_DB = [
  { id: 'none', name: '-- Ninguno --', pkas: [], type: 0 },
  { id: 'fosforico', name: 'Ácido Fosfórico', pkas: [2.12, 7.20, 12.30], type: 3 },
  { id: 'citrico', name: 'Ácido Cítrico', pkas: [3.13, 4.76, 6.33], type: 3 },
  { id: 'carbonico', name: 'Ácido Carbónico', pkas: [6.36, 10.33], type: 2 },
  { id: 'oxalico', name: 'Ácido Oxálico', pkas: [1.27, 4.27], type: 2 },
  { id: 'tartarico', name: 'Ácido Tartárico', pkas: [3.04, 4.37], type: 2 },
  { id: 'succinico', name: 'Ácido Succínico', pkas: [4.21, 5.64], type: 2 },
  { id: 'maleico', name: 'Ácido Maleico', pkas: [1.92, 6.27], type: 2 },
  { id: 'sulfuroso', name: 'Ácido Sulfuroso', pkas: [1.77, 7.18], type: 2 },
  { id: 'arsenico', name: 'Ácido Arsénico', pkas: [2.23, 6.95, 11.49], type: 3 },
  { id: 'acetico', name: 'Ácido Acético', pkas: [4.75], type: 1 },
  { id: 'amonio', name: 'Ion Amonio', pkas: [9.26], type: 1 },
  { id: 'formico', name: 'Ácido Fórmico', pkas: [3.74], type: 1 },
  { id: 'nitroso', name: 'Ácido Nitroso', pkas: [3.15], type: 1 }
];

// --- 2. MOTOR MATEMÁTICO GENERALIZADO ---
const calcAlphas = (pH, pkas) => {
  if (!pkas || pkas.length === 0) return [];
  const H = Math.pow(10, -pH);
  const K = pkas.map(p => Math.pow(10, -p));
  
  if (pkas.length === 1) {
    const D = H + K[0];
    return [H / D, K[0] / D];
  } else if (pkas.length === 2) {
    const D = Math.pow(H, 2) + H * K[0] + K[0] * K[1];
    return [Math.pow(H, 2) / D, (H * K[0]) / D, (K[0] * K[1]) / D];
  } else if (pkas.length === 3) {
    const D = Math.pow(H, 3) + Math.pow(H, 2) * K[0] + H * K[0] * K[1] + K[0] * K[1] * K[2];
    return [Math.pow(H, 3) / D, (Math.pow(H, 2) * K[0]) / D, (H * K[0] * K[1]) / D, (K[0] * K[1] * K[2]) / D];
  }
  return [];
};

const calcTitrationVolume = (pH, pkas, Ca = 0.1, V0 = 100, Cb = 0.1) => {
  if (!pkas || pkas.length === 0) return -1;
  const alphas = calcAlphas(pH, pkas);
  const H = Math.pow(10, -pH);
  const OH = Math.pow(10, -(14 - pH));
  
  let n_prom = 0;
  for (let i = 1; i < alphas.length; i++) {
    n_prom += i * alphas[i];
  }
  
  const numerador = Ca * n_prom - H + OH;
  const denominador = Cb + H - OH;
  return V0 * (numerador / denominador);
};

// --- 3. COMPONENTE GRÁFICO REUTILIZABLE ---
const SvgChart = ({ children, xLabel, yLabel, xTicks, yTicks, xMin, xMax, yMin, yMax, width = 800, height = 350 }) => {
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-white rounded-lg border border-slate-200">
      <defs>
        <clipPath id={`chartArea-${xLabel}`}>
          <rect x={padding.left} y={padding.top} width={innerWidth} height={innerHeight} />
        </clipPath>
      </defs>
      
      {/* Grid lines & Y Axis Ticks */}
      {yTicks.map(tick => {
        const y = padding.top + innerHeight - ((tick - yMin) / (yMax - yMin)) * innerHeight;
        return (
          <g key={`grid-y-${tick}`}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
            <text x={padding.left - 10} y={y + 4} textAnchor="end" fill="#64748b" fontSize="11">{tick}</text>
          </g>
        );
      })}

      {/* Grid lines & X Axis Ticks */}
      {xTicks.map(tick => {
        const x = padding.left + ((tick - xMin) / (xMax - xMin)) * innerWidth;
        return (
          <g key={`grid-x-${tick}`}>
            <line x1={x} y1={padding.top} x2={x} y2={height - padding.bottom} stroke="#e2e8f0" strokeDasharray="4 4" />
            <text x={x} y={height - padding.bottom + 15} textAnchor="middle" fill="#64748b" fontSize="11">{tick}</text>
          </g>
        );
      })}

      {/* Axes Lines */}
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#475569" strokeWidth="2" />
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#475569" strokeWidth="2" />

      {/* Axis Labels */}
      <text x={padding.left + innerWidth / 2} y={height - 5} textAnchor="middle" fill="#334155" fontSize="12" fontWeight="bold">{xLabel}</text>
      <text x={15} y={padding.top + innerHeight / 2} transform={`rotate(-90 15 ${padding.top + innerHeight / 2})`} textAnchor="middle" fill="#334155" fontSize="12" fontWeight="bold">{yLabel}</text>

      {/* Chart Content */}
      <g clipPath={`url(#chartArea-${xLabel})`}>
        {children(padding.left, padding.top, innerWidth, innerHeight)}
      </g>
    </svg>
  );
};

export default function App() {
  // Estado global de pH
  const [globalPH, setGlobalPH] = useState(3.0);
  
  // Estado de los 3 "Slots" de ácidos
  const [slots, setSlots] = useState([
    { id: 'fosforico', pkas: [2.12, 7.20, 12.30], type: 3, color: '#3b82f6', dash: '' },       // Azul sólido
    { id: 'citrico', pkas: [3.13, 4.76, 6.33], type: 3, color: '#f97316', dash: '6 4' },     // Naranja punteado ancho
    { id: 'carbonico', pkas: [6.36, 10.33], type: 2, color: '#10b981', dash: '2 3' }         // Verde punteado corto
  ]);

  // Manejador de cambio de ácido en un slot
  const handleAcidChange = (slotIndex, newId) => {
    const dbAcid = ACID_DB.find(a => a.id === newId);
    const newSlots = [...slots];
    newSlots[slotIndex] = {
      ...newSlots[slotIndex],
      id: dbAcid.id,
      pkas: [...dbAcid.pkas],
      type: dbAcid.type
    };
    setSlots(newSlots);
  };

  // Manejador de cambio manual de pKa
  const handlePkaChange = (slotIndex, pkaIndex, value) => {
    const newSlots = [...slots];
    newSlots[slotIndex].pkas[pkaIndex] = parseFloat(value);
    setSlots(newSlots);
  };

  // Helper para generar SVG Paths
  const makePath = (data, mapX, mapY) => {
    if (data.length === 0) return "";
    return "M " + data.map(d => `${mapX(d.x)},${mapY(d.y)}`).join(" L ");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* HEADER */}
        <header className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Database className="text-blue-600" />
              Simulador Multivariable UBA
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Laboratorio de Ácidos Polipróticos (Hasta 3 especies simultáneas)</p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-100 px-5 py-3 rounded-xl border border-slate-200">
            <span className="font-semibold text-slate-600 whitespace-nowrap">pH del Sistema:</span>
            <span className="text-2xl font-bold text-blue-600 w-16 text-center">{globalPH.toFixed(2)}</span>
            <input 
              type="range" min="0" max="14" step="0.1" value={globalPH}
              onChange={(e) => setGlobalPH(parseFloat(e.target.value))}
              className="w-40 md:w-64 cursor-pointer accent-blue-600"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* PANLES IZQUIERDOS: SELECTORES DE ÁCIDOS */}
          <div className="lg:col-span-3 space-y-4">
            {slots.map((slot, sIdx) => (
              <div key={`slot-${sIdx}`} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div 
                  className="h-2 w-full" 
                  style={{ backgroundColor: slot.type > 0 ? slot.color : '#e2e8f0' }}
                />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Beaker size={16} color={slot.type > 0 ? slot.color : '#94a3b8'} />
                    <span className="font-semibold text-slate-700 text-sm">Sistema {sIdx + 1}</span>
                  </div>
                  
                  <select 
                    value={slot.id}
                    onChange={(e) => handleAcidChange(sIdx, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 mb-4 font-semibold"
                    style={{ color: slot.type > 0 ? slot.color : '#64748b' }}
                  >
                    {ACID_DB.map(acid => (
                      <option key={acid.id} value={acid.id}>{acid.name}</option>
                    ))}
                  </select>

                  {/* Sliders de pKa Dinámicos */}
                  {slot.type > 0 && (
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      {slot.pkas.map((pka, pIdx) => (
                        <div key={`pka-${sIdx}-${pIdx}`}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500 font-medium">pKₐ{pIdx + 1}</span>
                            <span className="font-bold text-slate-700">{pka.toFixed(2)}</span>
                          </div>
                          <input 
                            type="range" min="0" max="14" step="0.01" value={pka}
                            onChange={(e) => handlePkaChange(sIdx, pIdx, e.target.value)}
                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            style={{ accentColor: slot.color }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* PANEL DERECHO: GRÁFICOS */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            
            {/* LEYENDA CENTRALIZADA */}
            <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-6 items-center justify-center text-sm font-medium">
              {slots.map((slot, sIdx) => {
                if (slot.type === 0) return null;
                const dbInfo = ACID_DB.find(a => a.id === slot.id);
                return (
                  <div key={`legend-${sIdx}`} className="flex items-center gap-2">
                    <svg width="30" height="10">
                      <line x1="0" y1="5" x2="30" y2="5" stroke={slot.color} strokeWidth="3" strokeDasharray={slot.dash} />
                    </svg>
                    <span style={{ color: slot.color }}>{dbInfo.name}</span>
                  </div>
                );
              })}
            </div>

            {/* GRÁFICO 1: ESPECIACIÓN */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-4">
                <Activity className="text-emerald-500" />
                Curvas de Especiación (Fracción Molar α vs pH)
              </h3>
              
              <SvgChart 
                xLabel="pH" yLabel="Fracción (α)" 
                xMin={0} xMax={14} yMin={0} yMax={1}
                xTicks={[0, 2, 4, 6, 8, 10, 12, 14]}
                yTicks={[0, 0.25, 0.5, 0.75, 1]}
              >
                {(left, top, w, h) => {
                  const mapX = x => left + (x / 14) * w;
                  const mapY = y => top + h - (y * h);
                  
                  return (
                    <>
                      {slots.map((slot, sIdx) => {
                        if (slot.type === 0) return null;
                        
                        // Generar data para este slot
                        const pathsData = Array(slot.type + 1).fill().map(() => []);
                        for (let p = 0; p <= 14; p += 0.1) {
                          const alphas = calcAlphas(p, slot.pkas);
                          alphas.forEach((alpha, aIdx) => {
                            pathsData[aIdx].push({ x: p, y: alpha });
                          });
                        }

                        // Dibujar cada especie del slot
                        return pathsData.map((data, aIdx) => (
                          <path 
                            key={`spec-${sIdx}-${aIdx}`} 
                            d={makePath(data, mapX, mapY)} 
                            fill="none" stroke={slot.color} strokeWidth="2.5" strokeDasharray={slot.dash} opacity="0.8" 
                          />
                        ));
                      })}

                      {/* Línea de pH Global */}
                      <line x1={mapX(globalPH)} y1={top} x2={mapX(globalPH)} y2={top + h} stroke="#0f172a" strokeWidth="2" strokeDasharray="4 2" opacity="0.5" />
                    </>
                  )
                }}
              </SvgChart>
            </div>

            {/* GRÁFICO 2: TITULACIÓN */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-4">
                <BarChart2 className="text-indigo-500" />
                Curvas de Titulación (100 mL de Ácido 0.1M con NaOH 0.1M)
              </h3>
              
              <SvgChart 
                xLabel="Volumen de NaOH añadido (mL)" yLabel="pH" 
                xMin={0} xMax={350} yMin={0} yMax={14}
                xTicks={[0, 50, 100, 150, 200, 250, 300, 350]}
                yTicks={[0, 2, 4, 6, 8, 10, 12, 14]}
              >
                {(left, top, w, h) => {
                  const maxVol = 350;
                  const mapX = x => left + (x / maxVol) * w;
                  const mapY = y => top + h - (y / 14) * h;
                  
                  return (
                    <>
                      {slots.map((slot, sIdx) => {
                        if (slot.type === 0) return null;
                        
                        // Generar data de titulación para este slot
                        const titData = [];
                        for (let p = 1.0; p <= 13.5; p += 0.05) {
                          const vol = calcTitrationVolume(p, slot.pkas);
                          if (vol >= 0 && vol <= maxVol) {
                            titData.push({ x: vol, y: p });
                          }
                        }

                        return (
                          <g key={`tit-group-${sIdx}`}>
                            <path 
                              d={makePath(titData, mapX, mapY)} 
                              fill="none" stroke={slot.color} strokeWidth="3" strokeDasharray={slot.dash} 
                            />
                            {/* Líneas horizontales pKa */}
                            {slot.pkas.map((pka, pIdx) => (
                              <line 
                                key={`tit-pka-${sIdx}-${pIdx}`} 
                                x1={left} y1={mapY(pka)} x2={left+w} y2={mapY(pka)} 
                                stroke={slot.color} strokeWidth="1" strokeDasharray="2 2" opacity="0.3" 
                              />
                            ))}
                          </g>
                        );
                      })}

                      {/* Línea de pH Global */}
                      <line x1={left} y1={mapY(globalPH)} x2={left+w} y2={mapY(globalPH)} stroke="#0f172a" strokeWidth="2" strokeDasharray="4 2" opacity="0.5" />
                    </>
                  )
                }}
              </SvgChart>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}