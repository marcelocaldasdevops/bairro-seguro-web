import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getIncidents(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get(`${this.apiUrl}/incidents/`, { params });
  }

  createIncident(incidentData: FormData | any): Observable<any> {
    return this.http.post(`${this.apiUrl}/incidents/`, incidentData, { headers: this.getHeaders() });
  }

  uploadAttachment(incidentId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('attachment_type', 'IMAGE');
    return this.http.post(`${this.apiUrl}/incidents/${incidentId}/attachments/`, formData, { headers: this.getHeaders() });
  }


  // Social Features
  addComment(incidentId: number, content: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/incidents/${incidentId}/comments/`, { content }, { headers: this.getHeaders() });
  }

  getComments(incidentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/incidents/${incidentId}/comments/`);
  }

  confirmIncident(incidentId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/incidents/${incidentId}/confirm/`, {}, { headers: this.getHeaders() });
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/login/`, credentials);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/`, userData);
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/me/`, { headers: this.getHeaders() });
  }

  updateProfile(userId: number, profileData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${userId}/`, profileData, { headers: this.getHeaders() });
  }
}
