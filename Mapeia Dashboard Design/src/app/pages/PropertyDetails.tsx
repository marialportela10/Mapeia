import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ChevronLeft, MapPin, Building, ShieldAlert, AlertTriangle, CheckCircle2,
  Clock, Maximize, FileText, User, Camera, Trash2, Edit, Plus, X, Loader2,
  Users, Building2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { getProperty, deleteProperty, getPropertyHistory, addPropertyHistory } from '../lib/api';
import { Property, PropertyHistory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import fallbackImage from "../../imports/image_2.png";
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const statusConfig = {
  security_risk:   { icon: ShieldAlert,   color: 'text-[#EC3759]', bg: 'bg-[#EC3759]/10',  border: 'border-[#EC3759]/20',  label: 'Risco de Segurança' },
  structural_risk: { icon: AlertTriangle, color: 'text-[#8C3A27]', bg: 'bg-[#F2C94C]/20',  border: 'border-[#F2C94C]/40',  label: 'Risco Estrutural' },
  monitoring:      { icon: CheckCircle2,  color: 'text-[#3B5935]', bg: 'bg-[#3B5935]/10',  border: 'border-[#3B5935]/20',  label: 'Em Monitoramento' },
  sanitary_waste:  { icon: AlertTriangle, color: 'text-[#8C3A27]', bg: 'bg-[#8C3A27]/10',  border: 'border-[#8C3A27]/20',  label: 'Risco Sanitário — Resíduos' },
  zoonosis_risk:   { icon: AlertTriangle, color: 'text-[#F97316]', bg: 'bg-[#F97316]/10',  border: 'border-[#F97316]/20',  label: 'Risco Sanitário — Zoonoses' },
} as Record<string, { icon: React.ElementType; color: string; bg: string; border: string; label: string }>;

const AGENCIES = [
  'Defesa Civil',
  'Secretaria de Planejamento Urbano (SEPLAN)',
  'Secretaria de Saúde',
  'Controle Urbano (DIRCON)',
  'Cidadão',
  'Outro',
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function AddHistoryModal({ propertyId, onClose, onSaved }: {
  propertyId: string;
  onClose: () => void;
  onSaved: (entry: PropertyHistory) => void;
}) {
  const [action, setAction] = useState('');
  const [author, setAuthor] = useState('');
  const [agency, setAgency] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action.trim() || !author.trim()) return;
    setSaving(true);
    try {
      const entry = await addPropertyHistory(propertyId, { action, author, agency });
      onSaved(entry);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar registro.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-[#1E1E1E] text-lg">Novo Registro de Histórico</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1E1E1E] mb-1.5">
              Descrição da Ação <span className="text-[#EC3759] font-normal">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={action}
              onChange={e => setAction(e.target.value)}
              placeholder="Ex: Vistoria técnica realizada, laudo emitido..."
              className="w-full px-4 py-3 bg-gray-50 border border-[#8C3A27]/20 rounded-xl text-sm focus:ring-2 focus:ring-[#3B5935] focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-[#1E1E1E] mb-1.5">
                Responsável <span className="text-[#EC3759] font-normal">*</span>
              </label>
              <input
                required
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="Nome do responsável"
                className="w-full px-3 py-2.5 bg-gray-50 border border-[#8C3A27]/20 rounded-xl text-sm focus:ring-2 focus:ring-[#3B5935] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1E1E1E] mb-1.5">Órgão</label>
              <select
                value={agency}
                onChange={e => setAgency(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-[#8C3A27]/20 rounded-xl text-sm focus:ring-2 focus:ring-[#3B5935] focus:outline-none"
              >
                <option value="">Selecione...</option>
                {AGENCIES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? 'Salvando...' : 'Salvar Registro'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PropertyDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [property, setProperty]   = useState<Property | null>(null);
  const [history, setHistory]      = useState<PropertyHistory[]>([]);
  const [tab, setTab]              = useState<'details' | 'history'>('details');
  const [loadingProp, setLoadingProp]   = useState(true);
  const [loadingHist, setLoadingHist]   = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProperty(id)
      .then(setProperty)
      .catch(console.error)
      .finally(() => setLoadingProp(false));
  }, [id]);

  useEffect(() => {
    if (!id || tab !== 'history') return;
    setLoadingHist(true);
    getPropertyHistory(id)
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoadingHist(false));
  }, [id, tab]);

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este imóvel?')) {
      if (id) { await deleteProperty(id); navigate('/'); }
    }
  };

  if (loadingProp) return <div className="p-8 text-center text-[#1E1E1E]">Carregando...</div>;
  if (!property)   return <div className="p-8 text-center text-[#1E1E1E]">Imóvel não encontrado.</div>;

  const config = statusConfig[property.status] || statusConfig['monitoring'];
  const StatusIcon = config.icon;

  return (
    <div className="h-full flex flex-col overflow-y-auto w-full bg-gray-50 font-sans text-[#1E1E1E] overflow-x-hidden">

      {/* Banner */}
      <div className="relative h-64 md:h-80 w-full bg-gray-900 shrink-0">
        <ImageWithFallback
          src={property.imageUrl || fallbackImage}
          alt="Fachada do Imóvel"
          className="w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between bg-gradient-to-b from-black/60 to-transparent">
          <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/20 -ml-2">
            <ChevronLeft className="w-4 h-4 mr-1" /> Voltar ao Mapa
          </Button>
          <div className="flex gap-2">
            {user?.role !== 'Visualizador' && (
              <>
                <Button onClick={() => navigate(`/property/${id}/edit`)} variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/20 bg-transparent">
                  <Edit className="w-4 h-4" />
                </Button>
                {user?.role === 'Admin' && (
                  <Button onClick={handleDelete} variant="danger" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-10 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex flex-wrap gap-2 mb-3">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-md ${config.bg} ${config.border} ${config.color} bg-white/90`}>
              <StatusIcon className="w-4 h-4 shrink-0" />
              <span className="font-bold text-sm">{config.label}</span>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-md ${property.source === 'citizen' ? 'bg-[#3B5935]/10 border-[#3B5935]/20 text-[#3B5935]' : 'bg-gray-100 border-gray-200 text-gray-700'} bg-white/90`}>
              {property.source === 'citizen' ? (
                <>
                  <Users className="w-4 h-4 shrink-0" />
                  <span className="font-bold text-sm">Portal Cidadão</span>
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span className="font-bold text-sm">Sistema Interno</span>
                </>
              )}
            </div>
          </div>
          <h1 className="text-xl md:text-4xl font-bold text-white leading-tight">{property.address}</h1>
          <div className="flex items-center text-white/80 gap-2 mt-2">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="font-medium text-sm md:text-base">{property.rpa}</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto p-4 md:p-6 -mt-4 md:-mt-6 relative z-10">

        {/* Tabs */}
        <div className="flex border-b border-[#8C3A27]/10 mb-6 bg-white rounded-t-2xl px-6 pt-4 shadow-sm border border-[#8C3A27]/10">
          <button
            onClick={() => setTab('details')}
            className={`pb-3 px-2 mr-6 text-sm font-bold border-b-2 transition-colors ${tab === 'details' ? 'border-[#3B5935] text-[#3B5935]' : 'border-transparent text-[#1E1E1E]/50 hover:text-[#1E1E1E]'}`}
          >
            Detalhes do Imóvel
          </button>
          <button
            onClick={() => setTab('history')}
            className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${tab === 'history' ? 'border-[#3B5935] text-[#3B5935]' : 'border-transparent text-[#1E1E1E]/50 hover:text-[#1E1E1E]'}`}
          >
            Histórico de Ações
            {history.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold bg-[#3B5935]/10 text-[#3B5935]">{history.length}</span>
            )}
          </button>
        </div>

        {/* ── TAB: DETAILS ── */}
        {tab === 'details' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { Icon: Clock,    label: 'Abandono',    value: property.abandonmentTime },
                  { Icon: Maximize, label: 'Área do Lote', value: `${property.size} m²` },
                  { Icon: Building, label: 'Inscrição',    value: 'Não informada' },
                  { Icon: FileText, label: 'Dívida Ativa', value: property.debt ? `R$ ${property.debt.toLocaleString('pt-BR')}` : 'Não calculada', highlight: !!property.debt },
                ].map(({ Icon, label, value, highlight }) => (
                  <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-[#8C3A27]/10 flex flex-col items-center text-center">
                    <Icon className="w-6 h-6 text-[#8C3A27] mb-2" />
                    <span className="text-xs text-[#1E1E1E]/60 font-semibold mb-1">{label}</span>
                    <span className={`font-bold text-sm ${highlight ? 'text-[#EC3759]' : 'text-[#1E1E1E]'}`}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#8C3A27]/10 mb-6">
                <h3 className="text-lg font-bold text-[#1E1E1E] mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#3B5935]" />
                  Riscos Identificados
                </h3>
                {property.risks && property.risks.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {property.risks.map(risk => {
                      const rConfig = statusConfig[risk] || statusConfig['monitoring'];
                      const RIcon = rConfig.icon;
                      return (
                        <div key={risk} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${rConfig.bg} ${rConfig.border} ${rConfig.color}`}>
                          <RIcon className="w-4 h-4 shrink-0" />
                          <span className="font-bold text-sm">{rConfig.label}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[#1E1E1E]/80 text-sm">Nenhum risco classificado (Em monitoramento).</p>
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#8C3A27]/10">
                <h3 className="text-lg font-bold text-[#1E1E1E] mb-4 border-b border-[#8C3A27]/10 pb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#3B5935]" />
                  Parecer da Vistoria Técnica
                </h3>
                
                <p className="text-[#1E1E1E]/80 text-sm leading-relaxed mb-6 whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-[#8C3A27]/10">
                  {property.details || 'Nenhum detalhe técnico registrado no momento.'}
                </p>

                {/* Anexos e Documentos */}
                <h4 className="text-sm font-bold text-[#1E1E1E] mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#8C3A27]" /> Anexos e Documentos
                </h4>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className={`flex flex-col p-4 rounded-xl border ${property.reportUrl ? 'border-[#8C3A27]/20 bg-white shadow-sm' : 'border-dashed border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${property.reportUrl ? 'bg-[#8C3A27]/10' : 'bg-gray-100'}`}>
                          <FileText className={`w-5 h-5 ${property.reportUrl ? 'text-[#8C3A27]' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${property.reportUrl ? 'text-[#1E1E1E]' : 'text-gray-400'}`}>Laudo Técnico</p>
                          <p className="text-xs text-[#1E1E1E]/50">Documento PDF</p>
                        </div>
                      </div>
                    </div>
                    {property.reportUrl ? (
                      <Button variant="outline" size="sm" className="w-full bg-white hover:bg-gray-50 text-[#8C3A27] border-[#8C3A27]/20" onClick={() => window.open(property.reportUrl, '_blank')}>
                        Visualizar Laudo
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full opacity-50 cursor-not-allowed border-dashed" disabled>
                        Não anexado
                      </Button>
                    )}
                  </div>

                  <div className={`flex flex-col p-4 rounded-xl border ${property.galleryUrls && property.galleryUrls.length > 0 ? 'border-[#3B5935]/20 bg-white shadow-sm' : 'border-dashed border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${property.galleryUrls && property.galleryUrls.length > 0 ? 'bg-[#3B5935]/10' : 'bg-gray-100'}`}>
                          <Camera className={`w-5 h-5 ${property.galleryUrls && property.galleryUrls.length > 0 ? 'text-[#3B5935]' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${property.galleryUrls && property.galleryUrls.length > 0 ? 'text-[#1E1E1E]' : 'text-gray-400'}`}>Galeria de Fotos</p>
                          <p className="text-xs text-[#1E1E1E]/50">
                            {property.galleryUrls ? `${property.galleryUrls.length} imagens` : 'Nenhuma imagem'}
                          </p>
                        </div>
                      </div>
                    </div>
                    {property.galleryUrls && property.galleryUrls.length > 0 ? (
                      <Button variant="outline" size="sm" className="w-full bg-white text-[#3B5935] border-[#3B5935]/20 pointer-events-none">
                        Fotos disponíveis abaixo
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full opacity-50 cursor-not-allowed border-dashed" disabled>
                        Não anexada
                      </Button>
                    )}
                  </div>
                </div>

                {property.galleryUrls && property.galleryUrls.length > 0 && (
                  <div className="pt-6 border-t border-[#8C3A27]/10">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {property.galleryUrls.map((url, index) => (
                        <div key={index} className="aspect-square rounded-xl overflow-hidden border border-[#8C3A27]/10 bg-gray-50 cursor-pointer hover:opacity-90 transition-transform hover:scale-[1.02] shadow-sm relative group" onClick={() => window.open(url, '_blank')}>
                          <ImageWithFallback src={url} alt={`Galeria ${index + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <Maximize className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar quick history preview */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#8C3A27]/10">
              <h3 className="text-base font-bold text-[#1E1E1E] mb-4 pb-3 border-b border-gray-100">Últimas Ações</h3>
              {history.length === 0 ? (
                <p className="text-sm text-[#1E1E1E]/40 text-center py-6">Nenhum registro ainda.</p>
              ) : (
                <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-[#3B5935]/40 before:to-transparent">
                  {history.slice(0, 3).map(h => (
                    <div key={h.id} className="relative flex items-start gap-4">
                      <div className="w-4 h-4 rounded-full bg-[#3B5935] ring-4 ring-white z-10 shrink-0 mt-1" />
                      <div>
                        <span className="text-xs font-bold text-[#1E1E1E]/50">{formatDate(h.created_at)}</span>
                        <p className="text-sm font-semibold text-[#1E1E1E] mt-0.5 leading-snug">{h.action}</p>
                        {(h.author || h.agency) && (
                          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#1E1E1E]/60">
                            <User className="w-3 h-3" /> {h.author}{h.agency ? ` (${h.agency})` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" className="w-full mt-5" onClick={() => setTab('history')}>
                Ver histórico completo
              </Button>
            </div>
          </div>
        )}

        {/* ── TAB: HISTORY ── */}
        {tab === 'history' && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#8C3A27]/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-[#1E1E1E] text-lg">Histórico de Ações</h3>
                <p className="text-xs text-[#1E1E1E]/50 mt-0.5">
                  {history.length > 0 ? `${history.length} registro(s) encontrado(s)` : 'Nenhum registro ainda'}
                </p>
              </div>
              {user?.role !== 'Visualizador' && (
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4" /> Adicionar Registro
                </Button>
              )}
            </div>

            {loadingHist ? (
              <div className="py-16 flex items-center justify-center gap-2 text-[#1E1E1E]/40">
                <Loader2 className="w-5 h-5 animate-spin" /> Carregando histórico...
              </div>
            ) : history.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-7 h-7 text-gray-400" />
                </div>
                <p className="font-semibold text-[#1E1E1E]/50">Nenhum registro de ação ainda.</p>
                <p className="text-sm text-[#1E1E1E]/30 mt-1">Clique em "Adicionar Registro" para começar o histórico deste imóvel.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[7px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-[#3B5935]/40 via-gray-200 to-transparent" />
                <div className="space-y-6">
                  {history.map((h, i) => (
                    <div key={h.id} className="relative flex items-start gap-5 pl-1">
                      <div className={`w-4 h-4 rounded-full ring-4 ring-white z-10 shrink-0 mt-1 ${i === 0 ? 'bg-[#3B5935]' : 'bg-gray-300'}`} />
                      <div className="flex-1 pb-1">
                        <span className="text-xs font-bold text-[#1E1E1E]/50">{formatDate(h.created_at)}</span>
                        <p className="text-sm font-semibold text-[#1E1E1E] mt-0.5 leading-snug">{h.action}</p>
                        {(h.author || h.agency) && (
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-[#1E1E1E]/60 bg-gray-50 w-fit px-2.5 py-1 rounded-lg border border-gray-100">
                            <User className="w-3 h-3" />
                            {h.author}{h.agency ? ` · ${h.agency}` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {showAddModal && id && (
        <AddHistoryModal
          propertyId={id}
          onClose={() => setShowAddModal(false)}
          onSaved={entry => setHistory(prev => [entry, ...prev])}
        />
      )}
    </div>
  );
}
