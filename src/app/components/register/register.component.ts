import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  template: `
    <div class="auth-wrapper">
      <div class="glass-card auth-card animate-fade-in">
        <div class="auth-header">
          <div class="auth-icon">🛡️</div>
          <h2>Criar Conta</h2>
          <p class="subtitle">Faça parte da rede de proteção do seu bairro</p>
        </div>
        
        <form (submit)="onSubmit()" class="auth-form mt-8">
          <div class="input-group">
            <label>Usuário</label>
            <input type="text" [(ngModel)]="userData.username" name="username" required placeholder="Ex: joaosilva">
          </div>
          <div class="input-group">
            <label>E-mail</label>
            <input type="email" [(ngModel)]="userData.email" name="email" required placeholder="seu@email.com">
          </div>
          <div class="input-group">
            <label>Senha</label>
            <input type="password" [(ngModel)]="userData.password" name="password" required placeholder="••••••••">
          </div>
          <button type="submit" class="btn btn-primary w-full">
            <span>Criar Minha Conta</span>
            <span class="btn-icon">✨</span>
          </button>
        </form>
        
        <div class="auth-footer mt-8">
          <p class="footer-link">
            Já tem uma conta? <a routerLink="/login">Fazer Login</a>
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
      background: linear-gradient(90deg, var(--primary), var(--secondary), var(--accent));
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
      font-size: 1.1rem;
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
  `]
})
export class RegisterComponent {
  userData = { username: '', email: '', password: '' };

  constructor(private api: ApiService, private router: Router) {}

  onSubmit() {
    this.api.register(this.userData).subscribe({
      next: () => {
        alert('Cadastro realizado com sucesso! Faça login para continuar.');
        this.router.navigate(['/login']);
      },
      error: (err) => alert('Erro no cadastro: ' + JSON.stringify(err.error))
    });
  }
}
