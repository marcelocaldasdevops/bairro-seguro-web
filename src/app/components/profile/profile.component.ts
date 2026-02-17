import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  template: `
    <div class="profile-wrapper">
      <div class="glass-card profile-card animate-fade-in">
        <header class="profile-header">
           <div class="avatar-large">{{ user.name ? user.name[0] : 'U' }}</div>
           <h2>Meu Perfil</h2>
           <p class="subtitle">Gerencie suas informações de segurança</p>
        </header>
        
        <div class="status-section mt-6">
          <div *ngIf="isProfileComplete" class="status-badge success">
            <span class="icon">✅</span>
            <span>Perfil Verificado e Completo</span>
          </div>
          <div *ngIf="!isProfileComplete" class="status-badge warning">
            <span class="icon">⚠️</span>
            <span>Ação Necessária: Complete seu perfil</span>
          </div>
        </div>

        <form (submit)="onSubmit()" class="profile-form mt-8">
          <div class="form-grid">
            <div class="input-group">
              <label>Nome Completo</label>
              <input type="text" [(ngModel)]="user.name" name="name" required placeholder="Seu nome completo">
            </div>
            <div class="input-group">
              <label>CPF</label>
              <input type="text" [(ngModel)]="user.cpf" name="cpf" required placeholder="000.000.000-00">
            </div>
            <div class="input-group">
              <label>Bairro de Residência</label>
              <input type="text" [(ngModel)]="user.bairro" name="bairro" required placeholder="Ex: Centro">
            </div>
          </div>
          
          <div class="form-actions mt-8">
            <button type="submit" class="btn btn-primary w-full">
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-wrapper {
      display: flex;
      justify-content: center;
      padding: 3rem 1.5rem 6rem;
    }
    .profile-card {
      width: 100%;
      max-width: 560px;
      padding: 3rem;
    }
    .profile-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    .avatar-large {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 800;
      color: white;
      box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
    }
    .status-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-radius: 0.75rem;
      font-size: 0.9rem;
      font-weight: 600;
      border-width: 1px;
      border-style: solid;
    }
    .status-badge.success {
      background: rgba(46, 204, 113, 0.1);
      border-color: rgba(46, 204, 113, 0.2);
      color: var(--success);
    }
    .status-badge.warning {
      background: rgba(255, 184, 77, 0.1);
      border-color: rgba(255, 184, 77, 0.2);
      color: var(--warning);
    }
    .profile-form {
      display: flex;
      flex-direction: column;
    }
    .form-grid {
      display: grid;
      gap: 0.5rem;
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
