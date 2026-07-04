import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
// Login page component
import figmaIcon from "../../imports/Intersect.svg";
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, MessageSquarePlus, ArrowRight, MapPin as MapPinIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import fallbackImage from "../../imports/image_2.png";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(email, password);
    if (result.ok) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Erro ao autenticar.');
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full flex bg-gray-50 font-sans text-[#1E1E1E]">
      {/* Left side */}
      <div className="hidden lg:flex flex-1 bg-[#ffffff] p-12 flex-col justify-between relative overflow-hidden">
        <ImageWithFallback 
    src="https://images.unsplash.com/photo-1739370648149-d27c15c966f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWNpZmUlMjBhZXJpYWwlMjB2aWV3fGVufDF8fHx8MTc4MjI2MDg4OXww&ixlib=rb-4.1.0&q=80&w=1080" 
    alt="Vista aérea de Recife"
    className="absolute top-0 left-0 w-full h-full object-cover opacity-80 mix-blend-darken grayscale" 
  />
  
  {/* Camada do gradiente branco vindo de cima */}
  <div 
    className="absolute top-0 left-0 w-full h-full pointer-events-none" 
    style={{ backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.9), transparent)' }}
  />
        <div className="z-10 relative">
          <div className="flex items-center gap-3 text-[#000000] mb-8">
            <img src={figmaIcon} alt="Mapeia Logo" className="w-12 h-12 object-contain" />
            <h1 className="text-3xl font-bold tracking-tight text-[#1e1e1e]">Mapeia</h1>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight max-w-md text-[#1e1e1e]">Monitoramento Inteligente de Imóveis e Risco Urbano</h2>
          <p className="mt-6 text-lg max-w-md text-[#000000b3]">
            Plataforma interinstitucional para mapeamento, análise e gestão de propriedades abandonadas ou em situação de risco na cidade do Recife.
          </p>
        </div>
        <div className="z-10 relative flex items-center gap-4 text-sm font-semibold text-[#1E1E1E]/50">
          <Shield className="w-5 h-5 text-[#3B5935]" />
          Acesso restrito a órgãos governamentais
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 md:p-12 bg-white shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.05)] z-10 relative">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <img src={figmaIcon} alt="Mapeia Logo" className="w-16 h-16 object-contain" />
          </div>

          {/* CTA Portal Cidadão */}
          <div
            onClick={() => navigate('/public')}
            className="mb-10 group cursor-pointer relative rounded-3xl overflow-hidden border border-[#3B5935]/20 hover:border-[#3B5935]/40 transition-all hover:shadow-xl hover:shadow-[#3B5935]/10"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#3B5935] to-[#2d4428]" />
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />

            <div className="relative z-10 p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center shrink-0">
                  <MessageSquarePlus className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Acesso público</p>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight mb-1.5">
                    Encontrou um imóvel abandonado?
                  </h2>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Qualquer cidadão pode registrar uma denúncia. Não precisa de cadastro.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-white/60 text-xs font-medium">
                  <MapPinIcon className="w-3.5 h-3.5" /> Recife, PE
                </div>
                <div className="flex items-center gap-2 bg-white text-[#3B5935] font-bold text-sm px-4 py-2 rounded-xl group-hover:gap-3 transition-all">
                  Registrar Denúncia
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-xs font-bold text-[#1E1E1E]/40 uppercase tracking-wider">Acesso Institucional</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-[#EC3759]/5 border border-[#EC3759]/20 rounded-xl text-sm text-[#EC3759] font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#1E1E1E] mb-2">E-mail Institucional</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E1E1E]/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value.toLowerCase())}
                  placeholder="nome@orgao.gov.br"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-[#8C3A27]/20 rounded-xl text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5935] focus:bg-white transition-all text-[#1E1E1E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1E1E1E] mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E1E1E]/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-[#8C3A27]/20 rounded-xl text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-[#3B5935] focus:bg-white transition-all text-[#1E1E1E]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1E1E1E]/40 hover:text-[#1E1E1E] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full mt-4" disabled={loading}>
              {loading ? 'Verificando...' : 'Entrar no Sistema'}
            </Button>
          </form>

          <div className="mt-8 space-y-4">
            <div className="pt-6 border-t border-gray-100">
              <p className="text-xs text-center text-[#1E1E1E]/40 font-medium">
                Precisa de acesso institucional? Solicite ao administrador da sua secretaria.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
