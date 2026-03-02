import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <nav style="padding: 20px; background: #f0f0f0;">
      <h1>Weekly Planner</h1>
      <p>Production-Grade Planning System</p>
    </nav>
    <main style="padding: 20px;">
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent { }
