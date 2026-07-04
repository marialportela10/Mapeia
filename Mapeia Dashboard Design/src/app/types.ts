export type PropertyStatus = 'monitoring' | 'structural_risk' | 'security_risk' | 'sanitary_waste' | 'zoonosis_risk';

export interface Property {
  id: string;
  lat: number;
  lng: number;
  address: string;
  rpa: string;
  size: number;
  debt: number;
  status: PropertyStatus;
  abandonmentTime: string;
  details?: string;
  imageUrl?: string;
  galleryUrls?: string[];
  reportUrl?: string;
  risks?: string[];
  source?: 'citizen' | 'system';
}

export const DISTRITOS_SANITARIOS = [
  { value: 'DS I', label: 'Distrito Sanitário I', short: 'DS I', bairros: 'Recife, Santo Amaro, Boa Vista, Cabanga, Ilha do Leite, Paissandu, Santo Antônio, São José, Coelhos, Soledade, Ilha Joana Bezerra' },
  { value: 'DS II', label: 'Distrito Sanitário II', short: 'DS II', bairros: 'Alto Santa Terezinha, Água Fria, Arruda, Beberibe, Bomba do Hemetério, Campo Grande, Cajueiro, Campina do Barreto, Dois Unidos, Encruzilhada, Fundão, Hipódromo, Linha do Tiro, Ponto de Parada, Porto da Madeira, Peixinhos, Rosarinho, Torreão' },
  { value: 'DS III', label: 'Distrito Sanitário III', short: 'DS III', bairros: 'Aflitos, Alto do Mandu, Apipucos, Casa Amarela, Casa Forte, Derby, Dois Irmãos, Espinheiro, Graças, Jaqueira, Monteiro, Parnamirim, Poço, Santana, Sítio dos Pintos, Tamarineira' },
  { value: 'DS IV', label: 'Distrito Sanitário IV', short: 'DS IV', bairros: 'Caxangá, Cidade Universitária, Cordeiro, Engenho do Meio, Ilha do Retiro, Iputinga, Madalena, Prado, Torre, Torrões, Várzea, Zumbi' },
  { value: 'DS V', label: 'Distrito Sanitário V', short: 'DS V', bairros: 'Afogados, Areias, Barro, Bongi, Caçote, Coqueiral, Curado, Estância, Jardim São Paulo, Jiquiá, Mangueira, Mustardinha, Sancho, San Martin, Tejipió, Totó' },
  { value: 'DS VI', label: 'Distrito Sanitário VI', short: 'DS VI', bairros: 'Boa Viagem, Brasília Teimosa, Imbiribeira, Ipsep, Pina' },
  { value: 'DS VII', label: 'Distrito Sanitário VII', short: 'DS VII', bairros: 'Alto José Bonifácio, Alto José do Pinho, Brejo do Guabiraba, Brejo do Beberibe, Córrego do Jenipapo, Guabiraba, Macaxeira, Mangabeira, Morro da Conceição, Nova Descoberta, Passarinho, Pau Ferro, Vasco da Gama' },
  { value: 'DS VIII', label: 'Distrito Sanitário VIII', short: 'DS VIII', bairros: 'Cohab, Ibura, Jordão' },
];

export const RISK_TYPES = [
  { value: 'monitoring', label: 'Em Monitoramento', description: 'Sem risco iminente', color: '#3B5935' },
  { value: 'structural_risk', label: 'Risco Estrutural', description: 'Ameaça de colapso estrutural', color: '#F2C94C' },
  { value: 'security_risk', label: 'Risco de Segurança', description: 'Ocupação irregular / Criminalidade', color: '#EC3759' },
  { value: 'sanitary_waste', label: 'Risco Sanitário — Resíduos', description: 'Despejo inadequado de lixo', color: '#8C3A27' },
  { value: 'zoonosis_risk', label: 'Risco Sanitário — Zoonoses', description: 'Concentração de água parada e/ou contaminada', color: '#F97316' },
];

export const RISK_PRIORITY: Record<string, number> = {
  security_risk: 5,
  structural_risk: 4,
  sanitary_waste: 3,
  zoonosis_risk: 2,
  monitoring: 1,
};

export interface PropertyHistory {
  id: string;
  property_id: string;
  action: string;
  author: string;
  agency?: string;
  created_at: string;
}

export type UserRole = 'Visualizador' | 'Editor' | 'Admin';
export type UserStatus = 'Ativo' | 'Inativo';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  agency: string;
  role: UserRole;
  status: UserStatus;
}

export function derivePrimaryStatus(risks: string[]): PropertyStatus {
  if (!risks || risks.length === 0) return 'monitoring';
  return risks.reduce((top, r) => {
    return (RISK_PRIORITY[r] || 0) > (RISK_PRIORITY[top] || 0) ? r : top;
  }, 'monitoring') as PropertyStatus;
}
