import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = {
    name: '',
    cpf: '',
    bairro: '',
    email: '',
    username: ''
  };
  isProfileComplete = false;
  loading = true;
  isSaving = false;
  myIncidents: any[] = [];
  totalApoios = 0;

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.api.getMe().subscribe({
      next: (data) => {
        this.user = { ...this.user, ...data };
        if (this.user.cpf) {
          this.user.cpf = this.formatCpf(this.user.cpf);
        }
        this.checkProfile();
        this.loadMyIncidents();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  checkProfile() {
    this.isProfileComplete = !!(this.user.name?.trim() && this.user.cpf?.trim() && this.user.bairro?.trim());
  }

  loadMyIncidents() {
    this.api.getIncidents({ user: 'me' }).subscribe({
      next: (incidents) => {
        this.myIncidents = incidents;
        this.totalApoios = this.myIncidents.reduce((sum, i) => sum + (i.confirmations_count || 0), 0);
      },
      error: (err) => console.error('Erro ao carregar meus incidentes:', err)
    });
  }

  onCpfInput(event: any) {
    const input = event.target as HTMLInputElement;
    this.user.cpf = this.formatCpf(input.value);
  }

  private formatCpf(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return digits.replace(/(\d{3})(\d+)/, '$1.$2');
    if (digits.length <= 9) return digits.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  }

  onSubmit() {
    if (this.isSaving) return;
    this.isSaving = true;

    this.api.updateProfile(this.user.id, this.user).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.user = { ...this.user, ...res };
        this.checkProfile();
        this.toast.showSuccess('Seus dados de perfil foram salvos com sucesso!', 'Perfil Atualizado');
      },
      error: (err) => {
        this.isSaving = false;
        console.error(err);
        this.toast.showError('Erro ao atualizar perfil. Verifique os dados fornecidos.', 'Erro ao Salvar');
      }
    });
  }
}
