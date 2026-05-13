import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

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
    email: ''
  };
  isProfileComplete = false;
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getMe().subscribe({
      next: (data) => {
        this.user = { ...this.user, ...data };
        this.checkProfile();
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

  onSubmit() {
    this.api.updateProfile(this.user.id, this.user).subscribe({
      next: (res) => {
        this.user = res;
        this.checkProfile();
        alert('Perfil atualizado com sucesso!');
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao atualizar perfil. Verifique os dados e tente novamente.');
      }
    });
  }
}
