/**
 * Copyright (c) 2020 Software AG, Darmstadt, Germany and/or its licensors
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { NgModule } from '@angular/core';
import { GpLibRcaComponent } from './gp-lib-rca.component';
import { GpLibRcaService } from './gp-lib-rca.service';
import { CommonModule, CoreModule, HOOK_COMPONENTS } from '@c8y/ngx-components';
import { ChartsModule } from 'ng2-charts';
import { GpLibRcaConfigComponent } from './gp-lib-rca.config.component';
import { Commonc8yService } from './Commonc8yservice.service';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RCAViewModalComponent } from './rca-view-modal/rca-view-modal.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ColorPickerComponent } from './color-picker/color-picker-component';
import { ColorSliderComponent } from './color-picker/color-slider/color-slider-component';
import { ColorPaletteComponent } from './color-picker/color-palette/color-palette-component';
import * as preview from './preview-image';

@NgModule({
  declarations: [
    GpLibRcaComponent,
    GpLibRcaConfigComponent,
    RCAViewModalComponent,
    ColorPickerComponent,
    ColorSliderComponent,
    ColorPaletteComponent,
  ],
  imports: [
    CoreModule,
    CommonModule,
    ModalModule.forRoot(),
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    ChartsModule,
  ],
  exports: [
    GpLibRcaComponent,
    GpLibRcaConfigComponent,
    RCAViewModalComponent,
    ColorPickerComponent,
  ],
  entryComponents: [
    GpLibRcaComponent,
    GpLibRcaConfigComponent,
    RCAViewModalComponent,
    ColorPickerComponent,
  ],
  providers: [
    GpLibRcaService,
    BsModalService,
    Commonc8yService,
    {
      provide: HOOK_COMPONENTS,
      multi: true,
      useValue: {
        id: 'rca-chart.widget',
        label: 'RCA Chart',
        previewImage: preview.previewImage,
        description: 'Display the RCA whenever AD > 1',
        component: GpLibRcaComponent,
        configComponent: GpLibRcaConfigComponent,
        data: {
          ng1: {
            options: {
              noDeviceTarget: false,
              noNewWidgets: false,
              deviceTargetNotRequired: false,
              groupsSelectable: true,
            },
          },
        },
      },
    },
  ],
})
export class GpLibRcaModule {}
