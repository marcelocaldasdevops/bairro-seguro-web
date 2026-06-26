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
  
  currentStep = 1;
  isProfileComplete = false;
  selectedFile: File | null = null;

  incident = {
    title: '',
    description: '',
    category: 'Assalto',
    severity_level: 'LOW',
    is_emergency: false,
    location: {
      latitude: -23.550520,
      longitude: -46.633308
    }
  };

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.checkProfile();
  }

  checkProfile() {
    this.api.getMe().subscribe({
      next: (user) => {
        this.isProfileComplete = !!(user.name?.trim() && user.cpf?.trim() && user.bairro?.trim());
        if (!this.isProfileComplete) {
          alert('Você precisa completar seu perfil antes de relatar um incidente.');
          this.router.navigate(['/profile']);
        }
      },
      error: () => this.router.navigate(['/login'])
    });
  }

  ngAfterViewInit() {
    // Map will be initialized in Step 2
  }

  nextStep() {
    if (this.currentStep === 1) {
      this.currentStep = 2;
      if (!this.map && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            this.incident.location.latitude = parseFloat(pos.coords.latitude.toFixed(6));
            this.incident.location.longitude = parseFloat(pos.coords.longitude.toFixed(6));
            setTimeout(() => this.initMap(), 100);
          },
          (err) => {
            console.warn('Erro ao obter geolocalização, usando padrão:', err);
            setTimeout(() => this.initMap(), 100);
          },
          { timeout: 3000 }
        );
      } else {
        setTimeout(() => this.initMap(), 100);
      }
    } else if (this.currentStep === 2) {
      this.currentStep = 3;
    }
  }

  prevStep() {
    this.currentStep--;
  }

  private initMap(): void {
    if (this.map) return;
    
    this.map = L.map('map').setView(
      [this.incident.location.latitude, this.incident.location.longitude],
      15
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker([this.incident.location.latitude, this.incident.location.longitude], {
      draggable: true
    }).addTo(this.map);

    this.marker.on('dragend', () => {
      const pos = this.marker.getLatLng();
      this.incident.location.latitude = parseFloat(pos.lat.toFixed(6));
      this.incident.location.longitude = parseFloat(pos.lng.toFixed(6));
    });

    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.incident.location.latitude = parseFloat(lat.toFixed(6));
      this.incident.location.longitude = parseFloat(lng.toFixed(6));
      this.marker.setLatLng([this.incident.location.latitude, this.incident.location.longitude]);
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    const payload = {
      title: this.incident.title,
      description: this.incident.description,
      category: this.incident.category.toUpperCase(),
      severity_level: this.incident.severity_level,
      is_emergency: this.incident.is_emergency,
      location: {
        latitude: this.incident.location.latitude,
        longitude: this.incident.location.longitude
      }
    };

    this.api.createIncident(payload).subscribe({
      next: (createdIncident) => {
        if (this.selectedFile && createdIncident && createdIncident.id) {
          this.api.uploadAttachment(createdIncident.id, this.selectedFile).subscribe({
            next: () => {
              alert('Incidente relatado com sucesso! A comunidade agradece.');
              this.router.navigate(['/']);
            },
            error: (uploadErr) => {
              console.error('Erro ao fazer upload da imagem:', uploadErr);
              alert('Incidente relatado, mas ocorreu um erro ao enviar a imagem.');
              this.router.navigate(['/']);
            }
          });
        } else {
          alert('Incidente relatado com sucesso! A comunidade agradece.');
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao enviar relato. Tente novamente.');
      }
    });
  }
}

