import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { getProperties } from '../lib/api';
import { Property, DISTRITOS_SANITARIOS, RISK_TYPES } from '../types';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';

const STATUS_COLORS: Record<string, string> = {
  monitoring: '#3B5935',
  structural_risk: '#F2C94C',
  security_risk: '#EC3759',
  sanitary_waste: '#8C3A27',
  zoonosis_risk: '#F97316',
};

const STATUS_LABELS: Record<string, string> = {
  monitoring: 'Monitoramento',
  structural_risk: 'Risco Estrutural',
  security_risk: 'Risco de Segurança',
  sanitary_waste: 'Risco Sanitário — Resíduos',
  zoonosis_risk: 'Risco Sanitário — Zoonoses',
};

type SortKey = 'address' | 'rpa' | 'status' | 'size' | 'debt' | 'abandonmentTime';
type SortDir = 'asc' | 'desc';

const ABANDONMENT_ORDER: Record<string, number> = {
  'Menos de 1 ano': 1,
  '1 a 3 anos': 2,
  '3 a 5 anos': 3,
  'Mais de 5 anos': 4,
  'Desconhecido': 0,
};

const RISK_ORDER: Record<string, number> = {
  security_risk: 5,
  structural_risk: 4,
  sanitary_waste: 3,
  zoonosis_risk: 2,
  monitoring: 1,
};

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />;
  return sortDir === 'asc'
    ? <ArrowUp className="w-3.5 h-3.5 text-[#3B5935]" />
    : <ArrowDown className="w-3.5 h-3.5 text-[#3B5935]" />;
}

function RiskBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || '#8C3A27';
  const label = STATUS_LABELS[status] || status;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: color + '18', color }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

export default function PropertyList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState(location.state?.district || '');
  const [riskFilter, setRiskFilter] = useState(location.state?.risk || '');
  const [sortKey, setSortKey] = useState<SortKey>('status');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    getProperties()
      .then(setProperties)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = useMemo(() => {
    const filtered = properties.filter(p => {
      const matchSearch = p.address.toLowerCase().includes(search.toLowerCase());
      const matchDistrict = !districtFilter || p.rpa === districtFilter;
      const matchRisk = !riskFilter || p.status === riskFilter;
      return matchSearch && matchDistrict && matchRisk;
    });

    return [...filtered].sort((a, b) => {
      let va: string | number;
      let vb: string | number;

      if (sortKey === 'size') { va = a.size; vb = b.size; }
      else if (sortKey === 'debt') { va = a.debt; vb = b.debt; }
      else if (sortKey === 'status') { va = RISK_ORDER[a.status] ?? 0; vb = RISK_ORDER[b.status] ?? 0; }
      else if (sortKey === 'abandonmentTime') { va = ABANDONMENT_ORDER[a.abandonmentTime] ?? 0; vb = ABANDONMENT_ORDER[b.abandonmentTime] ?? 0; }
      else { va = (a[sortKey] as string).toLowerCase(); vb = (b[sortKey] as string).toLowerCase(); }

      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [properties, search, districtFilter, riskFilter, sortKey, sortDir]);

  const ColHeader = ({ label, col }: { label: string; col: SortKey }) => (
    <button
      onClick={() => handleSort(col)}
      className="flex items-center gap-1.5 font-semibold text-[#1E1E1E]/60 uppercase tracking-wider text-xs hover:text-[#1E1E1E] transition-colors group"
    >
      {label}
      <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
    </button>
  );

  return (
    <div className="h-full overflow-y-auto bg-gray-50 font-sans text-[#1E1E1E]">
      <div className="max-w-7xl mx-auto p-6 pb-16 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#1E1E1E]/40 uppercase tracking-widest mb-1">Mapeia · Inventário</p>
            <h1 className="text-2xl font-extrabold text-[#1E1E1E]">Lista de Imóveis Monitorados</h1>
            <p className="text-sm text-[#1E1E1E]/50 mt-1">
              {loading ? 'Carregando...' : `${sorted.length} imóvel(is) encontrado(s)`}
            </p>
          </div>
          {user?.role !== 'Visualizador' && (
            <Button variant="primary" onClick={() => navigate('/property/new')}>
              + Cadastrar Imóvel
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-[#8C3A27]/10 shadow-sm p-4 flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="relative w-full md:flex-1 md:min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1E1E1E]/40" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por endereço..."
              className="w-full pl-10 pr-4 py-2.5 border border-[#8C3A27]/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5935]"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <SlidersHorizontal className="w-4 h-4 text-[#1E1E1E]/40 shrink-0" />
              <select
                value={districtFilter}
                onChange={e => setDistrictFilter(e.target.value)}
                className="flex-1 sm:flex-none md:w-52 px-3 py-2.5 border border-[#8C3A27]/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5935] bg-white"
              >
                <option value="">Todos os Distritos</option>
                {DISTRITOS_SANITARIOS.map(ds => (
                  <option key={ds.value} value={ds.value}>{ds.label}</option>
                ))}
              </select>
            </div>

            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value)}
              className="w-full sm:w-auto md:w-52 px-3 py-2.5 border border-[#8C3A27]/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5935] bg-white"
            >
              <option value="">Todos os Riscos</option>
              {RISK_TYPES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#8C3A27]/10 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-[#1E1E1E]/40 font-semibold">Carregando imóveis...</div>
          ) : sorted.length === 0 ? (
            <div className="p-12 text-center text-[#1E1E1E]/40 font-semibold">Nenhum imóvel encontrado com os filtros atuais.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#8C3A27]/10">
                    <th className="px-5 py-3.5 w-8 text-xs font-semibold text-[#1E1E1E]/40">#</th>
                    <th className="px-5 py-3.5">
                      <ColHeader label="Endereço" col="address" />
                    </th>
                    <th className="px-5 py-3.5">
                      <ColHeader label="Distrito Sanitário" col="rpa" />
                    </th>
                    <th className="px-5 py-3.5">
                      <ColHeader label="Tipo de Risco" col="status" />
                    </th>
                    <th className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end">
                        <ColHeader label="Área (m²)" col="size" />
                      </div>
                    </th>
                    <th className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end">
                        <ColHeader label="Dívida (R$)" col="debt" />
                      </div>
                    </th>
                    <th className="px-5 py-3.5">
                      <ColHeader label="Tempo Abandono" col="abandonmentTime" />
                    </th>
                    <th className="px-5 py-3.5 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8C3A27]/5">
                  {sorted.map((p, i) => (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/property/${p.id}`)}
                      className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-4 text-xs text-[#1E1E1E]/30 font-medium">{i + 1}</td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-sm text-[#1E1E1E] group-hover:text-[#3B5935] transition-colors leading-tight block max-w-xs truncate">
                          {p.address}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-[#1E1E1E]/70 whitespace-nowrap">{p.rpa}</span>
                      </td>
                      <td className="px-5 py-4">
                        <RiskBadge status={p.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-medium text-[#1E1E1E]">
                          {p.size ? p.size.toLocaleString('pt-BR') : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-medium text-[#1E1E1E]">
                          {p.debt ? `R$ ${p.debt.toLocaleString('pt-BR')}` : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-[#1E1E1E]/70 whitespace-nowrap">{p.abandonmentTime}</span>
                      </td>
                      <td className="px-5 py-4">
                        <ChevronRight className="w-4 h-4 text-[#1E1E1E]/30 group-hover:text-[#3B5935] transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer count */}
          {!loading && sorted.length > 0 && (
            <div className="px-5 py-3 border-t border-[#8C3A27]/10 bg-gray-50/50 flex items-center justify-between">
              <span className="text-xs text-[#1E1E1E]/40 font-medium">
                Exibindo {sorted.length} de {properties.length} imóveis
              </span>
              <div className="flex items-center gap-3 text-xs text-[#1E1E1E]/40">
                {RISK_TYPES.filter(r => sorted.some(p => p.status === r.value)).map(r => (
                  <span key={r.value} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                    {sorted.filter(p => p.status === r.value).length} {r.label.split('—')[0].trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
