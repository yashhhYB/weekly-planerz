import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <h1>📅 Weekly Planner</h1>
          <p class="subtitle">Production-Grade Planning System</p>
        </div>
        <ul class="nav-links">
          <li><a routerLink="/dashboard" routerLinkActive="active">Dashboard</a></li>
          <li><a routerLink="/planning" routerLinkActive="active">Planning Weeks</a></li>
          <li><a routerLink="/backlog" routerLinkActive="active">Backlog</a></li>
        </ul>
      </div>
    </nav>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <footer class="footer">
      <p>&copy; 2026 Weekly Planner. All rights reserved.</p>
    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f8f9fa;
    }

    .navbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .nav-brand {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .nav-brand h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }

    .subtitle {
      margin: 0;
      font-size: 12px;
      opacity: 0.9;
    }

    .nav-links {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      gap: 30px;
    }

    .nav-links a {
      color: white;
      text-decoration: none;
      font-weight: 500;
      padding: 8px 12px;
      border-radius: 4px;
      transition: background 0.3s;
    }

    .nav-links a:hover,
    .nav-links a.active {
      background: rgba(255, 255, 255, 0.2);
    }

    .main-content {
      flex: 1;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .footer {
      background: #333;
      color: white;
      text-align: center;
      padding: 20px;
      margin-top: 40px;
    }

    .footer p {
      margin: 0;
      opacity: 0.7;
    }
  `]
})
export class AppComponent { }

