import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Building2, AlertTriangle, TrendingUp, MapPin, Download, Filter, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { getProperties } from '../lib/api';
import { Property, DISTRITOS_SANITARIOS, RISK_TYPES } from '../types';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const STATUS_LABELS: Record<string, string> = {
  monitoring: 'Monitoramento',
  structural_risk: 'Risco Estrutural',
  security_risk: 'Risco de Segurança',
  sanitary_waste: 'Risco Sanitário — Resíduos',
  zoonosis_risk: 'Risco Sanitário — Zoonoses',
};

const STATUS_COLORS: Record<string, string> = {
  monitoring: '#3B5935',
  structural_risk: '#F2C94C',
  security_risk: '#EC3759',
  sanitary_waste: '#8C3A27',
  zoonosis_risk: '#F97316',
};

function StatCard({ icon: Icon, label, value, sub, color, onClick }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string; onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl border border-[#8C3A27]/10 p-6 shadow-sm flex items-start gap-4 ${onClick ? 'cursor-pointer hover:border-[#8C3A27]/30 hover:shadow-md transition-all' : ''}`}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + '18' }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div>
        <p className="text-xs font-semibold text-[#1E1E1E]/50 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-extrabold text-[#1E1E1E] leading-none">{value}</p>
        {sub && <p className="text-xs text-[#1E1E1E]/50 mt-1.5">{sub}</p>}
      </div>
    </div>
  );
}

function AlertDot({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || '#8C3A27';
  return (
    <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: color }} />
  );
}

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  useEffect(() => {
    getProperties()
      .then(setProperties)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const exportToCSV = () => {
    setIsExportMenuOpen(false);
    const headers = ['ID', 'Endereço', 'Distrito', 'Status', 'Área (m²)', 'Dívida (R$)', 'Tempo de Abandono', 'Detalhes'];
    
    const escapeCSV = (str: string | number | undefined) => {
      if (str === undefined || str === null) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const csvRows = properties.map(p => {
      return [
        p.id,
        p.address,
        p.rpa,
        STATUS_LABELS[p.status] || p.status,
        p.size,
        p.debt,
        p.abandonmentTime,
        p.details || ''
      ].map(escapeCSV).join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_imoveis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    setIsExportMenuOpen(false);
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(30, 30, 30);
    doc.text('Relatório de Monitoramento - Mapeia Recife', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 30);

    // Summary
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text(`Total de Imóveis: ${properties.length}`, 14, 40);
    
    // Table
    const headers = [['Endereço', 'Distrito', 'Status', 'Área (m²)', 'Tempo de Abandono']];
    const data = properties.map(p => [
      p.address,
      p.rpa,
      STATUS_LABELS[p.status] || p.status,
      p.size.toString(),
      p.abandonmentTime
    ]);

    autoTable(doc, {
      startY: 45,
      head: headers,
      body: data,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [59, 89, 53], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 45 }
    });

    doc.save(`relatorio_imoveis_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const total = properties.length;

  const byDistrict = DISTRITOS_SANITARIOS.map((d) => ({
    name: d.short,
    fullName: d.label,
    districtId: d.value,
    count: properties.filter((p) => p.rpa === d.value).length,
  }));

  const byStatus = RISK_TYPES.map((r) => ({
    label: r.label,
    count: properties.filter((p) => p.status === r.value).length,
    color: r.color,
  }));

  const highRisk = properties
    .filter((p) => p.status === 'security_risk' || p.status === 'structural_risk')
    .slice(0, 8);

  const recentAlerts = [...properties]
    .filter((p) => p.status !== 'monitoring')
    .slice(0, 6);

  // Build district × risk matrix for the heatmap grid
  const heatMatrix = DISTRITOS_SANITARIOS.map((ds) => {
    const row: Record<string, number> = { district: 0 };
    RISK_TYPES.forEach((r) => {
      row[r.value] = properties.filter((p) => p.rpa === ds.value && p.status === r.value).length;
    });
    row.total = properties.filter((p) => p.rpa === ds.value).length;
    return { ds, counts: row };
  });
  const maxCell = Math.max(1, ...heatMatrix.flatMap(({ counts }) =>
    RISK_TYPES.map((r) => counts[r.value])
  ));

  const maxDistrict = byDistrict.reduce((a, b) => (b.count > a.count ? b : a), byDistrict[0]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-[#1E1E1E]/40 font-semibold">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 font-sans text-[#1E1E1E]">
      <div className="max-w-7xl mx-auto p-6 pb-16 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#1E1E1E]/40 uppercase tracking-widest mb-1">Mapeia · Análise</p>
            <h1 className="text-2xl font-extrabold text-[#1E1E1E]">Painel de Monitoramento</h1>
            <p className="text-sm text-[#1E1E1E]/50 mt-1">Visão geral dos imóveis monitorados no Recife</p>
          </div>
          
          <div className="relative self-start">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              onBlur={() => setTimeout(() => setIsExportMenuOpen(false), 200)}
              className="flex items-center gap-2 text-sm font-semibold text-[#3B5935] border border-[#3B5935]/30 px-4 py-2.5 rounded-xl hover:bg-[#3B5935]/5 transition-colors"
            >
              <Download className="w-4 h-4" /> 
              Exportar Relatório
              <ChevronDown className={`w-4 h-4 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#8C3A27]/15 rounded-xl shadow-lg overflow-hidden z-10 py-1">
                <button
                  onClick={exportToCSV}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#1E1E1E] hover:bg-gray-50 text-left"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#3B5935]" />
                  Exportar CSV
                </button>
                <button
                  onClick={exportToPDF}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#1E1E1E] hover:bg-gray-50 text-left"
                >
                  <FileText className="w-4 h-4 text-[#8C3A27]" />
                  Exportar PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Building2}
            label="Total Monitorados"
            value={total}
            sub="imóveis cadastrados"
            color="#3B5935"
            onClick={() => navigate('/properties')}
          />
          <StatCard
            icon={AlertTriangle}
            label="Alto Risco"
            value={byStatus.find(b => b.label.includes('Segurança'))?.count ?? 0}
            sub="risco de segurança"
            color="#EC3759"
            onClick={() => navigate('/properties', { state: { risk: 'security_risk' } })}
          />
          <StatCard
            icon={TrendingUp}
            label="Risco Estrutural"
            value={byStatus.find(b => b.label.includes('Estrutural'))?.count ?? 0}
            sub="ameaça de colapso"
            color="#F2C94C"
            onClick={() => navigate('/properties', { state: { risk: 'structural_risk' } })}
          />
          <StatCard
            icon={MapPin}
            label="Distrito com Mais Casos"
            value={maxDistrict?.name ?? '—'}
            sub={`${maxDistrict?.count ?? 0} imóveis · ${maxDistrict?.fullName}`}
            color="#8C3A27"
            onClick={() => navigate('/properties', { state: { district: maxDistrict?.districtId } })}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* District Bar Chart */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-[#8C3A27]/10 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-[#1E1E1E]">Concentração por Distrito Sanitário</h2>
                <p className="text-xs text-[#1E1E1E]/50 mt-0.5">Imóveis monitorados por DS (I–VIII)</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byDistrict} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
                <XAxis key="xaxis" dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: '#1E1E1E99' }} axisLine={false} tickLine={false} />
                <YAxis key="yaxis" allowDecimals={false} tick={{ fontSize: 11, fill: '#1E1E1E99' }} axisLine={false} tickLine={false} />
                <Tooltip
                  key="tooltip"
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-[#8C3A27]/15 rounded-xl shadow-lg px-4 py-3 text-sm">
                        <p className="font-bold text-[#1E1E1E]">{d.fullName}</p>
                        <p className="text-[#3B5935] font-semibold mt-1">{d.count} imóvel(is)</p>
                      </div>
                    );
                  }}
                />
                <Bar key="bar" dataKey="count" radius={[6, 6, 0, 0]} onClick={(data) => navigate('/properties', { state: { district: data.districtId || data.payload?.districtId } })} style={{ cursor: 'pointer' }}>
                  {byDistrict.map((entry, i) => (
                    <Cell
                      key={`bar-cell-${entry.name}-${i}`}
                      fill={entry.name === maxDistrict?.name ? '#3B5935' : '#3B5935AA'}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Breakdown */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#8C3A27]/10 shadow-sm p-6">
            <h2 className="font-bold text-[#1E1E1E] mb-1">Tipos de Risco</h2>
            <p className="text-xs text-[#1E1E1E]/50 mb-6">Distribuição por categoria</p>
            <div className="space-y-4">
              {byStatus.map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-[#1E1E1E]/70 leading-tight max-w-[70%]">{s.label}</span>
                    <span className="text-xs font-bold text-[#1E1E1E]">{s.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: total > 0 ? `${(s.count / total) * 100}%` : '0%',
                        backgroundColor: s.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Heatmap and Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Heatmap Grid — District × Risk */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-[#8C3A27]/10 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-[#1E1E1E]">Matriz de Risco por Distrito</h2>
                <p className="text-xs text-[#1E1E1E]/50 mt-0.5">Concentração de cada tipo de risco por Distrito Sanitário</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="text-xs font-semibold text-[#3B5935] hover:underline"
              >
                Ver no mapa →
              </button>
            </div>

            {properties.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-[#1E1E1E]/30 text-sm">
                Nenhum imóvel cadastrado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left font-semibold text-[#1E1E1E]/50 py-2 pr-3 whitespace-nowrap w-16">DS</th>
                      {RISK_TYPES.map((r) => (
                        <th key={r.value} className="text-center pb-2 px-1">
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full mb-1"
                            style={{ backgroundColor: r.color }}
                          />
                          <span className="block font-semibold text-[#1E1E1E]/50 leading-tight" style={{ maxWidth: 52 }}>
                            {r.label.split('—')[0].replace('Risco ', '').replace('Em ', '').trim()}
                          </span>
                        </th>
                      ))}
                      <th className="text-center pb-2 px-1 font-semibold text-[#1E1E1E]/50">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heatMatrix.map(({ ds, counts }) => (
                      <tr key={ds.value} className="border-t border-gray-100">
                        <td className="py-1.5 pr-3 font-bold text-[#1E1E1E]/70 whitespace-nowrap">{ds.short}</td>
                        {RISK_TYPES.map((r) => {
                          const n = counts[r.value];
                          const intensity = n / maxCell;
                          return (
                            <td key={r.value} className="text-center px-1 py-1.5">
                              <div
                                className="mx-auto flex items-center justify-center rounded-md font-bold transition-all"
                                style={{
                                  width: 32,
                                  height: 28,
                                  backgroundColor: n > 0 ? r.color + Math.round(intensity * 200 + 55).toString(16).padStart(2, '0') : '#F3F4F6',
                                  color: n > 0 ? (intensity > 0.5 ? '#fff' : r.color) : '#9CA3AF',
                                  fontSize: 11,
                                }}
                                title={`${ds.label}: ${n} imóvel(is) com ${r.label}`}
                              >
                                {n > 0 ? n : '–'}
                              </div>
                            </td>
                          );
                        })}
                        <td className="text-center px-1 py-1.5">
                          <span className={`inline-flex items-center justify-center w-8 h-7 rounded-md font-bold text-xs ${counts.total > 0 ? 'bg-gray-100 text-[#1E1E1E]' : 'text-gray-300'}`}>
                            {counts.total > 0 ? counts.total : '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-100">
              {RISK_TYPES.map((r) => (
                <div key={r.value} className="flex items-center gap-1.5 text-xs text-[#1E1E1E]/60">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: r.color }} />
                  {r.label.split('—')[0].trim()}
                </div>
              ))}
              <div className="flex items-center gap-1.5 text-xs text-[#1E1E1E]/40 ml-auto">
                Cor mais intensa = maior concentração
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#8C3A27]/10 shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-[#1E1E1E]">Alertas Recentes</h2>
                <p className="text-xs text-[#1E1E1E]/50 mt-0.5">Imóveis com risco ativo</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs font-semibold text-[#1E1E1E]/40 hover:text-[#1E1E1E] transition-colors">
                <Filter className="w-3.5 h-3.5" /> Filtrar
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto">
              {recentAlerts.length === 0 ? (
                <div className="text-sm text-[#1E1E1E]/30 text-center py-8">Nenhum alerta ativo</div>
              ) : (
                recentAlerts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/property/${p.id}`)}
                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                  >
                    <AlertDot status={p.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1E1E1E] truncate group-hover:text-[#3B5935] transition-colors">
                        {p.address}
                      </p>
                      <p className="text-xs text-[#1E1E1E]/50 mt-0.5">
                        {STATUS_LABELS[p.status]} · {p.rpa}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
            {recentAlerts.length > 0 && (
              <button
                onClick={() => navigate('/')}
                className="mt-4 pt-4 border-t border-gray-100 text-xs font-semibold text-[#3B5935] hover:underline w-full text-left"
              >
                Ver todos no mapa →
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
