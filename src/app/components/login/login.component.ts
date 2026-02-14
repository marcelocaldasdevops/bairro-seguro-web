import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-wrapper">
      <div class="glass-card auth-card animate-fade-in">
        <h2>Entrar</h2>
        <p class="subtitle">Bem-vindo de volta ao Bairro Seguro</p>
        
        <form (submit)="onSubmit()" class="mt-8">
          <div class="input-group">
            <label>Usuário</label>
            <input type="text" [(ngModel)]="credentials.username" name="username" required>
          </div>
          <div class="input-group">
            <label>Senha</label>
            <input type="password" [(ngModel)]="credentials.password" name="password" required>
          </div>
          <button type="submit" class="btn btn-primary w-full">Entrar</button>
        </form>
        
        <p class="footer-link mt-4">
          Não tem uma conta? <a routerLink="/register">Cadastre-se</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 70vh;
    }
    .auth-card {
      width: 100%;
      max-width: 400px;
      padding: 2.5rem;
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    .w-full { width: 100%; }
    .footer-link {
      text-align: center;
      font-size: 0.875rem;
    }
    .footer-link a { color: var(--primary); text-decoration: none; font-weight: 600; }
  `]
})
export class LoginComponent {
  credentials = { username: '', password: '' };

  constructor(private api: ApiService, private router: Router) {}

  onSubmit() {
    this.api.login(this.credentials).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        window.location.href = '/'; // Simple way to refresh app state
      },
      error: (err) => alert('Erro no login: ' + (err.error?.error || 'Verifique suas credenciais'))
    });
  }
}
