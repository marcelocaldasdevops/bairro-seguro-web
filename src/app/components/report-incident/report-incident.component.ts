import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-report-incident',
  templateUrl: './report-incident.component.html',
  styleUrls: ['./report-incident.component.css']
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

