import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  userData = { username: '', email: '', password: '', confirmPassword: '' };
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  constructor(private api: ApiService, private router: Router, private toast: ToastService) {}

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  onSubmit() {
    if (this.isLoading) return;

    if (this.userData.password !== this.userData.confirmPassword) {
      this.toast.showWarning('As senhas digitadas não coincidem.', 'Atenção');
      return;
    }

    this.isLoading = true;
    const { confirmPassword, ...payload } = this.userData;

    this.api.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.toast.showSuccess('Cadastro realizado com sucesso! Faça login para continuar.', 'Conta Criada!');
        this.userData = { username: '', email: '', password: '', confirmPassword: '' };
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erro no cadastro:', err);
        let errorMsg = 'Erro ao realizar cadastro.';
        
        if (err.error) {
          if (typeof err.error === 'object') {
            errorMsg = Object.values(err.error).flat().join(' ');
          } else {
            errorMsg = err.error;
          }
        }
        
        this.toast.showError(errorMsg, 'Erro no Cadastro');
      }
    });
  }
}
