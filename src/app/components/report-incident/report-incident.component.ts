import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-report-incident',
  template: `
    <div class="report-wrapper">
      <div class="glass-card report-card animate-fade-in">
        <header class="report-header">
          <div class="header-content">
            <h2>🚨 Relatar Incidente</h2>
            <p class="subtitle">Sua contribuição ajuda a manter a comunidade segura</p>
          </div>
        </header>
        
        <div class="report-body mt-8">
          <div class="instruction-card mb-6">
            <span class="icon">📍</span>
            <p>Selecione no mapa o local exato da ocorrência</p>
          </div>

          <div class="map-container-outer mb-8">
            <div id="map" class="map-container shadow-inner"></div>
            <div class="coords-overlay" *ngIf="incident.location.latitude">
               <span>LAT: {{ incident.location.latitude | number:'1.4-4' }}</span>
               <span class="divider">|</span>
               <span>LNG: {{ incident.location.longitude | number:'1.4-4' }}</span>
            </div>
          </div>
          
          <form (submit)="onSubmit()" class="incident-form">
            <div class="input-group">
              <label>Descrição do Ocorrido</label>
              <textarea [(ngModel)]="incident.description" name="description" rows="4" required 
                placeholder="Descreva detalhes importantes como horário, características e o que foi observado..."></textarea>
            </div>
            
            <div class="form-grid">
              <div class="input-group">
                <label>Nível de Gravidade</label>
                <div class="select-wrapper">
                  <select [(ngModel)]="incident.severity_level" name="severity_level" required>
                    <option value="LOW">🟢 Baixo (Informativo / Alerta)</option>
                    <option value="MEDIUM">🟡 Médio (Risco Potencial)</option>
                    <option value="HIGH">🔴 Alto (Ocorrência Grave / Perigo)</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="form-actions mt-6">
              <button type="button" routerLink="/" class="btn btn-outline">Cancelar</button>
              <button type="submit" class="btn btn-primary flex-1">
                <span>Enviar Relato Agora</span>
                <span class="btn-icon">⚡</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .report-wrapper {
      display: flex;
      justify-content: center;
      padding: 3rem 1.5rem 6rem;
    }
    .report-card {
      width: 100%;
      max-width: 860px;
      padding: 3rem;
      border-radius: 1.5rem;
    }
    .report-header {
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--glass-border);
      padding-bottom: 1.5rem;
    }
    .report-header h2 {
      font-size: 2rem;
      margin-bottom: 0.25rem;
    }
    .instruction-card {
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.2);
      padding: 1rem 1.25rem;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 500;
      color: var(--primary);
      font-size: 0.95rem;
    }
    .map-container-outer {
      position: relative;
      border-radius: 1rem;
      overflow: hidden;
    }
    .coords-overlay {
      position: absolute;
      bottom: 1.5rem;
      left: 1.5rem;
      background: rgba(7, 11, 20, 0.85);
      backdrop-filter: blur(8px);
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid var(--glass-border);
      font-size: 0.75rem;
      font-family: monospace;
      display: flex;
      gap: 0.75rem;
      z-index: 1000;
      color: var(--primary);
    }
    .divider { opacity: 0.3; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    .form-actions {
      display: flex;
      gap: 1rem;
    }
    .flex-1 { flex: 1; }
    .btn-icon { font-size: 1.1rem; }
    
    .select-wrapper { position: relative; }
    
    textarea {
      resize: vertical;
      min-height: 120px;
    }
  `]
})
export class ReportIncidentComponent implements AfterViewInit {
  private map: any;
  private marker: any;

  incident = {
    description: '',
    severity_level: 'LOW',
    location: {
      latitude: -23.550520,
      longitude: -46.633308
    }
  };

  constructor(private api: ApiService, private router: Router) {}

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap(): void {
    // Try to get user's position
    navigator.geolocation.getCurrentPosition((pos) => {
      this.incident.location.latitude = pos.coords.latitude;
      this.incident.location.longitude = pos.coords.longitude;
      this.setupMap();
    }, () => {
      this.setupMap();
    });
  }

  private setupMap(): void {
    this.map = L.map('map').setView(
      [this.incident.location.latitude, this.incident.location.longitude],
      15
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker([this.incident.location.latitude, this.incident.location.longitude]).addTo(this.map);

    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.incident.location.latitude = parseFloat(lat.toFixed(6));
      this.incident.location.longitude = parseFloat(lng.toFixed(6));
      this.marker.setLatLng([this.incident.location.latitude, this.incident.location.longitude]);
    });
  }

  onSubmit() {
    this.api.createIncident(this.incident).subscribe({
      next: () => {
        alert('Incidente relatado com sucesso!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        const error = err.error?.non_field_errors?.[0] || 'Erro ao relatar incidente';
        alert(error);
        if (error.includes('perfil deve estar completo')) {
          this.router.navigate(['/profile']);
        }
      }
    });
  }
}

