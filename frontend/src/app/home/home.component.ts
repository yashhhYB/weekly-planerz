import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div>
      <h2>Welcome to Weekly Planner</h2>
      <p>Business rule enforcement:</p>
      <ul>
        <li>✅ Planning only on Tuesday</li>
        <li>✅ 30 hours per member enforced</li>
        <li>✅ Category percentages = 100%</li>
        <li>✅ Frozen state immutable</li>
      </ul>
    </div>
  `
})
export class HomeComponent { }
