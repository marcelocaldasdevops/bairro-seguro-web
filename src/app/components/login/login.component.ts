import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-wrapper">
      <div class="glass-card auth-card animate-fade-in">
        <div class="auth-header">
          <div class="auth-icon">🔐</div>
          <h2>Bem-vindo</h2>
          <p class="subtitle">Acesse sua conta para colaborar</p>
        </div>
        
        <form (submit)="onSubmit()" class="auth-form mt-8">
          <div class="input-group">
            <label>Usuário</label>
            <div class="input-wrapper">
              <input type="text" [(ngModel)]="credentials.username" name="username" required placeholder="Seu nome de usuário">
            </div>
          </div>
          <div class="input-group">
            <label>Senha</label>
            <div class="input-wrapper">
              <input type="password" [(ngModel)]="credentials.password" name="password" required placeholder="••••••••">
            </div>
          </div>
          <button type="submit" class="btn btn-primary w-full">
            <span>Entrar</span>
            <span class="btn-icon">→</span>
          </button>
        </form>
        
        <div class="auth-footer mt-8">
          <p class="footer-link">
            Novo por aqui? <a routerLink="/register">Criar uma conta</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      display: flex;
      justify-content: center;
      padding: 4rem 1.5rem;
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 3rem 2.5rem;
      position: relative;
      overflow: hidden;
    }
    .auth-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, var(--primary), var(--secondary));
    }
    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .auth-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .btn-icon {
      font-size: 1.2rem;
      transition: transform 0.3s ease;
    }
    .btn:hover .btn-icon {
      transform: translateX(4px);
    }
    .auth-footer {
      text-align: center;
      padding-top: 1.5rem;
      border-top: 1px solid var(--glass-border);
    }
    .footer-link {
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .footer-link a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 700;
      margin-left: 0.25rem;
    }
    .footer-link a:hover {
      text-decoration: underline;
    }
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
