import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  template: `
    <div class="home-container">
      <header class="flex justify-between items-center mb-10">
        <div>
          <h1 class="main-title">Bairro Seguro</h1>
          <p class="subtitle">Monitoramento colaborativo e inteligente em tempo real</p>
        </div>
        <button *ngIf="isLoggedIn" routerLink="/report" class="btn btn-primary">
          <span>Relatar Novo</span>
        </button>
      </header>

      <div class="glass-card map-wrapper mb-12">
        <div id="main-map" class="map-container" style="height: 550px;"></div>
      </div>

      <div class="section-header mb-6">
        <h2>Ocorrências Recentes</h2>
        <div class="header-line"></div>
      </div>

      <div class="incidents-grid" *ngIf="incidents.length > 0; else noIncidents">
        <div *ngFor="let incident of incidents" class="glass-card incident-card" (click)="focusOnIncident(incident)">
          <div class="card-header">
            <div class="severity-indicator" [ngClass]="'severity-' + incident.severity_level.toLowerCase()"></div>
            <span class="severity-label">{{ incident.severity_level }}</span>
          </div>
          <h3 class="description">{{ incident.description | slice:0:120 }}{{ incident.description.length > 120 ? '...' : '' }}</h3>
          
          <div class="card-footer">
            <div class="meta-item">
              <span class="icon">📅</span>
              <span>{{ incident.datetime | date:'short' }}</span>
            </div>
            <div class="meta-item">
              <span class="icon">📍</span>
              <span>{{ incident.location.latitude | number:'1.3-3' }}, {{ incident.location.longitude | number:'1.3-3' }}</span>
            </div>
            <div class="user-info">
              <div class="avatar">{{ incident.user[0] | uppercase }}</div>
              <span>{{ incident.user }}</span>
            </div>
          </div>
        </div>
      </div>

      <ng-template #noIncidents>
        <div class="glass-card empty-state">
          <div class="empty-icon">🛡️</div>
          <p>Nenhum incidente relatado recentemente. A comunidade está segura!</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .home-container { padding-bottom: 6rem; }
    .main-title { font-size: 2.5rem; }
    
    .map-wrapper { overflow: hidden; }

    .section-header h2 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    .header-line { width: 40px; height: 3px; background: var(--primary); border-radius: 2px; }

    .incidents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 2rem;
    }

    .incident-card {
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      cursor: pointer;
      position: relative;
    }

    .incident-card:hover {
      transform: translateY(-8px);
      background: var(--bg-card-hover);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .severity-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
    }
    
    .severity-label {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .severity-high { background: var(--danger); box-shadow: 0 0 15px var(--danger); }
    .severity-medium { background: var(--warning); box-shadow: 0 0 15px var(--warning); }
    .severity-low { background: var(--success); box-shadow: 0 0 15px var(--success); }

    .description {
      font-size: 1.15rem;
      line-height: 1.5;
      color: #fff;
      -webkit-background-clip: initial;
      -webkit-text-fill-color: initial;
      background: none;
    }

    .card-footer {
      margin-top: auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--glass-border);
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .user-info {
      grid-column: span 2;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-top: 0.5rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--primary);
    }

    .avatar {
      width: 24px;
      height: 24px;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
    }

    .empty-state {
      padding: 5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .empty-icon { font-size: 4rem; }
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

