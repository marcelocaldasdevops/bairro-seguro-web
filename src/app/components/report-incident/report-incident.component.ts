import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-report-incident',
  template: `
    <div class="report-wrapper">
      <div class="glass-card report-card animate-fade-in">
        <h2>Relatar Incidente</h2>
        <p class="subtitle">Clique no mapa para selecionar o local do ocorrido</p>
        
        <div id="map" class="map-container"></div>
        
        <form (submit)="onSubmit()" class="mt-8">
          <div class="input-group">
            <label>Descrição</label>
            <textarea [(ngModel)]="incident.description" name="description" rows="4" required placeholder="O que aconteceu?"></textarea>
          </div>
          
          <div class="grid-2 gap-4">
            <div class="input-group">
              <label>Nível de Gravidade</label>
              <select [(ngModel)]="incident.severity_level" name="severity_level" required>
                <option value="LOW">Baixo</option>
                <option value="MEDIUM">Médio</option>
                <option value="HIGH">Alto</option>
              </select>
            </div>
            <div class="input-group" style="display: flex; flex-direction: column; justify-content: flex-end;">
               <div class="coords-display" *ngIf="incident.location.latitude">
                 📍 {{ incident.location.latitude | number:'1.6-6' }}, {{ incident.location.longitude | number:'1.6-6' }}
               </div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-full">Enviar Relato</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .report-wrapper {
      display: flex;
      justify-content: center;
      padding: 2rem 0;
    }
    .report-card {
      width: 100%;
      max-width: 800px;
      padding: 2.5rem;
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    .w-full { width: 100%; }
    .coords-display {
      font-size: 0.75rem;
      color: var(--primary);
      background: rgba(99, 102, 241, 0.1);
      padding: 0.5rem;
      border-radius: 0.25rem;
      margin-top: 0.5rem;
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

