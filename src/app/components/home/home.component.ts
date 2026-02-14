import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  template: `
    <div class="home-container">
      <header class="flex justify-between items-center mb-8">
        <div>
          <h1>Bairro Seguro</h1>
          <p class="subtitle">Monitoramento colaborativo em tempo real</p>
        </div>
        <button *ngIf="isLoggedIn" routerLink="/report" class="btn btn-primary">Relatar Novo</button>
      </header>

      <div class="glass-card mb-8">
        <div id="main-map" class="map-container" style="height: 500px;"></div>
      </div>

      <div class="incidents-grid" *ngIf="incidents.length > 0; else noIncidents">
        <div *ngFor="let incident of incidents" class="glass-card incident-card animate-fade-in" (click)="focusOnIncident(incident)">
          <div class="severity-badge" [ngClass]="'severity-' + incident.severity_level.toLowerCase()">
            {{ incident.severity_level }}
          </div>
          <h3>{{ incident.description | slice:0:100 }}{{ incident.description.length > 100 ? '...' : '' }}</h3>
          <p class="incident-meta">
            <span>📅 {{ incident.datetime | date:'short' }}</span>
            <span>📍 {{ incident.location.latitude | number:'1.4-4' }}, {{ incident.location.longitude | number:'1.4-4' }}</span>
          </p>
          <p class="user-meta">Relatado por: {{ incident.user }}</p>
        </div>
      </div>

      <ng-template #noIncidents>
        <div class="glass-card p-8 text-center">
          <p>Nenhum incidente relatado recentemente. A comunidade está segura!</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .home-container { padding-bottom: 4rem; }
    .subtitle { color: var(--text-muted); font-size: 0.875rem; }
    .incidents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .incident-card {
      padding: 1.5rem;
      position: relative;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .incident-card:hover { transform: scale(1.02); }
    .severity-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .severity-high { background: var(--danger); color: white; }
    .severity-medium { background: var(--warning); color: white; }
    .severity-low { background: var(--success); color: white; }
    .incident-meta {
      margin-top: 1rem;
      font-size: 0.875rem;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .user-meta {
      margin-top: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--primary);
    }
  `]
})
export class HomeComponent implements OnInit, AfterViewInit {
  incidents: any[] = [];
  isLoggedIn = false;
  private map: any;
  private markers: L.Marker[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.loadIncidents();
  }

  ngAfterViewInit() {
    this.initMap();
  }

  private loadIncidents() {
    this.api.getIncidents().subscribe(data => {
      this.incidents = data;
      this.addMarkers();
    });
  }

  private initMap(): void {
    this.map = L.map('main-map').setView([-23.550520, -46.633308], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    navigator.geolocation.getCurrentPosition((pos) => {
      this.map.setView([pos.coords.latitude, pos.coords.longitude], 14);
    });
  }

  private addMarkers(): void {
    if (!this.map) return;
    
    // Clear existing
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    this.incidents.forEach(incident => {
      const color = incident.severity_level === 'HIGH' ? '#ef4444' : 
                    incident.severity_level === 'MEDIUM' ? '#f59e0b' : '#10b981';
      
      const markerHtml = `
        <div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
        "></div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker(
        [incident.location.latitude, incident.location.longitude],
        { icon: customIcon }
      )
      .addTo(this.map)
      .bindPopup(`
        <strong>${incident.severity_level}</strong><br>
        ${incident.description}<br>
        <small>${new Date(incident.datetime).toLocaleString()}</small>
      `);

      this.markers.push(marker);
    });
  }

  focusOnIncident(incident: any) {
    this.map.setView([incident.location.latitude, incident.location.longitude], 16);
  }
}

