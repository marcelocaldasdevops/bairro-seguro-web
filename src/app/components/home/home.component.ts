import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, NgZone, OnDestroy } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('carouselContainer') carouselContainer!: ElementRef;
  
  incidents: any[] = [];
  isLoggedIn = false;
  isLoading = true;
  isLocating = false;
  selectedIncident: any = null;
  
  filters = {
    category: '',
    radius: '',
    lat: null as number | null,
    lng: null as number | null
  };

  kpis = {
    total24h: 0,
    areaStatus: 100,
    criticalAlerts: 0,
    activeVigilantes: 0
  };

  private map: any;
  private markers: L.Marker[] = [];
  private userLocationMarker: L.Marker | null = null;
  private resizeListener?: () => void;

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.getCurrentLocation(false);
    this.loadIncidents();
  }

  ngAfterViewInit() {
    this.initMap();
    this.resizeListener = () => {
      if (this.map) {
        this.map.invalidateSize();
      }
    };
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy() {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  getCurrentLocation(isUserAction = false) {
    if (!navigator.geolocation) {
      if (isUserAction) {
        this.toast.showWarning('Geolocalização não é suportada pelo seu navegador.', 'Localização');
      }
      return;
    }

    this.isLocating = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.ngZone.run(() => {
          this.filters.lat = pos.coords.latitude;
          this.filters.lng = pos.coords.longitude;
          this.isLocating = false;

          if (this.map) {
            this.map.setView([this.filters.lat, this.filters.lng], 14, { animate: true });
            this.updateUserMarker(this.filters.lat, this.filters.lng);
            this.map.invalidateSize();
          }

          this.loadIncidents();

          if (isUserAction) {
            this.toast.showSuccess('Localização e incidentes atualizados!', 'Localização');
          }
        });
      },
      (error) => {
        this.ngZone.run(() => {
          this.isLocating = false;
          console.warn('Erro ao obter geolocalização:', error);
          if (isUserAction) {
            this.toast.showWarning('Não foi possível obter sua localização atual. Verifique as permissões do navegador.', 'Localização');
          }
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }

  loadIncidents() {
    this.isLoading = true;
    this.api.getIncidents(this.filters).subscribe({
      next: (data) => {
        this.incidents = data;
        this.calculateKPIs();
        this.addMarkers();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar incidentes:', err);
        this.isLoading = false;
      }
    });
  }

  private calculateKPIs() {
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    
    const recentIncidents = this.incidents.filter(i => {
      const incidentDate = new Date(i.datetime).getTime();
      return (now - incidentDate) < oneDay;
    });

    this.kpis.total24h = recentIncidents.length;
    this.kpis.criticalAlerts = recentIncidents.filter(i => i.severity_level === 'HIGH').length;
    
    let status = 100;
    recentIncidents.forEach(i => {
      if (i.severity_level === 'HIGH') status -= 15;
      else if (i.severity_level === 'MEDIUM') status -= 5;
    });
    this.kpis.areaStatus = Math.max(0, status);
    this.kpis.activeVigilantes = Math.floor(Math.random() * 10) + 5;
  }

  applyFilters() {
    this.loadIncidents();
  }

  private initMap(): void {
    const defaultLat = this.filters.lat || -23.550520;
    const defaultLng = this.filters.lng || -46.633308;
    
    this.map = L.map('main-map').setView([defaultLat, defaultLng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 300);

    if (this.filters.lat && this.filters.lng) {
      this.updateUserMarker(this.filters.lat, this.filters.lng);
    }
  }

  private updateUserMarker(lat: number, lng: number): void {
    if (!this.map) return;

    if (this.userLocationMarker) {
      this.map.removeLayer(this.userLocationMarker);
      this.userLocationMarker = null;
    }

    const userIcon = L.divIcon({
      html: '<div class="user-location-marker" title="Sua Localização"></div>',
      className: 'custom-marker-wrapper',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    this.userLocationMarker = L.marker([lat, lng], { icon: userIcon })
      .addTo(this.map)
      .bindPopup('<b>Você está aqui</b>');
  }

  private addMarkers(): void {
    if (!this.map) return;
    
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    this.incidents.forEach(incident => {
      if (!incident.location || incident.location.latitude == null || incident.location.longitude == null) {
        return;
      }

      const color = incident.severity_level === 'HIGH' ? '#ef4444' : 
                    incident.severity_level === 'MEDIUM' ? '#f59e0b' : '#10b981';
      
      const markerHtml = `
        <div class="pulse-marker" style="background-color: ${color};" title="${incident.category || 'Incidente'}"></div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-marker-wrapper',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker(
        [incident.location.latitude, incident.location.longitude],
        { icon: customIcon }
      )
      .addTo(this.map);

      marker.on('click', () => {
        this.ngZone.run(() => {
          this.selectedIncident = incident;
          if (this.map) {
            this.map.setView([incident.location.latitude, incident.location.longitude], 15, { animate: true });
          }
        });
      });

      this.markers.push(marker);
    });
  }

  focusOnIncident(incident: any) {
    this.selectedIncident = incident;
    if (this.map && incident?.location?.latitude != null && incident?.location?.longitude != null) {
      this.map.setView([incident.location.latitude, incident.location.longitude], 16, { animate: true });
    }
  }

  scrollFeed(amount: number) {
    if (this.carouselContainer?.nativeElement) {
      this.carouselContainer.nativeElement.scrollBy({
        left: amount,
        behavior: 'smooth'
      });
    }
  }
}
