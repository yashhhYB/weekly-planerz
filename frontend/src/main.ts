import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { appRoutes } from './app/app.routes';
import { ApiInterceptor } from './app/core/interceptors';
import { planningReducer, PlanningEffects } from './app/store/planning';
import { backlogReducer, BacklogEffects } from './app/store/backlog';

const config: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(),
    { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true },
    
    // NgRx Store for standalone app
    importProvidersFrom(
      StoreModule.forRoot({
        planning: planningReducer,
        backlog: backlogReducer
      }),
      EffectsModule.forRoot([PlanningEffects, BacklogEffects])
    )
  ]
};

bootstrapApplication(AppComponent, config);
