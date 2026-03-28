'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  ProjectStatus,
  Project,
} from '@/lib/types/index';
import type { Database } from '@/lib/database.types';
import { MapPin, Filter, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Profile = Database['public']['Tables']['profiles']['Row'];

// latitude and longitude are now on the Project type from the DB
type ProjectWithCoords = Project;

interface MapProjectMarker {
  id: string;
  name: string;
  status?: ProjectStatus;
  lat: number;
  lng: number;
}

export default function ProjectMapPage() {
  const [_profile, setProfile] = useState<Profile | null>(null);
  const [_projects, setProjects] = useState<ProjectWithCoords[]>([]);
  const [mapProjects, setMapProjects] = useState<MapProjectMarker[]>([]);
  const [noLocationProjects, setNoLocationProjects] = useState<ProjectWithCoords[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | 'all'>('all');
  const [showFilter, setShowFilter] = useState(false);
  const _router = useRouter();

  const supabase = createClient();

  useEffect(() => {
    loadProjects();
  }, [supabase]);

  const loadProjects = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Could not fetch user');

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      if (profileData) {
        // Fetch all projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('organization_id', profileData.organization_id)
          .order('created_at', { ascending: false });

        if (projectsError) throw projectsError;

        setProjects(projectsData || []);

        // Separate projects with and without coordinates
        const withCoords: MapProjectMarker[] = [];
        const withoutCoords: ProjectWithCoords[] = [];

        (projectsData || []).forEach((project: ProjectWithCoords) => {
          // Try to extract latitude/longitude from metadata or address
          let lat: number | undefined;
          let lng: number | undefined;

          if (project.metadata) {
            const meta = typeof project.metadata === 'string'
              ? JSON.parse(project.metadata)
              : project.metadata;
            if (meta.latitude && meta.longitude) {
              lat = parseFloat(meta.latitude);
              lng = parseFloat(meta.longitude);
            }
          }

          if (lat !== undefined && lng !== undefined) {
            withCoords.push({
              id: project.id,
              name: project.name,
              status: project.status as ProjectStatus | undefined,
              lat,
              lng,
            });
          } else {
            withoutCoords.push(project);
          }
        });

        setMapProjects(withCoords);
        setNoLocationProjects(withoutCoords);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const filteredMapProjects = selectedStatus === 'all'
    ? mapProjects
    : mapProjects.filter(p => p.status === selectedStatus);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">
            Project Map
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">View all projects on a map.</p>
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">
            Project Map
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visualize all projects on an interactive map.
          </p>
        </div>
        <Link href="/app/projects">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        <Button
          variant={showFilter ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={() => setShowFilter(!showFilter)}
        >
          <Filter className="w-4 h-4" />
          Filters
        </Button>
        {showFilter && (
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus('all')}
            >
              All
            </Button>
            {['draft', 'active', 'on_hold', 'completed', 'archived'].map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus(status as ProjectStatus)}
              >
                {PROJECT_STATUS_LABELS[status as ProjectStatus]}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Map Section */}
      {filteredMapProjects.length > 0 ? (
        <Card
          className="p-4"
          style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}
        >
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Map View
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredMapProjects.length} project{filteredMapProjects.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Note: ProjectMap component would be rendered here */}
            {/* <ProjectMap projects={filteredMapProjects} height="400px" /> */}

            {/* Map Placeholder with Project List */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center min-h-96 flex items-center justify-center">
              <div className="space-y-3">
                <MapPin className="w-12 h-12 mx-auto text-gray-400" />
                <p className="text-sm text-muted-foreground">
                  Interactive map would render here with MapBox or Google Maps
                </p>
                <p className="text-xs text-gray-400">
                  {filteredMapProjects.length} project{filteredMapProjects.length !== 1 ? 's' : ''} with location data
                </p>
              </div>
            </div>

            {/* Project List View */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Projects on Map</h3>
              <div className="grid gap-2">
                {filteredMapProjects.map((project) => {
                  const colors = PROJECT_STATUS_COLORS[project.status || 'draft'];
                  return (
                    <Link key={project.id} href={`/app/projects/${project.id}`}>
                      <button
                        className="w-full p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-left flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <MapPin className="w-4 h-4" style={{ color: '#1B3B2D' }} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {project.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {project.lat.toFixed(4)}, {project.lng.toFixed(4)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colors.bg} ${colors.text}`}
                        >
                          {PROJECT_STATUS_LABELS[project.status || 'draft']}
                        </span>
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card
          className="p-6 text-center"
          style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}
        >
          <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-muted-foreground">
            No projects with location data found. Add location coordinates to projects to see them here.
          </p>
        </Card>
      )}

      {/* Projects Without Location */}
      {noLocationProjects.length > 0 && (
        <Card
          className="p-6"
          style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}
        >
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Projects Without Location
              </h2>
              <p className="text-sm text-muted-foreground">
                {noLocationProjects.length} project{noLocationProjects.length !== 1 ? 's' : ''} need geocoding
              </p>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {noLocationProjects.map((project) => {
                const status = (project.status as ProjectStatus | null) || 'draft';
                const colors = PROJECT_STATUS_COLORS[status];
                return (
                  <Link key={project.id} href={`/app/projects/${project.id}`}>
                    <button
                      className="w-full p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-left flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {project.address || 'No address'}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colors.bg} ${colors.text}`}
                      >
                        {PROJECT_STATUS_LABELS[status]}
                      </span>
                    </button>
                  </Link>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground italic">
              Tip: Add location coordinates to project metadata to display them on the map.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
