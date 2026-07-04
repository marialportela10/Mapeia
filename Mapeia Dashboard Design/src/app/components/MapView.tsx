import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useSupercluster from 'use-supercluster';
import { Property } from '../types';

interface MapViewProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (property: Property | null) => void;
}

const statusColors: Record<string, string> = {
  security_risk: '#EC3759',
  structural_risk: '#F2C94C',
  monitoring: '#3B5935',
  sanitary_waste: '#8C3A27',
  zoonosis_risk: '#F97316',
};

const ZOOM_THRESHOLD = 14;

function createCustomIcon(status: string, isSelected: boolean) {
  const color = statusColors[status] || '#3B5935';
  const size = isSelected ? 40 : 32;

  return L.divIcon({
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        <svg width="${size}" height="${size}" viewBox="0 0 24 36" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
          <path d="M12 0C7.032 0 3 4.032 3 9c0 6.75 9 18 9 18s9-11.25 9-18c0-4.968-4.032-9-9-9z"
                fill="${color}"
                stroke="white"
                stroke-width="1.5"
                opacity="${isSelected ? '1' : '0.85'}" />
          <circle cx="12" cy="9" r="3.5" fill="white" opacity="0.9"/>
        </svg>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

function RecenterAutomatically({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 16, { animate: true });
  }, [lat, lng, map]);
  return null;
}

const superclusterOptions = { 
  radius: 80, 
  maxZoom: ZOOM_THRESHOLD,
  initial: () => ({ statuses: {} as Record<string, number> }),
  map: (props: any) => ({ statuses: { [props.status]: 1 } }),
  reduce: (acc: any, props: any) => {
    Object.entries(props.statuses).forEach(([status, count]) => {
      acc.statuses[status] = (acc.statuses[status] || 0) + (count as number);
    });
  }
};

function HeatmapLayer({ properties }: { properties: Property[] }) {
  const map = useMap();
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);
  const [zoom, setZoom] = useState(map.getZoom());

  const updateMapState = useCallback(() => {
    const b = map.getBounds();
    const newBounds: [number, number, number, number] = [
      b.getSouthWest().lng,
      b.getSouthWest().lat,
      b.getNorthEast().lng,
      b.getNorthEast().lat
    ];
    
    setBounds(prev => {
      if (!prev) return newBounds;
      if (
        prev[0] === newBounds[0] && 
        prev[1] === newBounds[1] && 
        prev[2] === newBounds[2] && 
        prev[3] === newBounds[3]
      ) {
        return prev;
      }
      return newBounds;
    });

    setZoom(prevZoom => {
      const newZoom = map.getZoom();
      return prevZoom === newZoom ? prevZoom : newZoom;
    });
  }, [map]);

  useEffect(() => {
    updateMapState();
    map.on('moveend', updateMapState);
    map.on('zoomend', updateMapState);
    return () => {
      map.off('moveend', updateMapState);
      map.off('zoomend', updateMapState);
    };
  }, [map, updateMapState]);

  const points = React.useMemo(() => {
    return properties.map(p => ({
      type: 'Feature' as const,
      properties: {
        cluster: false,
        propertyId: p.id,
        status: p.status,
      },
      geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] }
    }));
  }, [properties]);

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds: bounds || undefined,
    zoom,
    options: superclusterOptions
  });

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '59, 89, 53';
  };

  return (
    <>
      {clusters.map(cluster => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        const { cluster: isCluster, point_count: pointCount, propertyId, status, statuses } = cluster.properties;

        if (isCluster) {
          // Find the dominant status
          let dominantStatus = 'monitoring';
          let maxCount = 0;
          if (statuses) {
            Object.entries(statuses).forEach(([s, count]) => {
              if (count > maxCount) {
                maxCount = count;
                dominantStatus = s;
              }
            });
          }

          const baseColor = statusColors[dominantStatus] || '#3B5935';
          const rgbColor = hexToRgb(baseColor);

          // Calculate intensity based on arbitrary max count for a cluster
          const intensity = Math.min(pointCount / 50, 1); // Caps at 50 properties
          const opacity = 0.6 + (intensity * 0.3); // Ranges from 0.6 to 0.9
          const size = 45 + (intensity * 25); // Ranges from 45px to 70px

          const clusterIcon = L.divIcon({
            html: `
              <div style="
                width: ${size}px; 
                height: ${size}px; 
                background-color: rgba(${rgbColor}, ${opacity}); 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: ${size > 55 ? 18 : 15}px;
                transition: all 0.3s ease;
              ">
                ${pointCount}
              </div>
            `,
            className: 'custom-cluster-icon',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
          });

          return (
            <Marker
              key={`cluster-${cluster.id}`}
              position={[latitude, longitude]}
              icon={clusterIcon}
              eventHandlers={{
                click: () => {
                  if (supercluster) {
                    const expansionZoom = Math.min(
                      supercluster.getClusterExpansionZoom(cluster.id as number),
                      ZOOM_THRESHOLD + 1
                    );
                    map.setView([latitude, longitude], expansionZoom, { animate: true });
                  }
                }
              }}
            />
          );
        }

        // Single unclustered point
        return (
          <CircleMarker
            key={`heat-${propertyId}`}
            center={[latitude, longitude]}
            radius={20}
            pathOptions={{
              color: statusColors[status] || '#3B5935',
              fillColor: statusColors[status] || '#3B5935',
              fillOpacity: 0.6,
              stroke: false,
            }}
            eventHandlers={{
              click: () => {
                map.setView([latitude, longitude], ZOOM_THRESHOLD + 1, { animate: true });
              }
            }}
          />
        );
      })}
    </>
  );
}

function MarkerLayer({ properties, selectedProperty, onSelectProperty }: {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (property: Property | null) => void;
}) {
  return (
    <>
      {properties.map((property) => (
        <Marker
          key={property.id}
          position={[property.lat, property.lng]}
          icon={createCustomIcon(property.status, selectedProperty?.id === property.id)}
          eventHandlers={{
            click: () => onSelectProperty(property),
          }}
        />
      ))}
    </>
  );
}

function ZoomController({ properties, selectedProperty, onSelectProperty }: MapViewProps) {
  const [zoom, setZoom] = useState(13);
  const map = useMapEvents({
    zoomend: () => {
      setZoom(prev => {
        const current = map.getZoom();
        return prev === current ? prev : current;
      });
    },
  });

  return (
    <>
      {zoom < ZOOM_THRESHOLD ? (
        <HeatmapLayer properties={properties} />
      ) : (
        <MarkerLayer
          properties={properties}
          selectedProperty={selectedProperty}
          onSelectProperty={onSelectProperty}
        />
      )}
    </>
  );
}

export function MapView({ properties, selectedProperty, onSelectProperty }: MapViewProps) {
  const center = { lat: -8.0476, lng: -34.8770 };

  // Atualizado com a sua nova área menor e corrigindo a ordem de longitude (Oeste/Leste)
  const RECIFE_BOUNDS: L.LatLngBoundsLiteral = [
    [-8.19115208116946, -35.24527101536901], // Southwest (Sul, Oeste)
    [-7.8923393278319764, -34.65166600346045], // Northeast (Norte, Leste)
  ];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        minZoom={12.3}
        maxBounds={RECIFE_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <ZoomController
          properties={properties}
          selectedProperty={selectedProperty}
          onSelectProperty={onSelectProperty}
        />

        {selectedProperty && (
          <RecenterAutomatically lat={selectedProperty.lat} lng={selectedProperty.lng} />
        )}
      </MapContainer>
    </div>
  );
}