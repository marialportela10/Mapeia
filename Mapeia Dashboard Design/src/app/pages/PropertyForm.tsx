import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Building, MapPin as MapPinIcon, ShieldAlert,
  UploadCloud, CheckCircle2, ChevronRight, ChevronLeft, Save,
  FileText, Camera, X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { getProperty, createProperty, updateProperty, deleteProperty, uploadFile, addPropertyHistory } from '../lib/api';
import { DISTRITOS_SANITARIOS, RISK_TYPES, derivePrimaryStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';

const geocodeAddress = async (address: string) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Recife, Pernambuco, Brasil')}&limit=1`);
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
  }
  return null;
};

export default function PropertyForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const { user } = useAuth();
  const [formData, setFormData] = useState({
    address: '',
    rpa: 'DS I',
    size: 0,
    debt: 0,
    abandonmentTime: 'Menos de 1 ano',
    details: '',
    lat: -8.0476,
    lng: -34.8770,
    imageUrl: '',
    reportUrl: '',
    galleryUrls: [] as string[],
    source: 'system' as 'system' | 'citizen',
  });

  const [selectedRisks, setSelectedRisks] = useState<string[]>(['monitoring']);

  useEffect(() => {
    if (isEditing && id) {
      getProperty(id).then(data => {
        setFormData({
          address: data.address,
          rpa: data.rpa,
          size: data.size || 0,
          debt: data.debt || 0,
          abandonmentTime: data.abandonmentTime,
          details: data.details || '',
          lat: data.lat,
          lng: data.lng,
          imageUrl: data.imageUrl || '',
          reportUrl: data.reportUrl || '',
          galleryUrls: data.galleryUrls || [],
          source: data.source || 'system',
        });
        setSelectedRisks(data.risks && data.risks.length > 0 ? data.risks : [data.status]);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [id, isEditing]);

  const toggleRisk = (value: string) => {
    setSelectedRisks(prev => {
      if (value === 'monitoring') return ['monitoring'];
      const withoutMonitoring = prev.filter(r => r !== 'monitoring');
      if (withoutMonitoring.includes(value)) {
        const next = withoutMonitoring.filter(r => r !== value);
        return next.length === 0 ? ['monitoring'] : next;
      }
      return [...withoutMonitoring, value];
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (err: any) {
      console.error(err);
      alert('Erro ao fazer upload da imagem: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (formData.galleryUrls.length + files.length > 5) {
      alert('Você pode anexar no máximo 5 fotos na galeria.');
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const url = await uploadFile(file);
        uploadedUrls.push(url);
      }
      setFormData(prev => ({ ...prev, galleryUrls: [...prev.galleryUrls, ...uploadedUrls] }));
    } catch (err: any) {
      console.error(err);
      alert('Erro ao fazer upload das imagens: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      setFormData(prev => ({ ...prev, reportUrl: url }));
    } catch (err: any) {
      console.error(err);
      alert('Erro ao fazer upload do laudo: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const primaryStatus = derivePrimaryStatus(selectedRisks);
      const payload = { ...formData, status: primaryStatus, risks: selectedRisks };
      if (isEditing && id) {
        await updateProperty(id, payload);
        await addPropertyHistory(id, { 
          action: 'Imóvel atualizado', 
          author: user?.name || user?.email || 'Usuário Anônimo', 
          agency: user?.agency || 'Defesa Civil' 
        });
      } else {
        const newProperty = await createProperty(payload);
        await addPropertyHistory(newProperty.id, { 
          action: 'Imóvel cadastrado', 
          author: user?.name || user?.email || 'Usuário Anônimo', 
          agency: user?.agency || 'Defesa Civil' 
        });
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar imóvel');
    } finally {
      setSaving(false);
    }
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (!formData.address.trim()) {
        alert('Por favor, informe o endereço completo antes de continuar.');
        return;
      }
      if (!formData.rpa) {
        alert('Por favor, selecione um Distrito Sanitário.');
        return;
      }
      setIsGeocoding(true);
      const coords = await geocodeAddress(formData.address);
      if (coords) {
        setFormData(prev => ({ ...prev, lat: coords.lat, lng: coords.lng }));
      }
      setIsGeocoding(false);
    }
    setStep(step + 1);
  };

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este imóvel definitivamente?')) {
      setSaving(true);
      try {
        if (id) {
          await deleteProperty(id);
          navigate('/');
        }
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir imóvel');
        setSaving(false);
      }
    }
  };

  const primaryStatus = derivePrimaryStatus(selectedRisks);
  const isHighRisk = primaryStatus !== 'monitoring';

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="h-full flex flex-col w-full bg-gray-50 overflow-hidden">
      <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto p-6 pb-6 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="sm"
              className="mb-4 -ml-2"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar ao Mapa
            </Button>
            <h1 className="text-3xl font-bold text-[#1E1E1E] flex items-center gap-3">
              <Building className="w-8 h-8 text-[#3B5935]" />
              {isEditing ? 'Edição de Imóvel' : 'Cadastro de Imóvel'}
            </h1>
            <p className="text-[#1E1E1E]/60 mt-2">
              {isEditing ? 'Atualize as informações do imóvel.' : 'Preencha detalhadamente as informações do imóvel abandonado ou em situação de risco.'}
            </p>
          </div>
          {isEditing && (
             <Button variant="danger" onClick={handleDelete} disabled={saving} className="self-start md:mt-12">
               Excluir Imóvel
             </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#8C3A27]/10 flex items-center justify-between relative">
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-gray-100 -z-0 -translate-y-1/2 rounded-full overflow-hidden">
            <div className="h-full bg-[#3B5935] rounded-full transition-all duration-500" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />
          </div>

          {[1, 2, 3].map((num) => (
            <div key={num} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors shadow-sm ${
                step >= num ? 'bg-[#3B5935] text-white border-2 border-white' : 'bg-white text-[#1E1E1E]/40 border-2 border-gray-200'
              }`}>
                {step > num ? <CheckCircle2 className="w-6 h-6" /> : num}
              </div>
              <span className={`text-xs font-semibold hidden md:block ${step >= num ? 'text-[#3B5935]' : 'text-[#1E1E1E]/40'}`}>
                {num === 1 ? 'Local e Dados' : num === 2 ? 'Situação e Riscos' : 'Documentação'}
              </span>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-lg border border-[#8C3A27]/10 overflow-hidden">
          <div className="p-8">

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-[#1E1E1E] mb-6 border-b border-gray-100 pb-4">1. Localização e Dados Básicos</h2>

                <div className="grid md:grid-cols-2 gap-6">

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[#1E1E1E] mb-2">Endereço Completo <span className="text-[#EC3759] font-normal">*obrigatório</span></label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E1E1E]/40" />
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="Rua, Número, Bairro, CEP"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-[#8C3A27]/20 rounded-xl focus:ring-2 focus:ring-[#3B5935] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1E1E1E] mb-2">Distrito Sanitário <span className="text-[#EC3759] font-normal">*obrigatório</span></label>
                    <select
                      value={formData.rpa}
                      onChange={(e) => setFormData({...formData, rpa: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-[#8C3A27]/20 rounded-xl focus:ring-2 focus:ring-[#3B5935] focus:outline-none"
                    >
                      {DISTRITOS_SANITARIOS.map((ds) => (
                        <option key={ds.value} value={ds.value}>{ds.label}</option>
                      ))}
                    </select>
                    {formData.rpa && (
                      <p className="text-xs text-[#1E1E1E]/50 mt-1.5 leading-relaxed">
                        Bairros: {DISTRITOS_SANITARIOS.find(d => d.value === formData.rpa)?.bairros}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1E1E1E] mb-2">Área do Lote (m²)</label>
                    <input
                      type="number"
                      value={formData.size}
                      onChange={(e) => setFormData({...formData, size: Number(e.target.value)})}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-gray-50 border border-[#8C3A27]/20 rounded-xl focus:ring-2 focus:ring-[#3B5935] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Status and Risks */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-[#1E1E1E] mb-6 border-b border-gray-100 pb-4">2. Avaliação de Situação e Riscos</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[#1E1E1E] mb-1">Tipos de Risco Identificados <span className="text-[#EC3759] font-normal">*obrigatório</span></label>
                    <p className="text-xs text-[#1E1E1E]/50 mb-4">Selecione todos os riscos aplicáveis. O risco de maior severidade definirá a cor no mapa.</p>
                    <div className="grid grid-cols-1 gap-3">
                      {RISK_TYPES.map((r) => {
                        const isChecked = selectedRisks.includes(r.value);
                        return (
                          <label
                            key={r.value}
                            className={`flex items-start gap-3 p-4 bg-gray-50 border rounded-xl cursor-pointer hover:shadow-sm transition-all ${
                              isChecked ? 'ring-2' : 'border-[#8C3A27]/20'
                            }`}
                            style={isChecked ? { borderColor: r.color, boxShadow: `0 0 0 2px ${r.color}22` } : {}}
                          >
                            <div className="relative mt-0.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleRisk(r.value)}
                                className="sr-only"
                              />
                              <div
                                className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors`}
                                style={{
                                  backgroundColor: isChecked ? r.color : 'white',
                                  borderColor: isChecked ? r.color : '#D1C9C0',
                                }}
                              >
                                {isChecked && (
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                                <span className="text-sm font-semibold text-[#1E1E1E]">{r.label}</span>
                              </div>
                              <span className="text-xs text-[#1E1E1E]/60 mt-0.5 block">{r.description}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[#1E1E1E] mb-2">Tempo Estimado de Abandono <span className="text-[#EC3759] font-normal">*obrigatório</span></label>
                    <select
                      value={formData.abandonmentTime}
                      onChange={(e) => setFormData({...formData, abandonmentTime: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-[#8C3A27]/20 rounded-xl focus:ring-2 focus:ring-[#3B5935] focus:outline-none"
                    >
                      <option>Menos de 1 ano</option>
                      <option>1 a 3 anos</option>
                      <option>3 a 5 anos</option>
                      <option>Mais de 5 anos</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[#1E1E1E] mb-2">Dívida Ativa Estimada (R$)</label>
                    <input
                      type="number"
                      value={formData.debt}
                      onChange={(e) => setFormData({...formData, debt: Number(e.target.value)})}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-gray-50 border border-[#8C3A27]/20 rounded-xl focus:ring-2 focus:ring-[#3B5935] focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[#1E1E1E] mb-2">Descrição Técnica (Parecer da Vistoria) <span className="text-[#EC3759] font-normal">*obrigatório</span></label>
                    <textarea
                      rows={4}
                      value={formData.details}
                      onChange={(e) => setFormData({...formData, details: e.target.value})}
                      placeholder="Descreva as condições estruturais, presença de vegetação, acesso, etc."
                      className="w-full px-4 py-3 bg-gray-50 border border-[#8C3A27]/20 rounded-xl focus:ring-2 focus:ring-[#3B5935] focus:outline-none resize-none"
                    ></textarea>
                  </div>
                </div>

                {isHighRisk && (
                  <div className="bg-[#EC3759]/5 border border-[#EC3759]/20 p-4 rounded-xl flex gap-4 mt-6">
                    <ShieldAlert className="w-6 h-6 text-[#EC3759] shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-[#EC3759]">Atenção: Nível de Risco Elevado</h4>
                      <p className="text-xs text-[#EC3759]/80 mt-1">
                        Ao salvar com este nível de risco, a Defesa Civil ou Vigilância Sanitária serão notificadas no sistema.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Media and Documents */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-[#1E1E1E] mb-6 border-b border-gray-100 pb-4">3. Fotos e Anexos</h2>

                <div className="space-y-8">
                  {/* Imagem de Fachada */}
                  <div>
                    <label className="block text-sm font-semibold text-[#1E1E1E] mb-2">Imagem de Fachada (Câmera ou Galeria)</label>
                    <label className={`border-2 border-dashed border-[#8C3A27]/30 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-white transition-colors cursor-pointer group ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {isUploading ? (
                          <div className="w-6 h-6 border-2 border-[#3B5935] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <UploadCloud className="w-6 h-6 text-[#3B5935]" />
                        )}
                      </div>
                      <span className="text-sm font-bold text-[#1E1E1E] text-center">
                        {isUploading ? 'Enviando imagem...' : 'Tirar foto ou escolher da galeria'}
                      </span>
                      <span className="text-xs text-[#1E1E1E]/50 mt-1 text-center">
                        Formatos suportados: JPG, PNG
                      </span>
                    </label>

                    {formData.imageUrl && (
                      <div className="h-48 w-full md:w-1/2 rounded-xl overflow-hidden border border-[#8C3A27]/20 relative mt-4">
                        <img src={formData.imageUrl} alt="Pré-visualização" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setFormData({...formData, imageUrl: ''})}
                          className="absolute top-2 right-2 bg-white text-[#EC3759] p-1.5 rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Laudo (PDF) */}
                  <div>
                    <label className="block text-sm font-semibold text-[#1E1E1E] mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#8C3A27]" />
                      Laudo da Vistoria (PDF)
                    </label>
                    <label className={`border-2 border-dashed border-[#8C3A27]/30 rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-white transition-colors cursor-pointer group ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <input 
                        type="file" 
                        accept="application/pdf" 
                        onChange={handleReportUpload} 
                        className="hidden" 
                      />
                      <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        {isUploading ? (
                          <div className="w-5 h-5 border-2 border-[#8C3A27] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FileText className="w-5 h-5 text-[#8C3A27]" />
                        )}
                      </div>
                      <span className="text-sm font-bold text-[#1E1E1E] text-center">
                        {isUploading ? 'Enviando laudo...' : 'Anexar Laudo Técnico'}
                      </span>
                      <span className="text-xs text-[#1E1E1E]/50 mt-1 text-center">
                        Formato suportado: PDF
                      </span>
                    </label>

                    {formData.reportUrl && (
                      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 border border-gray-100">
                            <FileText className="w-5 h-5 text-[#8C3A27]" />
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-semibold text-[#1E1E1E] truncate">laudo_vistoria.pdf</p>
                            <a href={formData.reportUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#3B5935] hover:underline">
                              Visualizar Documento
                            </a>
                          </div>
                        </div>
                        <button 
                          onClick={() => setFormData({...formData, reportUrl: ''})}
                          className="bg-white text-[#EC3759] p-2 rounded-lg shadow-sm border border-gray-100 hover:bg-red-50 transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Galeria de Fotos */}
                  <div>
                    <label className="block text-sm font-semibold text-[#1E1E1E] mb-2 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-[#3B5935]" />
                      Galeria de Fotos do Imóvel ({formData.galleryUrls.length}/5)
                    </label>
                    
                    {formData.galleryUrls.length < 5 && (
                      <label className={`border-2 border-dashed border-[#8C3A27]/30 rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-white transition-colors cursor-pointer group mb-4 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple
                          onChange={handleGalleryUpload} 
                          className="hidden" 
                        />
                        <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          {isUploading ? (
                            <div className="w-5 h-5 border-2 border-[#3B5935] border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Camera className="w-5 h-5 text-[#3B5935]" />
                          )}
                        </div>
                        <span className="text-sm font-bold text-[#1E1E1E] text-center">
                          {isUploading ? 'Enviando fotos...' : 'Adicionar fotos à galeria'}
                        </span>
                        <span className="text-xs text-[#1E1E1E]/50 mt-1 text-center">
                          Formatos suportados: JPG, PNG (máx. 5 fotos no total)
                        </span>
                      </label>
                    )}

                    {formData.galleryUrls.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {formData.galleryUrls.map((url, index) => (
                          <div key={index} className="aspect-square rounded-xl overflow-hidden border border-[#8C3A27]/20 relative group">
                            <img src={url} alt={`Galeria ${index + 1}`} className="w-full h-full object-cover" />
                            <button 
                              onClick={() => setFormData(prev => ({
                                ...prev, 
                                galleryUrls: prev.galleryUrls.filter((_, i) => i !== index)
                              }))}
                              className="absolute top-1 right-1 bg-black/50 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[#EC3759] transition-all"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
      </div>

      {/* Footer fixo */}
      <div className="shrink-0 bg-white border-t border-[#8C3A27]/10 px-6 py-4 flex items-center justify-between shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
        <Button
          onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}
          variant="outline"
          size="lg"
        >
          {step === 1 ? 'Cancelar' : 'Voltar'}
        </Button>

        <Button
          onClick={step === 3 ? handleSave : handleNextStep}
          variant="primary"
          size="lg"
          disabled={saving || isGeocoding || isUploading}
        >
          {step === 3 ? (
            <>{saving ? 'Salvando...' : 'Salvar Imóvel'} {!saving && <Save className="w-4 h-4 ml-2" />}</>
          ) : (
            <>{isGeocoding ? 'Buscando Localização...' : 'Próximo Passo'} {!isGeocoding && <ChevronRight className="w-4 h-4 ml-2" />}</>
          )}
        </Button>
      </div>
    </div>
  );
}
