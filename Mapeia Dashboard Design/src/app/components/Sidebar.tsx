import React from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, MapPin, Users, Building2 } from 'lucide-react';
import figmaIcon from "../../imports/Intersect.svg";
import { Button } from './ui/button';
import { DISTRITOS_SANITARIOS, Property, RISK_TYPES } from '../types';

interface SidebarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedRpa: string;
  setSelectedRpa: (rpa: string) => void;
  minSize: number;
  setMinSize: (size: number) => void;
  debtFilter: string;
  setDebtFilter: (filter: string) => void;
  riskFilter: string;
  setRiskFilter: (filter: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onOpenDenuncia: () => void;
  filteredProperties?: Property[];
  onSelectProperty?: (property: Property) => void;
}

export function Sidebar({
  searchTerm,
  setSearchTerm,
  selectedRpa,
  setSelectedRpa,
  minSize,
  setMinSize,
  debtFilter,
  setDebtFilter,
  riskFilter,
  setRiskFilter,
  isOpen,
  onToggle,
  filteredProperties = [],
  onSelectProperty,
}: SidebarProps) {
  return (
    <>
      <div
        className={`bg-white/95 backdrop-blur-xl border-r border-[#8C3A27]/20 h-full md:h-full flex flex-col shadow-2xl z-[70] fixed md:absolute left-0 top-0 transition-transform duration-300 ease-in-out w-[85vw] md:w-80 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Button
          onClick={onToggle}
          variant="outline"
          size="icon"
          className="absolute -right-12 top-6 rounded-r-xl border-l-0 z-20 hidden md:flex shadow-md"
        >
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </Button>

      <div className="p-6 pt-12 md:pt-6 border-b border-[#8C3A27]/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 text-[#EC3759]">
            <img src={figmaIcon} alt="Mapeia Logo" className="w-8 h-8 object-contain" />
            <h1 className="text-2xl font-bold tracking-tight text-[#212121]">Mapeia</h1>
          </div>
          <Button
            onClick={onToggle}
            variant="ghost"
            size="icon"
            className="md:hidden text-[#1E1E1E]/60 hover:text-[#1E1E1E] hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>
        <p className="text-sm text-[#1E1E1E]/70 mb-6">
          Monitoramento de imóveis abandonados no Recife.
        </p>

        <div className="relative">
          <Search className="absolute left-3 top-3.5 text-[#1E1E1E]/50 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#8C3A27]/20 rounded-xl text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5935] focus:bg-white transition-all text-[#1E1E1E]"
          />
          {searchTerm.trim().length > 0 && filteredProperties && filteredProperties.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#8C3A27]/20 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
              <div className="p-2 space-y-1">
                {filteredProperties.map(property => (
                  <button
                    key={property.id}
                    onClick={() => {
                      if (onSelectProperty) {
                        onSelectProperty(property);
                      }
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-start gap-2"
                  >
                    <MapPin className="w-4 h-4 mt-0.5 text-[#3B5935] shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-[#1E1E1E] line-clamp-1">{property.address}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-[#1E1E1E]/60">{property.rpa}</p>
                        {property.source === 'citizen' ? (
                          <span className="flex items-center gap-1 text-[10px] bg-[#3B5935]/10 text-[#3B5935] px-1.5 py-0.5 rounded">
                            <Users className="w-3 h-3" /> Cidadão
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            <Building2 className="w-3 h-3" /> Sistema
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {searchTerm.trim().length > 0 && filteredProperties && filteredProperties.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#8C3A27]/20 rounded-xl shadow-lg z-50 p-4 text-center">
              <p className="text-sm text-[#1E1E1E]/60">Nenhum imóvel encontrado.</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4 text-[#1E1E1E] font-semibold">
          <Filter className="w-4 h-4 text-[#8C3A27]" />
          <h2>Filtros</h2>
        </div>

        <div className="space-y-6">
          {/* Distrito Sanitário Filter */}
          <div>
            <label className="text-xs font-semibold text-[#1E1E1E]/60 uppercase tracking-wider mb-3 block">
              Distrito Sanitário
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                key="Todos"
                onClick={() => setSelectedRpa('Todos')}
                variant={selectedRpa === 'Todos' ? 'primary' : 'outline'}
                size="sm"
                className="rounded-lg"
              >
                Todos
              </Button>
              {DISTRITOS_SANITARIOS.map((ds) => (
                <Button
                  key={ds.value}
                  onClick={() => setSelectedRpa(ds.value)}
                  variant={selectedRpa === ds.value ? 'primary' : 'outline'}
                  size="sm"
                  className="rounded-lg"
                >
                  {ds.short}
                </Button>
              ))}
            </div>
          </div>

          {/* Tamanho Filter */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-semibold text-[#1E1E1E]/60 uppercase tracking-wider block">
                Tamanho do Lote Mín.
              </label>
              <span className="text-xs font-bold text-[#3B5935]">{minSize}m²</span>
            </div>
            <input
              type="range"
              className="w-full accent-[#3B5935]"
              min="0"
              max="2000"
              step="50"
              value={minSize}
              onChange={(e) => setMinSize(Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-[#1E1E1E]/50 mt-1">
              <span>0m²</span>
              <span>2000m²</span>
            </div>
          </div>

          {/* Categoria de Risco Filter */}
          <div>
            <label className="text-xs font-semibold text-[#1E1E1E]/60 uppercase tracking-wider mb-3 block">
              Categoria de Risco
            </label>
            <select
              className="w-full p-2.5 bg-white border border-[#8C3A27]/20 rounded-xl text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5935] text-[#1E1E1E]"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="Todos">Todas as Categorias</option>
              {RISK_TYPES.map((risk) => (
                <option key={risk.value} value={risk.value}>
                  {risk.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dívida Filter */}
          <div>
            <label className="text-xs font-semibold text-[#1E1E1E]/60 uppercase tracking-wider mb-3 block">
              Dívida Ativa
            </label>
            <select
              className="w-full p-2.5 bg-white border border-[#8C3A27]/20 rounded-xl text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5935] text-[#1E1E1E]"
              value={debtFilter}
              onChange={(e) => setDebtFilter(e.target.value)}
            >
              <option>Qualquer valor</option>
              <option>Até R$ 10.000</option>
              <option>R$ 10.000 - R$ 50.000</option>
              <option>Acima de R$ 50.000</option>
            </select>
          </div>

          <div className="pt-6 border-t border-[#8C3A27]/10">
            <h3 className="text-xs font-semibold text-[#1E1E1E]/60 uppercase tracking-wider mb-4 block">Legenda do Mapa</h3>
            <div className="space-y-3">
               <div className="flex items-center gap-3 text-sm text-[#1E1E1E]">
                 <div className="w-3 h-3 rounded-full bg-[#EC3759] shadow-sm shrink-0"></div>
                 Risco de Segurança (Ocupação/Tráfico)
               </div>
               <div className="flex items-center gap-3 text-sm text-[#1E1E1E]">
                 <div className="w-3 h-3 rounded-full bg-[#F2C94C] shadow-sm shrink-0"></div>
                 Risco Estrutural (Desabamento)
               </div>
               <div className="flex items-center gap-3 text-sm text-[#1E1E1E]">
                 <div className="w-3 h-3 rounded-full bg-[#8C3A27] shadow-sm shrink-0"></div>
                 Risco Sanitário — Resíduos
               </div>
               <div className="flex items-center gap-3 text-sm text-[#1E1E1E]">
                 <div className="w-3 h-3 rounded-full bg-[#F97316] shadow-sm shrink-0"></div>
                 Risco Sanitário — Zoonoses
               </div>
               <div className="flex items-center gap-3 text-sm text-[#1E1E1E]">
                 <div className="w-3 h-3 rounded-full bg-[#3B5935] shadow-sm shrink-0"></div>
                 Em Monitoramento
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Mobile Overlay */}
    {isOpen && (
      <div
        className="fixed inset-0 bg-black/40 z-[65] md:hidden backdrop-blur-sm"
        onClick={onToggle}
      />
    )}
    </>
  );
}
