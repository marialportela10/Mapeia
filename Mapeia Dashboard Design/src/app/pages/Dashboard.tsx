import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { MapView } from '../components/MapView';
import { PropertyCard } from '../components/PropertyCard';
import { DenunciaModal } from '../components/DenunciaModal';
import { Property } from '../types';
import { Menu, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useLayoutContext } from '../contexts/LayoutContext';
import { useAuth } from '../contexts/AuthContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import fallbackImage from "../../imports/image_2.png";

import { getProperties, createProperty } from '../lib/api';

const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    lat: -8.0476,
    lng: -34.8770,
    address: 'Rua do Bom Jesus, 120 - Bairro do Recife',
    rpa: 'DS I',
    size: 450,
    debt: 125000,
    status: 'structural_risk',
    risks: ['structural_risk', 'security_risk'],
    abandonmentTime: '4 anos e 2 meses',
    imageUrl: fallbackImage
  },
  {
    id: '2',
    lat: -8.0520,
    lng: -34.8820,
    address: 'Av. Conde da Boa Vista, 450 - Boa Vista',
    rpa: 'DS I',
    size: 1200,
    debt: 340000,
    status: 'security_risk',
    risks: ['security_risk', 'sanitary_waste'],
    abandonmentTime: '6 anos',
    imageUrl: fallbackImage
  },
  {
    id: '3',
    lat: -8.0350,
    lng: -34.8900,
    address: 'Rua da Aurora, 890 - Santo Amaro',
    rpa: 'DS I',
    size: 200,
    debt: 15000,
    status: 'monitoring',
    risks: ['monitoring'],
    abandonmentTime: '1 ano e 5 meses',
    imageUrl: fallbackImage
  },
  {
    id: '4',
    lat: -8.0610,
    lng: -34.8980,
    address: 'Rua Imperial, 1500 - São José',
    rpa: 'DS I',
    size: 800,
    debt: 50000,
    status: 'structural_risk',
    risks: ['structural_risk', 'zoonosis_risk'],
    abandonmentTime: '3 anos',
    imageUrl: fallbackImage
  },
  {
    id: '5',
    lat: -8.1150,
    lng: -34.8950,
    address: 'Av. Conselheiro Aguiar, 340 - Boa Viagem',
    rpa: 'DS VI',
    size: 600,
    debt: 200000,
    status: 'monitoring',
    abandonmentTime: '2 anos',
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isNavOpen, isDashboardSidebarOpen, setIsDashboardSidebarOpen } = useLayoutContext();
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRpa, setSelectedRpa] = useState('Todos');
  const [minSize, setMinSize] = useState<number>(0);
  const [debtFilter, setDebtFilter] = useState<string>('Qualquer valor');
  const [riskFilter, setRiskFilter] = useState<string>('Todos');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDenunciaModalOpen, setIsDenunciaModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const data = await getProperties();
      if (data.length === 0) {
        // Seed database
        await Promise.all(MOCK_PROPERTIES.map(p => createProperty(p)));
        const newData = await getProperties();
        setProperties(newData);
      } else {
        setProperties(data);
      }
    } catch (e) {
      console.error('Failed to load properties:', e);
      setProperties(MOCK_PROPERTIES); // fallback
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync window size on mount/resize for dashboard sidebar default state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsDashboardSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsDashboardSidebarOpen]);

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRpa = selectedRpa === 'Todos' || p.rpa === selectedRpa;
    const matchesSize = (p.size || 0) >= minSize;
    let matchesDebt = true;
    if (debtFilter === 'Até R$ 10.000') matchesDebt = (p.debt || 0) <= 10000;
    else if (debtFilter === 'R$ 10.000 - R$ 50.000') matchesDebt = (p.debt || 0) > 10000 && (p.debt || 0) <= 50000;
    else if (debtFilter === 'Acima de R$ 50.000') matchesDebt = (p.debt || 0) > 50000;
    
    const matchesRisk = riskFilter === 'Todos' || (p.risks?.includes(riskFilter) || p.status === riskFilter);

    return matchesSearch && matchesRpa && matchesSize && matchesDebt && matchesRisk;
  });

  const handleToggleSidebar = () => {
    setIsDashboardSidebarOpen(!isDashboardSidebarOpen);
    setSelectedProperty(null);
  };

  const handleSelectProperty = (property: Property | null) => {
    setSelectedProperty(property);
    if (property && window.innerWidth < 768) {
      setIsDashboardSidebarOpen(false);
    }
  };

  return (
    <div className="w-full h-full flex relative">
      {!isDashboardSidebarOpen && (
        <Button
          onClick={handleToggleSidebar}
          className="md:hidden absolute top-4 left-1/2 -translate-x-1/2 z-[35] rounded-full shadow-lg flex items-center gap-2 bg-white text-[#1E1E1E] border border-gray-200 hover:bg-gray-50 px-6 py-2.5 font-semibold"
        >
          <Menu className="w-4 h-4 text-[#8C3A27]" />
          Filtros e Busca
        </Button>
      )}

      <Sidebar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedRpa={selectedRpa}
        setSelectedRpa={setSelectedRpa}
        minSize={minSize}
        setMinSize={setMinSize}
        debtFilter={debtFilter}
        setDebtFilter={setDebtFilter}
        riskFilter={riskFilter}
        setRiskFilter={setRiskFilter}
        isOpen={isDashboardSidebarOpen}
        onToggle={handleToggleSidebar}
        onOpenDenuncia={() => setIsDenunciaModalOpen(true)}
        filteredProperties={filteredProperties}
        onSelectProperty={handleSelectProperty}
      />
      
      <div className="flex-1 relative h-full">
        <MapView
          properties={filteredProperties}
          selectedProperty={selectedProperty}
          onSelectProperty={handleSelectProperty}
        />

        {selectedProperty && (
          <PropertyCard
            property={selectedProperty}
            onClose={() => setSelectedProperty(null)}
            onUpdate={loadData}
          />
        )}
      </div>

      <DenunciaModal
        isOpen={isDenunciaModalOpen}
        onClose={() => setIsDenunciaModalOpen(false)}
        onSuccess={loadData}
      />

      {/* Floating Action Button - Mobile Only */}
      {user?.role !== 'Visualizador' && (
        <></>
      )}
    </div>
  );
}