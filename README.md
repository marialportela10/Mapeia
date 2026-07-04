# 📍 Mapeia

> **Mapeia** é uma plataforma GovTech transparente e colaborativa projetada para unificar dados urbanos, combater o abandono de propriedades e impulsionar a função social da propriedade e a moradia popular no Recife.

---

## 📖 Sobre o Projeto

O Recife enfrenta uma contradição urbana crítica: de um lado, o deficit habitacional; de outro, dezenas de casarões históricos ociosos e degradados no Centro, cujas informações estão fragmentadas entre diferentes secretarias e cartórios. 

O **Mapeia** resolve esse gargalo conectando o monitoramento de campo feito por cidadãos e movimentos sociais de base à inteligência de dados públicos. Através do *crowdsourcing*, a plataforma atua como um sensor territorial em tempo real. Ela georreferencia imóveis ociosos e utiliza algoritmos de triagem para cruzar dados de vacância fiscal com critérios de segurança estrutural, gerando relatórios automatizados que identificam edificações seguras e aptas para Habitação de Interesse Social (HIS).

### 🏛️ Inspiração Cultural: O Cobogó e o Marco Zero
O design do Mapeia foi inspirado em símbolos do Recife:
* **O Cobogó:** Assim como o elemento arquitetônico pernambucano permite a entrada de luz e ventilação sem comprometer a segurança, nossa plataforma traz transparência e "ventilação" a dados públicos antes isolados.
* **O Marco Zero:** Funciona como o nosso centro de coordenadas. Começamos mapeando o centro histórico adormecido para expandir rotas de intervenção e moradia por toda a cidade.

---

## ✨ Funcionalidades Principais

* **🗺️ Mapa Interativo e Colaborativo:** Visualização em tempo real de imóveis georreferenciados utilizando cores semânticas baseadas em riscos e ociosidade:
  * <span style="color:#EC3759">■</span> **Vermelho (#EC3759):** Alto risco estrutural ou ociosidade crítica.
  * <span style="color:#F2C94C">■</span> **Amarelo (#F2C94C):** Avisos e monitoramento moderado.
  * <span style="color:#385936">■</span> **Verde (#385936):** Imóvel monitorado e validado como estruturalmente seguro.
* **📱 Canal de Denúncia Direta:** Formulário simplificado e de baixa fricção para envio de reportes de campo (fotos, localização e notas da comunidade) sem a obrigatoriedade de logins governamentais burocráticos.
* **📋 Checklist Dinâmico de Riscos:** Identificação ágil e múltipla de vulnerabilidades locais na ponta:
  * Moradia irregular / Ocupação vulnerável.
  * Risco estrutural (ameaça de colapso/desabamento).
  * Focos de vetores de doenças e criadouros de *Aedes aegypti* (água parada).
  * Acúmulo de lixo, entulhos e infiltração generalizada.
* **📊 Dashboard Administrativo & Dossiê de Visibilidade:** Painel gerencial focado em tomadores de decisão (Gestores Públicos, Defesa Civil e Jurídico de movimentos sociais). Consolida dados fiscais e evidências físicas coletadas em um relatório unificado e pronto para embasar processos de desapropriação ou intervenção.

---

## 🎨 Design & Processo de Desenvolvimento

A especificação, arquitetura de informação e usabilidade da interface foram integralmente projetadas e amadurecidas no **Figma**, utilizando recursos de IA integradas ao ecossistema de design para acelerar a prototipagem de baixa e alta fidelidade. 

### Características do Design System (Style Guide)
* **Tipografia:** `Poppins` para corpo de texto e títulos, garantindo excelente legibilidade e interface escaneável.
* **Bordas:** `border-radius: 12px (rounded-xl)` padronizado em todos os componentes e cartazes.
* **Paleta de Cores Proprietária:** Baseada na identidade de Recife (Mangue e Patrimônio):
  * Vermelho Principal (Logo & Ações Críticas): `#EC3759`
  * Verde Secundário (Eco-Força & Segurança): `#385936`
  * Marrom Mangue (História & Solo): `#8C3A27`
  * Fundo Claro (Areia/Conforto Visual): `#E8E3D9`

---

## 🛡️ Restrições e Engenharia de Requisitos

* **Privacidade e Acessibilidade:** O fluxo de coleta de dados de campo foi desenhado para ser **anônimo e descentralizado**, eliminando o medo de perseguição jurídica e incentivando a colaboração comunitária massiva de movimentos de base.
* **Escopo Técnico Realista:** O sistema foca em cruzar dados fiscais que já são de domínio público da prefeitura (débitos consolidados de IPTU) e dados físicos visíveis do território, garantindo viabilidade jurídica e técnica imediata através de APIs institucionais sem quebrar leis de sigilo de dados civis.

```
