import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  template: `
    <div class="profile-wrapper">
      <div class="glass-card profile-card animate-fade-in">
        <h2>Meu Perfil</h2>
        <p class="subtitle">Complete seu perfil para reportar incidentes</p>
        
        <div *ngIf="isProfileComplete" class="success-alert mt-4">
          ✅ Seu perfil está completo! Você pode relatar incidentes.
        </div>
        <div *ngIf="!isProfileComplete" class="warning-alert mt-4">
          ⚠️ Você precisa completar seu perfil para relatar incidentes.
        </div>

        <form (submit)="onSubmit()" class="mt-8">
          <div class="input-group">
            <label>Nome Completo</label>
            <input type="text" [(ngModel)]="user.name" name="name" required>
          </div>
          <div class="input-group">
            <label>CPF</label>
            <input type="text" [(ngModel)]="user.cpf" name="cpf" required placeholder="000.000.000-00">
          </div>
          <div class="input-group">
            <label>Bairro</label>
            <input type="text" [(ngModel)]="user.bairro" name="bairro" required>
          </div>
          <button type="submit" class="btn btn-primary w-full">Salvar Alterações</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-wrapper {
      display: flex;
      justify-content: center;
      padding: 2rem 0;
    }
    .profile-card {
      width: 100%;
      max-width: 500px;
      padding: 2.5rem;
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    .w-full { width: 100%; }
    .success-alert {
      padding: 1rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid var(--success);
      border-radius: 0.5rem;
      color: var(--success);
      font-size: 0.875rem;
    }
    .warning-alert {
      padding: 1rem;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid var(--warning);
      border-radius: 0.5rem;
      color: var(--warning);
      font-size: 0.875rem;
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: any = {};
  isProfileComplete = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getMe().subscribe(data => {
      this.user = data;
      this.checkProfile();
    });
  }

  checkProfile() {
    this.isProfileComplete = !!(this.user.name && this.user.cpf && this.user.bairro);
  }

  onSubmit() {
    this.api.updateProfile(this.user.id, this.user).subscribe({
      next: (res) => {
        this.user = res;
        this.checkProfile();
        alert('Perfil atualizado!');
      },
      error: (err) => alert('Erro ao atualizar perfil')
    });
  }
}
