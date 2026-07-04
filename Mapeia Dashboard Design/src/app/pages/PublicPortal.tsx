import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, Camera, Info, Shield, CheckCircle2, Send, AlertTriangle, Building2, X, Loader2, ImagePlus } from 'lucide-react';
import figmaIcon from "../../imports/Intersect.svg";
import { Button } from '../components/ui/button';
import { createProperty, getProperties, uploadFile, addPropertyHistory } from '../lib/api';
import { PropertyStatus } from '../types';

const BAIRROS_POR_DISTRITO = [
  { ds: 'DS I',   label: 'Distrito Sanitário I',   bairros: ['Recife','Santo Amaro','Boa Vista','Cabanga','Ilha do Leite','Paissandu','Santo Antônio','São José','Coelhos','Soledade','Ilha Joana Bezerra'] },
  { ds: 'DS II',  label: 'Distrito Sanitário II',  bairros: ['Alto Santa Terezinha','Água Fria','Arruda','Beberibe','Bomba do Hemetério','Campo Grande','Cajueiro','Campina do Barreto','Dois Unidos','Encruzilhada','Fundão','Hipódromo','Linha do Tiro','Ponto de Parada','Porto da Madeira','Peixinhos','Rosarinho','Torreão'] },
  { ds: 'DS III', label: 'Distrito Sanitário III', bairros: ['Aflitos','Alto do Mandu','Apipucos','Casa Amarela','Casa Forte','Derby','Dois Irmãos','Espinheiro','Graças','Jaqueira','Monteiro','Parnamirim','Poço','Santana','Sítio dos Pintos','Tamarineira'] },
  { ds: 'DS IV',  label: 'Distrito Sanitário IV',  bairros: ['Caxangá','Cidade Universitária','Cordeiro','Engenho do Meio','Ilha do Retiro','Iputinga','Madalena','Prado','Torre','Torrões','Várzea','Zumbi'] },
  { ds: 'DS V',   label: 'Distrito Sanitário V',   bairros: ['Afogados','Areias','Barro','Bongi','Caçote','Coqueiral','Curado','Estância','Jardim São Paulo','Jiquiá','Mangueira','Mustardinha','Sancho','San Martin','Tejipió','Totó'] },
  { ds: 'DS VI',  label: 'Distrito Sanitário VI',  bairros: ['Boa Viagem','Brasília Teimosa','Imbiribeira','Ipsep','Pina'] },
  { ds: 'DS VII', label: 'Distrito Sanitário VII', bairros: ['Alto José Bonifácio','Alto José do Pinho','Brejo do Guabiraba','Brejo do Beberibe','Córrego do Jenipapo','Guabiraba','Macaxeira','Mangabeira','Morro da Conceição','Nova Descoberta','Passarinho','Pau Ferro','Vasco da Gama'] },
  { ds: 'DS VIII',label: 'Distrito Sanitário VIII',bairros: ['Cohab','Ibura','Jordão'] },
];

const PROBLEMAS = [
  { value: 'structural_risk' as PropertyStatus, label: 'O imóvel está com risco de cair',                        description: 'Paredes rachadas, teto cedendo, estrutura visivelmente comprometida.', color: '#F2C94C' },
  { value: 'security_risk'  as PropertyStatus, label: 'Tem gente usando o local de forma irregular',             description: 'Invasão, ponto de tráfico, ou qualquer uso que gera insegurança na rua.',  color: '#EC3759' },
  { value: 'sanitary_waste' as PropertyStatus, label: 'Virou depósito de lixo ou entulho',                      description: 'Descarte ilegal de resíduos, acúmulo de lixo no terreno ou na calçada.',   color: '#8C3A27' },
  { value: 'zoonosis_risk'  as PropertyStatus, label: 'Tem água parada, ratos ou animais perigosos',            description: 'Foco de dengue, mosquitos, ratos ou outros animais que trazem doenças.',    color: '#F97316' },
];

const ABANDONMENT_OPTS = [
  { value: 'Menos de 1 ano', label: 'Menos de 1 ano' },
  { value: '1 a 3 anos',     label: '1 a 3 anos' },
  { value: '3 a 5 anos',     label: '3 a 5 anos' },
  { value: 'Mais de 5 anos', label: 'Mais de 5 anos' },
  { value: 'Não sei',        label: 'Não sei' },
];

const PRIORITY: Record<string, number> = { security_risk: 5, structural_risk: 4, sanitary_waste: 3, zoonosis_risk: 2, monitoring: 1 };

const geocodeAddress = async (address: string) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Recife, Pernambuco, Brasil')}&limit=1`);
    const data = await res.json();
    if (data?.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch { /* fallback to default coords */ }
  return null;
};

function SectionLabel({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-7 h-7 rounded-full bg-[#3B5935] text-white text-xs font-extrabold flex items-center justify-center shrink-0">{n}</div>
      <span className="text-base font-bold text-[#1E1E1E]">{label}</span>
    </div>
  );
}

export default function PublicPortal() {
  const navigate = useNavigate();
  const [step, setStep]                           = useState(1);
  const [loading, setLoading]                     = useState(false);
  const [isAnonymous, setIsAnonymous]             = useState(false);
  const [userName, setUserName]                   = useState('');
  const [address, setAddress]                     = useState('');
  const [selectedBairro, setSelectedBairro]       = useState('');
  const [selectedProblemas, setSelectedProblemas] = useState<PropertyStatus[]>([]);
  const [abandonmentTime, setAbandonmentTime]     = useState('');
  const [details, setDetails]                     = useState('');
  const [photos, setPhotos]                       = useState<{ file: File; preview: string; url?: string; uploading?: boolean; error?: boolean }[]>([]);
  const [totalImoveis, setTotalImoveis]           = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getProperties()
      .then(props => setTotalImoveis(props.length))
      .catch(() => setTotalImoveis(null));
  }, []);

  const toggleProblema = (v: PropertyStatus) =>
    setSelectedProblemas(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  const primaryStatus: PropertyStatus = selectedProblemas.length > 0
    ? selectedProblemas.reduce((top, r) => PRIORITY[r] > PRIORITY[top] ? r : top, selectedProblemas[0])
    : 'monitoring';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim())              { alert('Informe o endereço do imóvel.');                               return; }
    if (!selectedBairro)              { alert('Selecione o bairro.');                                          return; }
    if (selectedProblemas.length === 0) { alert('Selecione pelo menos um problema.');                         return; }
    if (!abandonmentTime)             { alert('Informe há quanto tempo o imóvel está nessa situação.');       return; }

    setLoading(true);
    try {
      // Upload photos first
      const uploadedUrls: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        setPhotos(prev => prev.map((p, idx) => idx === i ? { ...p, uploading: true, error: false } : p));
        try {
          const url = await uploadFile(photos[i].file);
          uploadedUrls.push(url);
          setPhotos(prev => prev.map((p, idx) => idx === i ? { ...p, uploading: false, url } : p));
        } catch {
          setPhotos(prev => prev.map((p, idx) => idx === i ? { ...p, uploading: false, error: true } : p));
        }
      }

      const coords = await geocodeAddress(address);
      const newProperty = await createProperty({
        address: address.trim(),
        details,
        lat: coords?.lat ?? -8.0476,
        lng: coords?.lng ?? -34.8770,
        rpa: selectedBairro,
        size: 0, debt: 0,
        status: primaryStatus,
        risks: selectedProblemas,
        abandonmentTime,
        imageUrl: uploadedUrls[0],
        galleryUrls: uploadedUrls,
        source: 'citizen',
      });
      await addPropertyHistory(newProperty.id, { 
        action: 'Imóvel cadastrado via Portal Cidadão', 
        author: isAnonymous ? 'Cidadão Anônimo' : (userName.trim() || 'Cidadão'), 
        agency: 'Portal Público' 
      });
      setStep(2);
    } catch { alert('Erro ao registrar denúncia. Tente novamente.'); }
    finally   { setLoading(false); }
  };

  const handleAddPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos(prev => [...prev, ...newPhotos].slice(0, 5));
    e.target.value = '';
  };

  const removePhoto = (i: number) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[i].preview);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const resetForm = () => {
    photos.forEach(p => URL.revokeObjectURL(p.preview));
    setStep(1); setAddress(''); setSelectedBairro('');
    setSelectedProblemas([]); setAbandonmentTime(''); setDetails('');
    setPhotos([]); setIsAnonymous(false);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 font-sans text-[#1E1E1E]">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#8C3A27]/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={figmaIcon} alt="Mapeia" className="w-9 h-9 object-contain" />
            <div>
              <h1 className="text-lg font-bold text-[#1E1E1E] leading-tight">
                Mapeia<span className="text-[#3B5935]">Cidadão</span>
              </h1>
              <span className="text-xs text-[#1E1E1E]/50 font-medium">Prefeitura do Recife</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-[#1E1E1E]/70">
            <MapPin className="w-4 h-4 mr-1.5" /> Mapa
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-0">

        {step === 1 ? (
          <>
            {/* ── Hero ───────────────────────────────────────────────────── */}
            <div className="bg-[#3B5935] rounded-b-3xl px-6 pt-8 pb-10 mb-8 text-white relative overflow-hidden">
              {/* decorative circles */}
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
              <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5" />

              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/15 px-3 py-1 rounded-full mb-4">
                  <AlertTriangle className="w-3.5 h-3.5" /> Portal de Denúncias
                </span>

                <h2 className="text-2xl md:text-3xl font-extrabold leading-tight mb-3">
                  Encontrou um imóvel<br className="hidden sm:block" /> abandonado no Recife?
                </h2>

                <p className="text-white/80 text-sm md:text-base leading-relaxed mb-6 max-w-md">
                  Registre aqui. Nossa equipe avalia e toma as providências. Sua denúncia pode ser anônima.
                </p>

                {/* Counter */}
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-white/70 shrink-0" />
                    <div>
                      <p className="text-xs text-white/60 font-medium leading-none mb-0.5">Imóveis monitorados</p>
                      <p className="text-2xl font-extrabold leading-none">
                        {totalImoveis === null ? '—' : totalImoveis.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-white/70 shrink-0" />
                    <div>
                      <p className="text-xs text-white/60 font-medium leading-none mb-0.5">Denúncias protegidas</p>
                      <p className="text-lg font-extrabold leading-none">100%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Form ───────────────────────────────────────────────────── */}
            <div className="space-y-6 pb-12">

              {/* Seção 1 — Identificação */}
              <div className="bg-white rounded-2xl border border-[#8C3A27]/10 shadow-sm p-5">
                <SectionLabel n={1} label="Sua Identificação" />

                <div className="bg-[#E8E3D9]/30 border border-[#8C3A27]/15 rounded-xl p-4 flex items-start gap-3 mb-4">
                  <Shield className="w-5 h-5 text-[#3B5935] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1E1E1E]">Denúncia Anônima</p>
                    <p className="text-xs text-[#1E1E1E]/60 mt-0.5 mb-3">
                      Seus dados nunca serão divulgados. Ativar o anonimato é opcional.
                    </p>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative shrink-0">
                        <input type="checkbox" className="sr-only" checked={isAnonymous} onChange={() => setIsAnonymous(!isAnonymous)} />
                        <div className={`w-12 h-7 rounded-full transition-colors ${isAnonymous ? 'bg-[#3B5935]' : 'bg-gray-300'}`} />
                        <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform shadow ${isAnonymous ? 'translate-x-5' : ''}`} />
                      </div>
                      <span className="text-sm font-medium text-[#1E1E1E]/80">
                        {isAnonymous ? 'Denúncia anônima ativada' : 'Identificar-me (opcional)'}
                      </span>
                    </label>
                  </div>
                </div>

                {!isAnonymous && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1E1E1E]/60 uppercase tracking-wider mb-1.5">Seu Nome</label>
                      <input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder="Nome completo" className="w-full px-4 py-3 bg-gray-50 border border-[#8C3A27]/20 rounded-xl text-base md:text-sm focus:ring-2 focus:ring-[#3B5935] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1E1E1E]/60 uppercase tracking-wider mb-1.5">E-mail ou Telefone</label>
                      <input type="text" placeholder="Para receber atualizações" className="w-full px-4 py-3 bg-gray-50 border border-[#8C3A27]/20 rounded-xl text-base md:text-sm focus:ring-2 focus:ring-[#3B5935] focus:outline-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Seção 2 — Localização */}
              <div className="bg-white rounded-2xl border border-[#8C3A27]/10 shadow-sm p-5">
                <SectionLabel n={2} label="Onde fica o imóvel?" />

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E1E1E]/60 uppercase tracking-wider mb-1.5">
                      Rua e número <span className="text-[#EC3759]">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1E1E1E]/40" />
                      <input
                        type="text"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="Ex: Rua das Flores, 123"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-[#8C3A27]/20 rounded-xl text-base md:text-sm focus:ring-2 focus:ring-[#3B5935] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1E1E1E]/60 uppercase tracking-wider mb-2">
                      Bairro <span className="text-[#EC3759]">*</span>
                    </label>
                    <div className="space-y-2">
                      {BAIRROS_POR_DISTRITO.map(grupo => {
                        const selected = selectedBairro === grupo.ds;
                        return (
                          <label
                            key={grupo.ds}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all select-none ${
                              selected
                                ? 'border-[#3B5935] bg-[#3B5935]/5 ring-1 ring-[#3B5935]'
                                : 'border-[#8C3A27]/15 bg-gray-50 hover:bg-white'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              <input type="radio" name="bairro-grupo" className="sr-only" checked={selected} onChange={() => setSelectedBairro(grupo.ds)} />
                              <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: selected ? '#3B5935' : '#D1C9C0', backgroundColor: selected ? '#3B5935' : 'white' }}>
                                {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-[#1E1E1E] mb-1">{grupo.label}</p>
                              <div className="flex flex-wrap gap-1">
                                {grupo.bairros.map(b => (
                                  <span key={b} className="px-2 py-0.5 rounded-full text-xs font-medium bg-white border border-[#8C3A27]/20 text-[#1E1E1E]/75">{b}</span>
                                ))}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 3 — Problema */}
              <div className="bg-white rounded-2xl border border-[#8C3A27]/10 shadow-sm p-5">
                <SectionLabel n={3} label="Qual é o problema?" />
                <p className="text-xs text-[#1E1E1E]/50 -mt-2 mb-4">Pode marcar mais de um.</p>

                <div className="space-y-2.5">
                  {PROBLEMAS.map(p => {
                    const checked = selectedProblemas.includes(p.value);
                    return (
                      <label
                        key={p.value}
                        className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all select-none"
                        style={checked
                          ? { backgroundColor: p.color + '12', borderColor: p.color, boxShadow: `0 0 0 1px ${p.color}` }
                          : { backgroundColor: '#F9FAFB', borderColor: 'rgba(140,58,39,0.15)' }
                        }
                      >
                        <div className="mt-0.5 shrink-0">
                          <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleProblema(p.value)} />
                          <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors" style={{ backgroundColor: checked ? p.color : 'white', borderColor: checked ? p.color : '#D1C9C0' }}>
                            {checked && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                            <span className="text-sm font-bold text-[#1E1E1E]">{p.label}</span>
                          </div>
                          <p className="text-xs text-[#1E1E1E]/55 leading-relaxed">{p.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Seção 4 — Tempo */}
              <div className="bg-white rounded-2xl border border-[#8C3A27]/10 shadow-sm p-5">
                <SectionLabel n={4} label="Há quanto tempo está assim?" />

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ABANDONMENT_OPTS.map(opt => {
                    const sel = abandonmentTime === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border cursor-pointer transition-all text-sm font-semibold select-none ${
                          sel ? 'border-[#3B5935] bg-[#3B5935]/5 text-[#3B5935] ring-1 ring-[#3B5935]' : 'border-[#8C3A27]/15 bg-gray-50 text-[#1E1E1E]/70 hover:bg-white'
                        }`}
                      >
                        <input type="radio" name="abandonmentTime" className="sr-only" checked={sel} onChange={() => setAbandonmentTime(opt.value)} />
                        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: sel ? '#3B5935' : '#D1C9C0', backgroundColor: sel ? '#3B5935' : 'white' }}>
                          {sel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        {opt.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Seção 5 — Detalhes e Foto */}
              <div className="bg-white rounded-2xl border border-[#8C3A27]/10 shadow-sm p-5">
                <SectionLabel n={5} label="Mais informações (opcional)" />

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E1E1E]/60 uppercase tracking-wider mb-1.5">Conte mais detalhes</label>
                    <textarea
                      rows={3}
                      value={details}
                      onChange={e => setDetails(e.target.value)}
                      placeholder="Se já causou acidente, se tem crianças por perto, qualquer detalhe ajuda..."
                      className="w-full px-4 py-3 bg-gray-50 border border-[#8C3A27]/20 rounded-xl text-base md:text-sm focus:ring-2 focus:ring-[#3B5935] focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1E1E1E]/60 uppercase tracking-wider mb-2">
                      <Camera className="inline w-3.5 h-3.5 mr-1" />Fotos do local
                      <span className="font-normal text-[#1E1E1E]/40 ml-1">(até 5 imagens)</span>
                    </label>

                    {/* Thumbnails */}
                    {photos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {photos.map((p, i) => (
                          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#8C3A27]/15 group">
                            <img src={p.preview} alt="" className="w-full h-full object-cover" />
                            {p.uploading && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                              </div>
                            )}
                            {p.error && (
                              <div className="absolute inset-0 bg-[#EC3759]/60 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">Erro</span>
                              </div>
                            )}
                            {!p.uploading && (
                              <button
                                type="button"
                                onClick={() => removePhoto(i)}
                                className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3 text-white" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add button */}
                    {photos.length < 5 && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="sr-only"
                          onChange={handleAddPhotos}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-[#8C3A27]/25 rounded-xl p-5 flex flex-col items-center justify-center bg-gray-50 hover:bg-white hover:border-[#3B5935]/30 transition-all cursor-pointer"
                        >
                          <div className="w-9 h-9 bg-white rounded-full shadow-sm flex items-center justify-center mb-2">
                            <ImagePlus className="w-4 h-4 text-[#3B5935]" />
                          </div>
                          <span className="text-sm font-bold text-[#1E1E1E]">
                            {photos.length === 0 ? 'Adicionar fotos' : 'Adicionar mais fotos'}
                          </span>
                          <span className="text-xs text-[#1E1E1E]/50 mt-0.5">JPG, PNG · Máx. 5MB cada</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-white rounded-2xl border border-[#8C3A27]/10 shadow-sm p-5">
                <div className="flex items-center gap-2 text-xs text-[#1E1E1E]/40 font-medium mb-4">
                  <Info className="w-4 h-4 shrink-0" />
                  O registro falso é crime (Art. 340 do Código Penal).
                </div>
                <Button
                  onClick={handleSubmit}
                  variant="primary"
                  size="lg"
                  className="w-full text-base"
                  disabled={loading}
                >
                  <Send className="w-5 h-5 mr-2" />
                  {loading ? 'Enviando...' : 'Registrar Denúncia'}
                </Button>
              </div>

            </div>
          </>
        ) : (
          /* ── Sucesso ─────────────────────────────────────────────────── */
          <div className="py-16 px-4 text-center">
            <div className="w-24 h-24 bg-[#3B5935]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-[#3B5935]" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#1E1E1E] mb-3">Denúncia Registrada!</h2>
            <p className="text-[#1E1E1E]/60 max-w-sm mx-auto mb-8 leading-relaxed">
              Obrigado por ajudar a cuidar do Recife. Nossa equipe foi notificada e avaliará o imóvel em breve.
            </p>
            {totalImoveis !== null && (
              <div className="inline-flex items-center gap-2 bg-[#3B5935]/8 border border-[#3B5935]/20 rounded-full px-4 py-2 text-sm font-semibold text-[#3B5935] mb-8">
                <Building2 className="w-4 h-4" />
                {totalImoveis.toLocaleString('pt-BR')} imóveis monitorados no total
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" onClick={resetForm}>
                Registrar outra denúncia
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Ver no mapa
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
