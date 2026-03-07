import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
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

