import { NgModule, Injectable } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GpLibBoonlogicModule } from 'projects/gp-lib-boonlogic/src/public-api';
import { AppComponent } from './app.component';
import { BehaviorSubject } from 'rxjs';
import { CoreModule } from '@c8y/ngx-components';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import {
  Client,
  InventoryService,
  BasicAuth,
  IdentityService,
  ApplicationService,
  Realtime,
  AlarmService,
  AuditService,
  DeviceRegistrationService,
  FetchClient,
  DeviceRegistrationBulkService,
  EventService,
  InventoryRoleService,
  InventoryBinaryService,
  MeasurementService,
  OperationService,
  OperationBulkService,
  TenantSecurityOptionsService,
  SystemOptionsService,
  TenantOptionsService,
  TenantService,
  UserService,
  UserGroupService,
  UserRoleService,
  IUser,
  ICurrentTenant,
} from '@c8y/client';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const auth = new BasicAuth({
  user: 'sabreen.irfana@softwareag.com',
  password: 'Demo2022$',
  tenant: 't664142085',
});
const client = new Client(auth, 'http://localhost:4200');
client.setAuth(auth);

Injectable();
export class MockAppStateService {
  currentTenant = new BehaviorSubject<ICurrentTenant | null>(null);
  currentUser = new BehaviorSubject<IUser | null>(null);
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    GpLibBoonlogicModule,
    CoreModule.forRoot(),
    RouterModule.forRoot([]),
    CommonModule,
    BrowserAnimationsModule,
  ],
  providers: [
    { provide: AlarmService, useValue: client.alarm },
    { provide: ApplicationService, useValue: client.application },
    { provide: AuditService, useValue: client.audit },
    { provide: FetchClient, useValue: client.core },
    { provide: DeviceRegistrationService, useValue: client.deviceRegistration },
    { provide: DeviceRegistrationBulkService, useValue: client.deviceRegistrationBulk },
    { provide: EventService, useValue: client.event },
    { provide: InventoryService, useValue: client.inventory },
    { provide: InventoryRoleService, useValue: client.inventoryRole },
    { provide: InventoryBinaryService, useValue: client.inventoryBinary },
    { provide: MeasurementService, useValue: client.measurement },
    { provide: OperationService, useValue: client.operation },
    { provide: OperationBulkService, useValue: client.operationBulk },
    { provide: TenantSecurityOptionsService, useValue: client.options.security },
    { provide: SystemOptionsService, useValue: client.options.system },
    { provide: TenantOptionsService, useValue: client.options.tenant },
    { provide: Realtime, useValue: client.realtime },
    { provide: TenantService, useValue: client.tenant },
    { provide: UserService, useValue: client.user },
    { provide: UserGroupService, useValue: client.userGroup },
    { provide: UserRoleService, useValue: client.userRole },
    { provide: IdentityService, useValue: client.identity },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
