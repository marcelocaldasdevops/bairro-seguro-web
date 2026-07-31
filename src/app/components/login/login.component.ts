import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  showPassword = false;
  isLoading = false;

  constructor(private api: ApiService, private router: Router, private toast: ToastService) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.isLoading) return;
    this.isLoading = true;

    this.api.login(this.credentials).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.toast.showSuccess('Login realizado com sucesso!', 'Bem-vindo');
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        window.location.href = '/'; // Simple way to refresh app state
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.showError(err.error?.error || 'Verifique suas credenciais de acesso.', 'Erro no Login');
      }
    });
  }
}
