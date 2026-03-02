import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { appRoutes } from './app/app.routes';

const config: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient()
  ]
};

bootstrapApplication(AppComponent, config);
