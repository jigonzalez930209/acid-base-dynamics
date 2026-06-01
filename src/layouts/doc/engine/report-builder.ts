/**
 * HTML report builder for the DocDashboard.
 *
 * Generates a self-contained HTML string with all statistics and figure placeholders.
 * The HTML is print-ready and has no external dependencies.
 */

import type { GroupStats } from "./aggregator"

export type ReportInput = {
  title: string
  date: string
  n: number
  stats: GroupStats
  byGroup: { label: string; stats: GroupStats }[]
}

function pct(rate: number): string {
  return (rate * 100).toFixed(1) + "%"
}

function fmt(n: number, dec = 2): string {
  return n.toFixed(dec)
}

export function buildHTMLReport(input: ReportInput): string {
  const { title, date, n, stats, byGroup } = input

  const groupRows = byGroup
    .map(
      (g) => `
      <tr>
        <td>${g.label}</td>
        <td>${g.stats.n}</td>
        <td>${fmt(g.stats.mean)} %</td>
        <td>${fmt(g.stats.median)} %</td>
        <td>${fmt(g.stats.stdDev)} %</td>
        <td>${pct(g.stats.successRate1)}</td>
        <td>${g.stats.successRate2 !== null ? pct(g.stats.successRate2) : "—"}</td>
      </tr>`,
    )
    .join("")

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, Arial, sans-serif; font-size: 12px; color: #111; padding: 24px; max-width: 900px; margin: auto; }
    h1 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
    h2 { font-size: 14px; font-weight: 600; margin: 20px 0 8px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
    p.meta { font-size: 11px; color: #666; margin-bottom: 20px; }
    .kpi { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
    .kpi-card { border: 1px solid #ddd; border-radius: 6px; padding: 10px 16px; min-width: 120px; }
    .kpi-value { font-size: 22px; font-weight: 700; color: #1d4ed8; }
    .kpi-label { font-size: 10px; color: #666; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #f0f4ff; text-align: left; padding: 6px 8px; font-weight: 600; border: 1px solid #ddd; }
    td { padding: 5px 8px; border: 1px solid #ddd; }
    tr:nth-child(even) { background: #f9f9f9; }
    .privacy-note { margin-top: 24px; font-size: 10px; color: #888; border-top: 1px solid #eee; padding-top: 12px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="meta">Generado el ${date} · ${n} registros · acid-base-dynamics (análisis local, sin servidor)</p>

  <h2>Resumen ejecutivo</h2>
  <div class="kpi">
    <div class="kpi-card">
      <div class="kpi-value">${n}</div>
      <div class="kpi-label">Total de registros</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">${pct(stats.successRate1)}</div>
      <div class="kpi-label">Tasa de éxito (1er intento)</div>
    </div>
    ${stats.successRate2 !== null ? `
    <div class="kpi-card">
      <div class="kpi-value">${pct(stats.successRate2)}</div>
      <div class="kpi-label">Tasa de éxito (duplicado)</div>
    </div>` : ""}
    <div class="kpi-card">
      <div class="kpi-value">${fmt(stats.mean)} %</div>
      <div class="kpi-label">Error medio (|%|)</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-value">${fmt(stats.median)} %</div>
      <div class="kpi-label">Error mediano</div>
    </div>
  </div>

  <h2>Estadísticos por grupo</h2>
  <table>
    <thead>
      <tr>
        <th>Grupo</th>
        <th>N</th>
        <th>Error medio</th>
        <th>Mediana</th>
        <th>Desvío</th>
        <th>Éxito 1er int.</th>
        <th>Éxito dup.</th>
      </tr>
    </thead>
    <tbody>${groupRows}</tbody>
  </table>

  <p class="privacy-note">
    Este reporte fue generado íntegramente en el navegador del usuario. Ningún dato fue transmitido
    a servidores externos. Compatible con la normativa de privacidad de datos estudiantiles.
  </p>
</body>
</html>`
}
