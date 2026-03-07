import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
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
