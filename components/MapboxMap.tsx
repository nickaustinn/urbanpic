"use client";

import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Report {
  id: string;
  issueType: string;
  severity: string;
  description: string;
  department: string;
  latitude: number;
  longitude: number;
  address?: string;
  status: string;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  POTHOLE: "#ef4444",
  GRAFFITI: "#f97316",
  BROKEN_STREETLIGHT: "#eab308",
  ILLEGAL_DUMPING: "#8b5cf6",
  ABANDONED_VEHICLE: "#06b6d4",
  DAMAGED_SIDEWALK: "#ec4899",
  FLOODING: "#3b82f6",
  OTHER: "#6b7280",
};

const ISSUE_LABELS: Record<string, string> = {
  POTHOLE: "Pothole",
  GRAFFITI: "Graffiti",
  BROKEN_STREETLIGHT: "Broken Streetlight",
  ILLEGAL_DUMPING: "Illegal Dumping",
  ABANDONED_VEHICLE: "Abandoned Vehicle",
  DAMAGED_SIDEWALK: "Damaged Sidewalk",
  FLOODING: "Flooding",
  OTHER: "Other",
};

export default function MapboxMap({ reports }: { reports: Report[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPS_API_KEY ?? "";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-122.4194, 37.7749], // San Francisco default
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      const geojson: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: reports.map((r) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [r.longitude, r.latitude] },
          properties: {
            id: r.id,
            issueType: r.issueType,
            severity: r.severity,
            description: r.description,
            department: r.department,
            status: r.status,
            createdAt: r.createdAt,
            color: TYPE_COLORS[r.issueType] ?? "#6b7280",
            label: ISSUE_LABELS[r.issueType] ?? "Other",
          },
        })),
      };

      map.current!.addSource("reports", {
        type: "geojson",
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Cluster circles
      map.current!.addLayer({
        id: "clusters",
        type: "circle",
        source: "reports",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#0284c7",
          "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 50, 40],
          "circle-opacity": 0.85,
        },
      });

      // Cluster count labels
      map.current!.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "reports",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-size": 13,
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        },
        paint: { "text-color": "#ffffff" },
      });

      // Individual markers
      map.current!.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "reports",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Click cluster → zoom in
      map.current!.on("click", "clusters", (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        const clusterId = features[0].properties?.cluster_id;
        (map.current!.getSource("reports") as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
          clusterId,
          (err, zoom) => {
            if (err) return;
            map.current!.easeTo({
              center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
              zoom: zoom ?? 14,
            });
          }
        );
      });

      // Click individual marker → popup
      map.current!.on("click", "unclustered-point", (e) => {
        const props = e.features?.[0]?.properties;
        if (!props) return;
        const coords = (e.features![0].geometry as GeoJSON.Point).coordinates as [number, number];
        const date = new Date(props.createdAt).toLocaleDateString();

        new mapboxgl.Popup({ offset: 12 })
          .setLngLat(coords)
          .setHTML(`
            <div style="font-family:sans-serif;max-width:200px">
              <p style="font-weight:600;margin:0 0 4px">${props.label}</p>
              <p style="font-size:12px;color:#555;margin:0 0 4px">${props.description.slice(0, 100)}…</p>
              <p style="font-size:11px;color:#888;margin:0">${date} · ${props.status.replace("_"," ")}</p>
            </div>
          `)
          .addTo(map.current!);
      });

      map.current!.on("mouseenter", "clusters", () => { map.current!.getCanvas().style.cursor = "pointer"; });
      map.current!.on("mouseleave", "clusters", () => { map.current!.getCanvas().style.cursor = ""; });
      map.current!.on("mouseenter", "unclustered-point", () => { map.current!.getCanvas().style.cursor = "pointer"; });
      map.current!.on("mouseleave", "unclustered-point", () => { map.current!.getCanvas().style.cursor = ""; });
    });

    return () => map.current?.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update data when filter changes without re-creating the map
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    const source = map.current.getSource("reports") as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData({
      type: "FeatureCollection",
      features: reports.map((r) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [r.longitude, r.latitude] },
        properties: {
          id: r.id,
          issueType: r.issueType,
          severity: r.severity,
          description: r.description,
          department: r.department,
          status: r.status,
          createdAt: r.createdAt,
          color: TYPE_COLORS[r.issueType] ?? "#6b7280",
          label: ISSUE_LABELS[r.issueType] ?? "Other",
        },
      })),
    });
  }, [reports]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
