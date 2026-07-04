import React from 'react';
import { Activity, Server, Database, CheckCircle2, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';

const mockIntegrations = [
  {
    id: 1,
    name: 'SEFIN (Secretaria de Finanças)',
    description: 'Sincronização de dívida ativa e IPTU.',
    status: 'online',
    lastSync: 'Há 10 minutos',
    uptime: '99.9%',
    latency: '120ms'
  },
  {
    id: 2,
    name: 'Neoenergia Pernambuco',
    description: 'Leitura de consumo de energia (indicador de abandono).',
    status: 'warning',
    lastSync: 'Há 2 horas',
    uptime: '98.5%',
    latency: '850ms'
  },
  {
    id: 3,
    name: 'Compesa',
    description: 'Leitura de consumo de água.',
    status: 'online',
    lastSync: 'Há 15 minutos',
    uptime: '99.8%',
    latency: '200ms'
  },
  {
    id: 4,
    name: 'Defesa Civil (Sistema Interno)',
    description: 'Alertas e laudos estruturais.',
    status: 'error',
    lastSync: 'Falha na última tentativa',
    uptime: '95.0%',
    latency: '-'
  }
];

export default function IntegrationHealth() {
  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto w-full bg-gray-50">
      <div className="max-w-6xl w-full mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1E1E1E] flex items-center gap-2">
              <Activity className="w-6 h-6 text-[#3B5935]" />
              Saúde das Integrações
            </h1>
            <p className="text-[#1E1E1E]/60 text-sm mt-1">
              Monitoramento analítico do cruzamento de dados com múltiplas fontes governamentais.
            </p>
          </div>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4" />
            Sincronizar Tudo
          </Button>
        </div>

        {/* Global Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#8C3A27]/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#3B5935]/10 flex items-center justify-center">
              <Server className="w-6 h-6 text-[#3B5935]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1E1E1E]/60">Status Global</p>
              <h3 className="text-xl font-bold text-[#1E1E1E]">Operacional</h3>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#8C3A27]/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#EC3759]/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-[#EC3759]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1E1E1E]/60">Falhas Ativas</p>
              <h3 className="text-xl font-bold text-[#EC3759]">1 Integração</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#8C3A27]/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F2C94C]/10 flex items-center justify-center">
              <Database className="w-6 h-6 text-[#8C3A27]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1E1E1E]/60">Dados Cruzados (Hoje)</p>
              <h3 className="text-xl font-bold text-[#1E1E1E]">14.285 regs.</h3>
            </div>
          </div>
        </div>

        {/* Integration List */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#8C3A27]/10 overflow-hidden">
          <div className="p-6 border-b border-[#8C3A27]/10">
            <h2 className="text-lg font-bold text-[#1E1E1E]">Status dos Webhooks e APIs</h2>
          </div>
          <div className="divide-y divide-[#8C3A27]/10">
            {mockIntegrations.map((integration) => (
              <div key={integration.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
                
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {integration.status === 'online' && <CheckCircle2 className="w-6 h-6 text-[#3B5935]" />}
                    {integration.status === 'warning' && <AlertCircle className="w-6 h-6 text-[#F2C94C]" />}
                    {integration.status === 'error' && <AlertCircle className="w-6 h-6 text-[#EC3759]" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1E1E1E] text-lg">{integration.name}</h3>
                    <p className="text-sm text-[#1E1E1E]/60 mt-1">{integration.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs font-semibold">
                      <span className="flex items-center gap-1 text-[#1E1E1E]/50">
                        <Clock className="w-3.5 h-3.5" /> Última Sincronização: {integration.lastSync}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-4 md:gap-2 items-center md:items-end justify-between border-t md:border-t-0 border-[#8C3A27]/10 pt-4 md:pt-0">
                  <div className="text-center md:text-right">
                    <span className="block text-xs font-semibold text-[#1E1E1E]/50 uppercase tracking-wider">Uptime</span>
                    <span className="font-bold text-[#1E1E1E]">{integration.uptime}</span>
                  </div>
                  <div className="text-center md:text-right">
                    <span className="block text-xs font-semibold text-[#1E1E1E]/50 uppercase tracking-wider">Latência</span>
                    <span className="font-bold text-[#1E1E1E]">{integration.latency}</span>
                  </div>
                  <div>
                    <Button variant="link" size="sm">Ver Logs</Button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}