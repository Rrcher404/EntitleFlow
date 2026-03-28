'use client';

import React, { useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
} from '@vis.gl/react-google-maps';

interface Project {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  lat?: number;
  lng?: number;
}

interface ProjectMapProps {
  projects: Project[];
  height?: string;
  onProjectClick?: (id: string) => void;
}

const NORTH_CAROLINA_CENTER = { lat: 35.7596, lng: -79.0193 };
const DEFAULT_ZOOM = 7;

// Custom marker styling using design tokens
const MarkerIcon = () => (
  <div
    className="flex items-center justify-center w-8 h-8 rounded-full shadow-md"
    style={{
      backgroundColor: '#1B3B2D', // forest primary
      border: '3px solid #D4A937', // gold accent
    }}
  >
    <div className="w-2 h-2 bg-white rounded-full" />
  </div>
);

export const ProjectMap: React.FC<ProjectMapProps> = ({
  projects,
  height = '400px',
  onProjectClick,
}) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div
        style={{ height, borderColor: '#E8E0D0' }}
        className="flex items-center justify-center rounded-lg border"
      >
        <p className="text-sm" style={{ color: '#1B3B2D' }}>
          Google Maps API key not configured
        </p>
      </div>
    );
  }

  // Filter projects that have coordinates
  const projectsWithCoords = projects.filter((p) => p.lat && p.lng);

  return (
    <APIProvider apiKey={apiKey}>
      <div
        style={{ height, borderColor: '#E8E0D0' }}
        className="rounded-lg overflow-hidden border"
      >
        <Map
          zoom={DEFAULT_ZOOM}
          center={NORTH_CAROLINA_CENTER}
          mapId="entitleflow-project-map"
          gestureHandling="auto"
        >
          {projectsWithCoords.map((project) => (
            <ProjectMarker
              key={project.id}
              project={project}
              onMarkerClick={() => onProjectClick?.(project.id)}
            />
          ))}
        </Map>
      </div>
    </APIProvider>
  );
};

interface ProjectMarkerProps {
  project: Project;
  onMarkerClick: () => void;
}

const ProjectMarker: React.FC<ProjectMarkerProps> = ({ project, onMarkerClick }) => {
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);

  if (!project.lat || !project.lng) return null;

  const displayAddress = [project.address, project.city]
    .filter(Boolean)
    .join(', ');

  return (
    <AdvancedMarker
      position={{ lat: project.lat, lng: project.lng }}
      onClick={() => {
        setInfoWindowOpen(true);
        onMarkerClick();
      }}
    >
      <MarkerIcon />

      {infoWindowOpen && (
        <InfoWindow
          onCloseClick={() => setInfoWindowOpen(false)}
          position={{ lat: project.lat, lng: project.lng }}
        >
          <div className="p-2" style={{ minWidth: '200px' }}>
            <h3
              className="font-semibold text-sm mb-1"
              style={{ color: '#1B3B2D' }}
            >
              {project.name}
            </h3>
            {displayAddress && (
              <p className="text-xs" style={{ color: '#666' }}>
                {displayAddress}
              </p>
            )}
          </div>
        </InfoWindow>
      )}
    </AdvancedMarker>
  );
};
