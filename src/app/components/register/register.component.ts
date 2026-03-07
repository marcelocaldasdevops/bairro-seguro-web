import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
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
