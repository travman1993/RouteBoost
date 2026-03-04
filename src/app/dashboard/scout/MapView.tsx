'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Recommendation {
  name: string;
  address: string;
  lat: number;
  lng: number;
  score: number;
  reasoning: string;
  crowd_type: string;
  best_hours: string;
  type: string;
}

interface HeatPoint {
  lat: number;
  lng: number;
  intensity: number;
}

interface MapViewProps {
  recommendations: Recommendation[];
  heatPoints: HeatPoint[];
  selectedSpot: number | null;
  onSelectSpot: (index: number) => void;
}

function getCloudColor(score: number) {
  if (score >= 80) return { r: 255, g: 60, b: 0 };
  if (score >= 65) return { r: 255, g: 130, b: 0 };
  if (score >= 50) return { r: 255, g: 184, b: 77 };
  return { r: 100, g: 110, b: 140 };
}

// Generate organic blob polygon points around a center
function generateBlobPoints(
  centerLat: number,
  centerLng: number,
  baseRadius: number, // in degrees
  irregularity: number // 0-1, how irregular
): L.LatLng[] {
  const points: L.LatLng[] = [];
  const numPoints = 12 + Math.floor(Math.random() * 6);

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    // Randomize radius for each point
    const radiusNoise = 1 + (Math.random() - 0.5) * 2 * irregularity;
    const r = baseRadius * radiusNoise;
    // Slight angular jitter
    const angleNoise = (Math.random() - 0.5) * (Math.PI * 2 / numPoints) * 0.5;
    const lat = centerLat + Math.sin(angle + angleNoise) * r;
    const lng = centerLng + Math.cos(angle + angleNoise) * r * 1.3; // stretch for lng
    points.push(L.latLng(lat, lng));
  }

  // Close the shape
  points.push(points[0]);
  return points;
}

// Create multiple layered blobs for one cloud
function createCloudLayers(
    map: L.Map,
    lat: number,
    lng: number,
    score: number,
    isSelected: boolean
  ): L.Layer[] {
    const layers: L.Layer[] = [];
    const color = getCloudColor(score);
    const boost = isSelected ? 1.35 : 1;
    const baseSize = (0.003 + (score / 100) * 0.006) * boost;
  
    // Generate 8 concentric fading layers for soft edges
    const numRings = 8;
    for (let ring = numRings; ring >= 1; ring--) {
      const ringRatio = ring / numRings;
      const ringSize = baseSize * (0.3 + ringRatio * 0.9);
      // Opacity fades from core to edge
      const ringOpacity = isSelected
        ? (1 - ringRatio) * 0.28 + 0.03
        : (1 - ringRatio) * 0.2 + 0.02;
  
      // Each ring gets slight random offset for organic feel
      const offsetLat = (Math.random() - 0.5) * baseSize * 0.12;
      const offsetLng = (Math.random() - 0.5) * baseSize * 0.12;
  
      const points = generateBlobPoints(
        lat + offsetLat,
        lng + offsetLng,
        ringSize,
        0.3 + ringRatio * 0.2 // outer rings more irregular
      );
  
      const blob = L.polygon(points, {
        fillColor: ring <= 2 && isSelected
          ? `rgb(${Math.min(255, color.r + 50)}, ${Math.min(255, color.g + 50)}, ${Math.min(255, color.b + 30)})`
          : `rgb(${color.r}, ${color.g}, ${color.b})`,
        fillOpacity: ringOpacity,
        stroke: false,
        interactive: false,
        smoothFactor: 4,
      }).addTo(map);
      layers.push(blob);
    }
  
    // Add 1-2 satellite wisps
    const numWisps = 1 + Math.floor(Math.random() * 2);
    for (let w = 0; w < numWisps; w++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = baseSize * (0.6 + Math.random() * 0.5);
      const wispLat = lat + Math.sin(angle) * dist;
      const wispLng = lng + Math.cos(angle) * dist * 1.3;
  
      // Each wisp also gets 3 fading layers
      for (let wr = 3; wr >= 1; wr--) {
        const wrRatio = wr / 3;
        const wispSize = baseSize * (0.15 + Math.random() * 0.12) * (0.4 + wrRatio * 0.6);
        const wispOpacity = (1 - wrRatio) * 0.12 + 0.02;
  
        const wispPoints = generateBlobPoints(wispLat, wispLng, wispSize, 0.45);
        const wispBlob = L.polygon(wispPoints, {
          fillColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
          fillOpacity: wispOpacity,
          stroke: false,
          interactive: false,
          smoothFactor: 4,
        }).addTo(map);
        layers.push(wispBlob);
      }
    }
  
    return layers;
  }

function createPinIcon(rank: number, score: number, isSelected: boolean) {
  const size = isSelected ? 44 : 36;
  const borderColor = isSelected ? '#FF5C00' : 'rgba(255,255,255,0.5)';
  const glow = isSelected
    ? 'box-shadow: 0 0 20px rgba(255, 92, 0, 0.5), 0 2px 10px rgba(0,0,0,0.4);'
    : 'box-shadow: 0 2px 10px rgba(0,0,0,0.4);';

  let dotColor = '#8B8FA3';
  if (score >= 80) dotColor = '#00E89D';
  else if (score >= 65) dotColor = '#FFB84D';

  return L.divIcon({
    className: '',
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: rgba(13, 15, 20, 0.92);
      border: 2.5px solid ${borderColor};
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: ${isSelected ? '16px' : '13px'};
      color: #fff;
      ${glow}
      ${isSelected ? 'transform: scale(1.1);' : ''}
      position: relative;
      cursor: pointer;
    ">
      ${rank}
      <div style="
        position: absolute;
        bottom: -3px;
        right: -3px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: ${dotColor};
        border: 2px solid rgba(13, 15, 20, 0.9);
      "></div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function MapView({ recommendations, heatPoints, selectedSpot, onSelectSpot }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const cloudLayersRef = useRef<L.Layer[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  // Store blob shapes so they don't regenerate randomly on selection change
  const blobSeedsRef = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    if (!containerRef.current || recommendations.length === 0) return;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: false,
        minZoom: 11,
        maxZoom: 18,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear
    cloudLayersRef.current.forEach((c) => map.removeLayer(c));
    cloudLayersRef.current = [];
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = L.latLngBounds([]);

    // Add clouds
    recommendations.forEach((spot, index) => {
      const layers = createCloudLayers(map, spot.lat, spot.lng, spot.score, selectedSpot === index);
      cloudLayersRef.current.push(...layers);
      bounds.extend([spot.lat, spot.lng]);
    });

    // Add pins
    recommendations.forEach((spot, index) => {
      const marker = L.marker([spot.lat, spot.lng], {
        icon: createPinIcon(index + 1, spot.score, selectedSpot === index),
        zIndexOffset: selectedSpot === index ? 2000 : 100,
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: sans-serif; padding: 4px; min-width: 180px;">
            <strong style="font-size: 14px;">#${index + 1} ${spot.name}</strong><br/>
            <span style="color: #FF5C00; font-weight: bold; font-size: 13px;">${spot.score}/100</span><br/>
            <span style="font-size: 12px; color: #aaa;">👥 ${spot.crowd_type}</span><br/>
            <span style="font-size: 12px; color: #aaa;">⏰ ${spot.best_hours}</span>
          </div>`,
          { className: 'dark-popup' }
        );

      marker.on('click', () => onSelectSpot(index));
      markersRef.current.push(marker);
    });

    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
  }, [recommendations]);

  // Update selection
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Rebuild clouds
    cloudLayersRef.current.forEach((c) => map.removeLayer(c));
    cloudLayersRef.current = [];

    recommendations.forEach((spot, index) => {
      const layers = createCloudLayers(map, spot.lat, spot.lng, spot.score, selectedSpot === index);
      cloudLayersRef.current.push(...layers);
    });

    // Update pins
    markersRef.current.forEach((marker, index) => {
      const spot = recommendations[index];
      if (spot) {
        marker.setIcon(createPinIcon(index + 1, spot.score, selectedSpot === index));
        marker.setZIndexOffset(selectedSpot === index ? 2000 : 100);
      }
    });

    if (selectedSpot !== null && recommendations[selectedSpot]) {
      const spot = recommendations[selectedSpot];
      mapRef.current?.panTo([spot.lat, spot.lng], { animate: true });
    }
  }, [selectedSpot]);

  return (
    <>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <style>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: #1a1c24;
          color: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .dark-popup .leaflet-popup-tip {
          background: #1a1c24;
        }
        .dark-popup .leaflet-popup-close-button {
          color: #8B8FA3;
        }
      `}</style>
    </>
  );
}