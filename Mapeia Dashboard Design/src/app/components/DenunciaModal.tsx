import React, { useState } from 'react';
import { X, Camera, MapPin, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { createProperty, addPropertyHistory } from '../lib/api';
import { PropertyStatus } from '../types';

interface DenunciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

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

export function DenunciaModal({ isOpen, onClose, onSuccess }: DenunciaModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [details, setDetails] = useState('');
  const [riskType, setRiskType] = useState<PropertyStatus>('monitoring');
  
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const coords = await geocodeAddress(address);
      const lat = coords ? coords.lat : -8.0476;
      const lng = coords ? coords.lng : -34.8770;
      
      const newProperty = await createProperty({
        address,
        details,
        lat,
        lng,
        rpa: 'DS I',
        size: 0,
        debt: 0,
        status: riskType,
        abandonmentTime: 'Desconhecido',
        source: 'citizen'
      });
      await addPropertyHistory(newProperty.id, { 
        action: 'Imóvel cadastrado via Portal Cidadão (Modal)', 
        author: 'Cidadão Anônimo', 
        agency: 'Portal Público' 
      });
      if (onSuccess) onSuccess();
      setStep(2);
    } catch (err) {
      console.error(err);
      alert('Erro ao registrar denúncia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-[#8C3A27]/10 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-[#1E1E1E]">Nova Denúncia</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto">
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-[#1E1E1E]/70 mb-2">
                Preencha os dados abaixo para registrar um imóvel abandonado ou com risco.
              </p>

              <div>
                <label className="block text-sm font-semibold text-[#1E1E1E] mb-1">
                  Endereço do Imóvel <span className="text-[#EC3759]">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#1E1E1E]/40" />
                  <input 
                    required
                    type="text" 
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Rua, Número, Bairro"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#8C3A27]/20 rounded-xl text-base md:text-sm focus:ring-2 focus:ring-[#3B5935] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1E1E1E] mb-2">
                  Tipos de Problema <span className="text-[#EC3759]">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-2 bg-white border border-[#8C3A27]/20 rounded-xl cursor-pointer hover:bg-gray-50 focus-within:ring-2 focus-within:ring-[#3B5935]">
                    <input type="radio" name="risk" checked={riskType === 'security_risk'} onChange={() => setRiskType('security_risk')} className="w-4 h-4 text-[#3B5935] bg-white border-gray-300 rounded focus:ring-[#3B5935]" />
                    <span className="text-sm font-medium text-[#1E1E1E]">Risco de Segurança (Invasão/Tráfico)</span>
                  </label>
                  <label className="flex items-center gap-3 p-2 bg-white border border-[#8C3A27]/20 rounded-xl cursor-pointer hover:bg-gray-50 focus-within:ring-2 focus-within:ring-[#3B5935]">
                    <input type="radio" name="risk" checked={riskType === 'structural_risk'} onChange={() => setRiskType('structural_risk')} className="w-4 h-4 text-[#3B5935] bg-white border-gray-300 rounded focus:ring-[#3B5935]" />
                    <span className="text-sm font-medium text-[#1E1E1E]">Risco Estrutural (Desabamento)</span>
                  </label>
                  <label className="flex items-center gap-3 p-2 bg-white border border-[#8C3A27]/20 rounded-xl cursor-pointer hover:bg-gray-50 focus-within:ring-2 focus-within:ring-[#3B5935]">
                    <input type="radio" name="risk" checked={riskType === 'monitoring'} onChange={() => setRiskType('monitoring')} className="w-4 h-4 text-[#3B5935] bg-white border-gray-300 rounded focus:ring-[#3B5935]" />
                    <span className="text-sm font-medium text-[#1E1E1E]">Risco à Saúde (Dengue/Lixo)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1E1E1E] mb-1">
                  Descrição (Opcional)
                </label>
                <textarea 
                  rows={3}
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder="Detalhes adicionais sobre a situação do imóvel..."
                  className="w-full p-3 bg-white border border-[#8C3A27]/20 rounded-xl text-base md:text-sm focus:ring-2 focus:ring-[#3B5935] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1E1E1E] mb-1">
                  Foto do Local
                </label>
                <div className="border-2 border-dashed border-[#8C3A27]/20 rounded-xl p-4 flex flex-col items-center justify-center bg-white/50 text-[#1E1E1E]/50 hover:bg-white transition-colors cursor-pointer">
                  <Camera className="w-6 h-6 mb-2" />
                  <span className="text-xs">Clique para anexar imagem</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="danger"
                className="w-full mt-2"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Denúncia'}
              </Button>
            </form>
          ) : (
            <div className="py-8 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-[#3B5935]/10 text-[#3B5935] rounded-full flex items-center justify-center mb-2">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#1E1E1E]">Denúncia Registrada!</h3>
              <p className="text-sm text-[#1E1E1E]/70">
                Obrigado por ajudar a monitorar a cidade. A equipe responsável foi notificada e avaliará a situação do imóvel em breve.
              </p>
              <Button
                onClick={onClose}
                variant="primary"
                className="mt-6"
              >
                Voltar ao Mapa
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
