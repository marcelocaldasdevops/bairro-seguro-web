import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  isMobileMenuOpen = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkLogin();
    // Simplified login check for demo
    window.addEventListener('storage', () => this.checkLogin());
  }

  checkLogin() {
    this.isLoggedIn = !!localStorage.getItem('token');
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedIn = false;
    this.closeMobileMenu();
    this.router.navigate(['/login']);
  }
}
