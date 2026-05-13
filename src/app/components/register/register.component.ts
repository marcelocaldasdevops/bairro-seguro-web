import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  userData = { username: '', email: '', password: '', confirmPassword: '' };
  showPassword = false;
  showConfirmPassword = false;

  constructor(private api: ApiService, private router: Router) {}

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  onSubmit() {
    if (this.userData.password !== this.userData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    const { confirmPassword, ...payload } = this.userData;

    this.api.register(payload).subscribe({
      next: () => {
        alert('Cadastro realizado com sucesso! Faça login para continuar.');
        this.userData = { username: '', email: '', password: '', confirmPassword: '' };
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Erro no cadastro:', err);
        let errorMsg = 'Erro ao realizar cadastro.';
        
        if (err.error) {
          if (typeof err.error === 'object') {
            errorMsg = Object.values(err.error).flat().join(' ');
          } else {
            errorMsg = err.error;
          }
        }
        
        alert(errorMsg);
      }
    });
  }
}
