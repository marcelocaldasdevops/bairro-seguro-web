import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  showPassword = false;
  isLoading = false;

  constructor(private api: ApiService, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.isLoading) return;
    this.isLoading = true;

    this.api.login(this.credentials).subscribe({
      next: (res) => {
        this.isLoading = false;
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        window.location.href = '/'; // Simple way to refresh app state
      },
      error: (err) => {
        this.isLoading = false;
        alert('Erro no login: ' + (err.error?.error || 'Verifique suas credenciais'));
      }
    });
  }
}
