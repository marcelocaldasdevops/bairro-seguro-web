import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  template: `
    <div class="auth-wrapper">
      <div class="glass-card auth-card animate-fade-in">
        <h2>Criar Conta</h2>
        <p class="subtitle">Comece a proteger seu bairro hoje</p>
        
        <form (submit)="onSubmit()" class="mt-8">
          <div class="input-group">
            <label>Usuário</label>
            <input type="text" [(ngModel)]="userData.username" name="username" required>
          </div>
          <div class="input-group">
            <label>E-mail</label>
            <input type="email" [(ngModel)]="userData.email" name="email" required>
          </div>
          <div class="input-group">
            <label>Senha</label>
            <input type="password" [(ngModel)]="userData.password" name="password" required>
          </div>
          <button type="submit" class="btn btn-primary w-full">Cadastrar</button>
        </form>
        
        <p class="footer-link mt-4">
          Já tem uma conta? <a routerLink="/login">Entrar</a>
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
