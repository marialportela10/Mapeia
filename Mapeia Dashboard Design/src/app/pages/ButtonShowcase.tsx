import React from 'react';
import { Button } from '../components/ui/button';
import { Plus, Save, X, ChevronRight, Menu, AlertTriangle, Check } from 'lucide-react';

export default function ButtonShowcase() {
  return (
    <div className="min-h-screen w-full bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#1E1E1E] mb-2">Sistema de Design de Botões</h1>
          <p className="text-[#1E1E1E]/60">Guia visual do sistema Mapeia</p>
        </div>

        {/* Primary Variant */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-[#8C3A27]/10">
          <h2 className="text-2xl font-bold text-[#1E1E1E] mb-6">Primary (Verde #3B5935)</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary" size="sm">Pequeno</Button>
            <Button variant="primary">Padrão</Button>
            <Button variant="primary" size="lg">Grande</Button>
            <Button variant="primary">
              <Plus className="w-4 h-4" />
              Com Ícone
            </Button>
            <Button variant="primary" disabled>Desabilitado</Button>
          </div>
          <p className="text-sm text-[#1E1E1E]/60 mt-4">
            <strong>Uso:</strong> Ações principais, CTAs, envios de formulário
          </p>
        </section>

        {/* Danger Variant */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-[#8C3A27]/10">
          <h2 className="text-2xl font-bold text-[#1E1E1E] mb-6">Danger (Vermelho #EC3759)</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="danger" size="sm">Pequeno</Button>
            <Button variant="danger">Padrão</Button>
            <Button variant="danger" size="lg">Grande</Button>
            <Button variant="danger">
              <AlertTriangle className="w-4 h-4" />
              Nova Denúncia
            </Button>
            <Button variant="danger" disabled>Desabilitado</Button>
          </div>
          <p className="text-sm text-[#1E1E1E]/60 mt-4">
            <strong>Uso:</strong> Denúncias, alertas, ações que requerem atenção
          </p>
        </section>

        {/* Warning Variant */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-[#8C3A27]/10">
          <h2 className="text-2xl font-bold text-[#1E1E1E] mb-6">Warning (Amarelo #F2C94C)</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="warning" size="sm">Pequeno</Button>
            <Button variant="warning">Padrão</Button>
            <Button variant="warning" size="lg">Grande</Button>
            <Button variant="warning">
              <AlertTriangle className="w-4 h-4" />
              Atenção
            </Button>
            <Button variant="warning" disabled>Desabilitado</Button>
          </div>
          <p className="text-sm text-[#1E1E1E]/60 mt-4">
            <strong>Uso:</strong> Avisos, confirmações sensíveis
          </p>
        </section>

        {/* Outline Variant */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-[#8C3A27]/10">
          <h2 className="text-2xl font-bold text-[#1E1E1E] mb-6">Outline (Secundário)</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="outline" size="sm">Pequeno</Button>
            <Button variant="outline">Padrão</Button>
            <Button variant="outline" size="lg">Grande</Button>
            <Button variant="outline">
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button variant="outline" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
            <Button variant="outline" disabled>Desabilitado</Button>
          </div>
          <p className="text-sm text-[#1E1E1E]/60 mt-4">
            <strong>Uso:</strong> Ações secundárias, cancelar, voltar, botões com ícone
          </p>
        </section>

        {/* Ghost Variant */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-[#8C3A27]/10">
          <h2 className="text-2xl font-bold text-[#1E1E1E] mb-6">Ghost (Terciário)</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="ghost" size="sm">Pequeno</Button>
            <Button variant="ghost">Padrão</Button>
            <Button variant="ghost" size="lg">Grande</Button>
            <Button variant="ghost">
              <ChevronRight className="w-4 h-4" />
              Próximo
            </Button>
            <Button variant="ghost" size="icon">
              <X className="w-5 h-5" />
            </Button>
            <Button variant="ghost" disabled>Desabilitado</Button>
          </div>
          <p className="text-sm text-[#1E1E1E]/60 mt-4">
            <strong>Uso:</strong> Navegação sutil, tabs, ícones de fechar, ações terciárias
          </p>
        </section>

        {/* Link Variant */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-[#8C3A27]/10">
          <h2 className="text-2xl font-bold text-[#1E1E1E] mb-6">Link (Texto)</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="link" size="sm">Pequeno</Button>
            <Button variant="link">Padrão</Button>
            <Button variant="link" size="lg">Grande</Button>
            <Button variant="link">
              Esqueceu a senha?
            </Button>
            <Button variant="link" disabled>Desabilitado</Button>
          </div>
          <p className="text-sm text-[#1E1E1E]/60 mt-4">
            <strong>Uso:</strong> Links de navegação, ações secundárias textuais
          </p>
        </section>

        {/* Combined Example */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-[#8C3A27]/10">
          <h2 className="text-2xl font-bold text-[#1E1E1E] mb-6">Exemplo de Uso Combinado</h2>
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-[#8C3A27]/10">
              <div>
                <h3 className="font-bold text-[#1E1E1E]">Confirmar Ação</h3>
                <p className="text-sm text-[#1E1E1E]/60">Tem certeza que deseja continuar?</p>
              </div>
              <Button variant="ghost" size="icon">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline">Cancelar</Button>
              <Button variant="primary">
                <Check className="w-4 h-4" />
                Confirmar
              </Button>
            </div>
          </div>
        </section>

        {/* Full Width Example */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-[#8C3A27]/10">
          <h2 className="text-2xl font-bold text-[#1E1E1E] mb-6">Botões de Largura Completa</h2>
          <div className="space-y-3 max-w-md">
            <Button variant="primary" className="w-full">
              <Save className="w-4 h-4" />
              Salvar Alterações
            </Button>
            <Button variant="outline" className="w-full">
              Cancelar
            </Button>
          </div>
        </section>

        {/* Color Reference */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-[#8C3A27]/10">
          <h2 className="text-2xl font-bold text-[#1E1E1E] mb-6">Paleta de Cores</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-full h-20 bg-[#3B5935] rounded-xl mb-2 shadow-sm"></div>
              <p className="text-sm font-bold text-[#1E1E1E]">Verde Primary</p>
              <p className="text-xs text-[#1E1E1E]/60">#3B5935</p>
            </div>
            <div className="text-center">
              <div className="w-full h-20 bg-[#EC3759] rounded-xl mb-2 shadow-sm"></div>
              <p className="text-sm font-bold text-[#1E1E1E]">Vermelho Danger</p>
              <p className="text-xs text-[#1E1E1E]/60">#EC3759</p>
            </div>
            <div className="text-center">
              <div className="w-full h-20 bg-[#F2C94C] rounded-xl mb-2 shadow-sm"></div>
              <p className="text-sm font-bold text-[#1E1E1E]">Amarelo Warning</p>
              <p className="text-xs text-[#1E1E1E]/60">#F2C94C</p>
            </div>
            <div className="text-center">
              <div className="w-full h-20 bg-[#8C3A27] rounded-xl mb-2 shadow-sm"></div>
              <p className="text-sm font-bold text-[#1E1E1E]">Marrom Accent</p>
              <p className="text-xs text-[#1E1E1E]/60">#8C3A27</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
