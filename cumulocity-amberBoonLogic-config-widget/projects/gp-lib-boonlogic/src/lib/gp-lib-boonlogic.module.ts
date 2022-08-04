import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GpLibBoonlogicComponent } from './gp-lib-boonlogic.component';
import { CommonModule, CoreModule, HOOK_COMPONENTS } from '@c8y/ngx-components';
import { GpLibBoonlogicConfigComponent } from './config/gp-lib-boonlogic-config.component';
import { GpLibBoonlogicService } from './gp-lib-boonlogic.service';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { Commonc8yService } from './Commonc8yservice.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import * as preview from './preview-image';

@NgModule({
  declarations: [GpLibBoonlogicComponent, GpLibBoonlogicConfigComponent],
  imports: [
    CoreModule,
    CommonModule,
    ModalModule,
    NgSelectModule,
    ButtonsModule.forRoot(),
    TypeaheadModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
  ],
  entryComponents: [GpLibBoonlogicComponent, GpLibBoonlogicConfigComponent],
  exports: [GpLibBoonlogicComponent, GpLibBoonlogicConfigComponent],
  providers: [
    GpLibBoonlogicService,
    BsModalService,
    Commonc8yService,
    {
      provide: HOOK_COMPONENTS,
      multi: true,
      useValue: {
        id: 'boonlogic-config.widget',
        label: 'Amber Boon Logic Config Widget',
        previewImage: preview.previewImage,
        description: 'Amber BoonLogic Config Widget',
        component: GpLibBoonlogicComponent,
        configComponent: GpLibBoonlogicConfigComponent,
        data: {
          ng1: {
            options: {
              noDeviceTarget: true,
              noNewWidgets: false,
              deviceTargetNotRequired: true,
              groupsSelectable: false,
            },
          },
        },
      },
    },
  ],
})
export class GpLibBoonlogicModule {}
