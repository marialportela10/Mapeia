import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Property } from '../types';
import { Clock, AlertTriangle, ShieldAlert, CheckCircle2, ChevronRight, X, Building, DollarSign, Maximize, MapPin, History, FileText, User, Users, Building2 } from 'lucide-react';
import { Button } from './ui/button';
import { updateProperty, getPropertyHistory, addPropertyHistory } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { PropertyHistory } from '../types';
import fallbackImage from "../../imports/image_2.png";
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PropertyCardProps {
  property: Property;
  onClose: () => void;
  onUpdate?: () => void;
}

const statusConfig = {
  security_risk: {
    icon: ShieldAlert,
    color: 'text-[#EC3759]',
    bg: 'bg-[#EC3759]/10',
    border: 'border-[#EC3759]/20',
    label: 'Risco de Segurança',
    alert: true,
    alertBg: 'bg-[#EC3759]'
  },
  structural_risk: {
    icon: AlertTriangle,
    color: 'text-[#8C3A27]',
    bg: 'bg-[#F2C94C]/20',
    border: 'border-[#F2C94C]/40',
    label: 'Risco Estrutural',
    alert: true,
    alertBg: 'bg-[#8C3A27]'
  },
  monitoring: {
    icon: CheckCircle2,
    color: 'text-[#3B5935]',
    bg: 'bg-[#3B5935]/10',
    border: 'border-[#3B5935]/20',
    label: 'Em Monitoramento',
    alert: false,
    alertBg: ''
  },
  sanitary_waste: {
    icon: AlertTriangle,
    color: 'text-[#8C3A27]',
    bg: 'bg-[#8C3A27]/10',
    border: 'border-[#8C3A27]/20',
    label: 'Risco Sanitário — Resíduos',
    alert: true,
    alertBg: 'bg-[#8C3A27]'
  },
  zoonosis_risk: {
    icon: AlertTriangle,
    color: 'text-[#F97316]',
    bg: 'bg-[#F97316]/10',
    border: 'border-[#F97316]/20',
    label: 'Risco Sanitário — Zoonoses',
    alert: true,
    alertBg: 'bg-[#F97316]'
  }
} as Record<string, { icon: React.ElementType; color: string; bg: string; border: string; label: string; alert: boolean; alertBg: string }>;

export function PropertyCard({ property, onClose, onUpdate }: PropertyCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const [currentProperty, setCurrentProperty] = useState(property);
  const [history, setHistory] = useState<PropertyHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    setCurrentProperty(property);
  }, [property]);

  useEffect(() => {
    if (activeTab === 'history') {
      setLoadingHistory(true);
      getPropertyHistory(currentProperty.id)
        .then(setHistory)
        .catch(console.error)
        .finally(() => setLoadingHistory(false));
    }
  }, [activeTab, currentProperty.id]);

  const handleStatusChange = async (newStatus: any) => {
    const updated = { ...currentProperty, status: newStatus };
    setCurrentProperty(updated);
    setIsUpdatingStatus(false);
    try {
      await updateProperty(currentProperty.id, { status: newStatus });
      await addPropertyHistory(currentProperty.id, {
        action: `Status alterado para ${statusConfig[newStatus]?.label || newStatus}`,
        author: user?.name || user?.email || 'Usuário Anônimo',
        agency: user?.agency || 'Defesa Civil'
      });
      // Refresh history if we are currently looking at it
      if (activeTab === 'history') {
        const newHistory = await getPropertyHistory(currentProperty.id);
        setHistory(newHistory);
      }
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to update status', err);
      setCurrentProperty(currentProperty); // revert on error
    }
  };

  const config = statusConfig[currentProperty.status] || statusConfig['monitoring'];
  const StatusIcon = config.icon;
  const isAlert = (currentProperty.risks && currentProperty.risks.length > 0)
    ? currentProperty.risks.some(r => statusConfig[r as keyof typeof statusConfig]?.alert)
    : config.alert;

  return (
    <div className="fixed md:absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:right-6 md:top-6 md:left-auto md:translate-x-0 md:translate-y-0 w-[90vw] md:w-96 max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col z-[35] md:z-20 animate-in fade-in md:slide-in-from-right-8 duration-300">
      {/* Header */}
      <div className="relative h-32 shrink-0 bg-gray-100">
        <ImageWithFallback 
          src={currentProperty.imageUrl || fallbackImage} 
          alt="Imóvel" 
          className="w-full h-full object-cover"
        />
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm"
        >
          <X className="w-4 h-4" />
        </Button>
        
        {isAlert && (
          <div className={`absolute -bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-xs shadow-md ${config.alertBg || 'bg-[#EC3759]'} text-white`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            Atenção Crítica
          </div>
        )}
      </div>

      <div className="p-5 pt-8 overflow-y-auto flex-1">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#1E1E1E] leading-tight mb-1">
            {currentProperty.address}
          </h2>
          <div className="flex items-center text-sm text-[#1E1E1E]/60 gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {currentProperty.rpa}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#8C3A27]/10 mb-5">
          <Button
            onClick={() => setActiveTab('details')}
            variant="ghost"
            className={`flex-1 pb-3 rounded-none border-b-2 transition-colors ${activeTab === 'details' ? 'border-[#3B5935] text-[#3B5935]' : 'border-transparent text-[#1E1E1E]/50 hover:text-[#1E1E1E] hover:bg-transparent'}`}
          >
            Detalhes
          </Button>
          <Button
            onClick={() => setActiveTab('history')}
            variant="ghost"
            className={`flex-1 pb-3 rounded-none border-b-2 transition-colors ${activeTab === 'history' ? 'border-[#3B5935] text-[#3B5935]' : 'border-transparent text-[#1E1E1E]/50 hover:text-[#1E1E1E] hover:bg-transparent'}`}
          >
            <History className="w-4 h-4" /> Histórico
          </Button>
        </div>

        {activeTab === 'details' ? (
          <>
            {/* Status and Source Badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              {(currentProperty.risks && currentProperty.risks.length > 0 ? currentProperty.risks : [currentProperty.status]).map((riskKey, idx) => {
                const rConfig = statusConfig[riskKey as keyof typeof statusConfig] || statusConfig['monitoring'];
                const RIcon = rConfig.icon;
                return (
                  <div key={idx} className={`flex justify-center items-center px-3 py-2 rounded-lg border ${rConfig.bg} ${rConfig.border} ${rConfig.color}`} title={rConfig.label}>
                    <RIcon className="w-5 h-5" />
                  </div>
                );
              })}
              
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${currentProperty.source === 'citizen' ? 'bg-[#3B5935]/10 border-[#3B5935]/20 text-[#3B5935]' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                {currentProperty.source === 'citizen' ? (
                  <>
                    <Users className="w-4 h-4" />
                    <span className="font-semibold text-sm">Portal Cidadão</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span className="font-semibold text-sm">Sistema Interno</span>
                  </>
                )}
              </div>
            </div>

            {/* Crucial Data Row */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 rounded-xl p-3 border border-[#8C3A27]/10">
                <div className="flex items-center gap-1.5 text-xs text-[#1E1E1E]/60 font-medium mb-1">
                  <Clock className="w-3.5 h-3.5" /> Abandono
                </div>
                <div className="font-bold text-[#1E1E1E] text-sm">
                  {currentProperty.abandonmentTime}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-3 border border-[#8C3A27]/10">
                <div className="flex items-center gap-1.5 text-xs text-[#1E1E1E]/60 font-medium mb-1">
                  <Maximize className="w-3.5 h-3.5" /> Área Total
                </div>
                <div className="font-bold text-[#1E1E1E] text-sm">
                  {currentProperty.size} m²
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => navigate(`/property/${currentProperty.id}`)}
              >
                Ver detalhes completos
                <ChevronRight className="w-4 h-4" />
              </Button>

              <div className="grid grid-cols-2 gap-2 relative">
                {user?.role !== 'Visualizador' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/property/${currentProperty.id}/edit`)}
                  >
                    Editar informações
                  </Button>
                )}
                
                {isUpdatingStatus ? (
                  <select 
                    className={`w-full text-xs font-medium border border-[#3B5935] rounded-md bg-white text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#3B5935] px-2 py-1 shadow-sm ${user?.role === 'Visualizador' ? 'col-span-2' : ''}`}
                    value={currentProperty.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    onBlur={() => setIsUpdatingStatus(false)}
                    autoFocus
                  >
                    <option value="security_risk">Risco de Segurança</option>
                    <option value="structural_risk">Risco Estrutural</option>
                    <option value="sanitary_waste">Risco Sanitário — Resíduos</option>
                    <option value="zoonosis_risk">Risco Sanitário — Zoonoses</option>
                    <option value="monitoring">Em Monitoramento</option>
                  </select>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={user?.role === 'Visualizador' ? 'col-span-2' : ''}
                    onClick={() => {
                      if (user?.role !== 'Visualizador') {
                        setIsUpdatingStatus(true);
                      }
                    }}
                    disabled={user?.role === 'Visualizador'}
                  >
                    Atualizar status
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 animate-in fade-in">
            {loadingHistory ? (
              <div className="text-center text-sm text-[#1E1E1E]/50 py-4">Carregando histórico...</div>
            ) : history.length === 0 ? (
              <div className="text-center text-sm text-[#1E1E1E]/50 py-4">Nenhum registro encontrado.</div>
            ) : (
              history.map((entry, idx) => {
                const isLast = idx === history.length - 1;
                const isFirst = idx === 0;
                const d = entry.created_at ? new Date(entry.created_at) : null;
                const formattedDate = d 
                  ? `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Data desconhecida';

                return (
                  <div key={entry.id} className={`relative pl-6 ${isLast ? 'border-l-2 border-transparent' : isFirst ? 'border-l-2 border-[#3B5935]/20' : 'border-l-2 border-gray-200'}`}>
                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm ${isFirst ? 'bg-[#3B5935]' : 'bg-gray-300'}`}></div>
                    <div className="mb-1 text-xs font-bold text-[#1E1E1E]/50">{formattedDate}</div>
                    <p className="text-sm text-[#1E1E1E] font-medium leading-tight">{entry.action}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-[#1E1E1E]/60 bg-gray-50 w-fit px-2 py-1 rounded-md border border-gray-100">
                      <User className="w-3 h-3" /> {entry.author} {entry.agency ? `(${entry.agency})` : ''}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
