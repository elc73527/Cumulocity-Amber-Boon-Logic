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
const ɵ0 = {
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
};
export class GpLibRcaModule {
}
GpLibRcaModule.decorators = [
    { type: NgModule, args: [{
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
                        useValue: ɵ0,
                    },
                ],
            },] }
];
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3AtbGliLXJjYS5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9ncC1saWItcmNhL3NyYy9saWIvZ3AtbGliLXJjYS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUMzRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDdkQsT0FBTyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDaEYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUMxQyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUN4RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNsRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUNsRixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDdEQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDN0UsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDMUYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sc0RBQXNELENBQUM7QUFDN0YsT0FBTyxLQUFLLE9BQU8sTUFBTSxpQkFBaUIsQ0FBQztXQXVDM0I7SUFDUixFQUFFLEVBQUUsa0JBQWtCO0lBQ3RCLEtBQUssRUFBRSxXQUFXO0lBQ2xCLFlBQVksRUFBRSxPQUFPLENBQUMsWUFBWTtJQUNsQyxXQUFXLEVBQUUsaUNBQWlDO0lBQzlDLFNBQVMsRUFBRSxpQkFBaUI7SUFDNUIsZUFBZSxFQUFFLHVCQUF1QjtJQUN4QyxJQUFJLEVBQUU7UUFDSixHQUFHLEVBQUU7WUFDSCxPQUFPLEVBQUU7Z0JBQ1AsY0FBYyxFQUFFLEtBQUs7Z0JBQ3JCLFlBQVksRUFBRSxLQUFLO2dCQUNuQix1QkFBdUIsRUFBRSxLQUFLO2dCQUM5QixnQkFBZ0IsRUFBRSxJQUFJO2FBQ3ZCO1NBQ0Y7S0FDRjtDQUNGO0FBSVAsTUFBTSxPQUFPLGNBQWM7OztZQTFEMUIsUUFBUSxTQUFDO2dCQUNSLFlBQVksRUFBRTtvQkFDWixpQkFBaUI7b0JBQ2pCLHVCQUF1QjtvQkFDdkIscUJBQXFCO29CQUNyQixvQkFBb0I7b0JBQ3BCLG9CQUFvQjtvQkFDcEIscUJBQXFCO2lCQUN0QjtnQkFDRCxPQUFPLEVBQUU7b0JBQ1AsVUFBVTtvQkFDVixZQUFZO29CQUNaLFdBQVcsQ0FBQyxPQUFPLEVBQUU7b0JBQ3JCLFdBQVc7b0JBQ1gsY0FBYztvQkFDZCxtQkFBbUI7b0JBQ25CLFlBQVk7aUJBQ2I7Z0JBQ0QsT0FBTyxFQUFFO29CQUNQLGlCQUFpQjtvQkFDakIsdUJBQXVCO29CQUN2QixxQkFBcUI7b0JBQ3JCLG9CQUFvQjtpQkFDckI7Z0JBQ0QsZUFBZSxFQUFFO29CQUNmLGlCQUFpQjtvQkFDakIsdUJBQXVCO29CQUN2QixxQkFBcUI7b0JBQ3JCLG9CQUFvQjtpQkFDckI7Z0JBQ0QsU0FBUyxFQUFFO29CQUNULGVBQWU7b0JBQ2YsY0FBYztvQkFDZCxnQkFBZ0I7b0JBQ2hCO3dCQUNFLE9BQU8sRUFBRSxlQUFlO3dCQUN4QixLQUFLLEVBQUUsSUFBSTt3QkFDWCxRQUFRLElBaUJQO3FCQUNGO2lCQUNGO2FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgR3BMaWJSY2FDb21wb25lbnQgfSBmcm9tICcuL2dwLWxpYi1yY2EuY29tcG9uZW50JztcbmltcG9ydCB7IEdwTGliUmNhU2VydmljZSB9IGZyb20gJy4vZ3AtbGliLXJjYS5zZXJ2aWNlJztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSwgQ29yZU1vZHVsZSwgSE9PS19DT01QT05FTlRTIH0gZnJvbSAnQGM4eS9uZ3gtY29tcG9uZW50cyc7XG5pbXBvcnQgeyBDaGFydHNNb2R1bGUgfSBmcm9tICduZzItY2hhcnRzJztcbmltcG9ydCB7IEdwTGliUmNhQ29uZmlnQ29tcG9uZW50IH0gZnJvbSAnLi9ncC1saWItcmNhLmNvbmZpZy5jb21wb25lbnQnO1xuaW1wb3J0IHsgQ29tbW9uYzh5U2VydmljZSB9IGZyb20gJy4vQ29tbW9uYzh5c2VydmljZS5zZXJ2aWNlJztcbmltcG9ydCB7IEJzTW9kYWxTZXJ2aWNlLCBNb2RhbE1vZHVsZSB9IGZyb20gJ25neC1ib290c3RyYXAvbW9kYWwnO1xuaW1wb3J0IHsgRm9ybXNNb2R1bGUsIFJlYWN0aXZlRm9ybXNNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBSQ0FWaWV3TW9kYWxDb21wb25lbnQgfSBmcm9tICcuL3JjYS12aWV3LW1vZGFsL3JjYS12aWV3LW1vZGFsLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBOZ1NlbGVjdE1vZHVsZSB9IGZyb20gJ0BuZy1zZWxlY3Qvbmctc2VsZWN0JztcbmltcG9ydCB7IENvbG9yUGlja2VyQ29tcG9uZW50IH0gZnJvbSAnLi9jb2xvci1waWNrZXIvY29sb3ItcGlja2VyLWNvbXBvbmVudCc7XG5pbXBvcnQgeyBDb2xvclNsaWRlckNvbXBvbmVudCB9IGZyb20gJy4vY29sb3ItcGlja2VyL2NvbG9yLXNsaWRlci9jb2xvci1zbGlkZXItY29tcG9uZW50JztcbmltcG9ydCB7IENvbG9yUGFsZXR0ZUNvbXBvbmVudCB9IGZyb20gJy4vY29sb3ItcGlja2VyL2NvbG9yLXBhbGV0dGUvY29sb3ItcGFsZXR0ZS1jb21wb25lbnQnO1xuaW1wb3J0ICogYXMgcHJldmlldyBmcm9tICcuL3ByZXZpZXctaW1hZ2UnO1xuXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBHcExpYlJjYUNvbXBvbmVudCxcbiAgICBHcExpYlJjYUNvbmZpZ0NvbXBvbmVudCxcbiAgICBSQ0FWaWV3TW9kYWxDb21wb25lbnQsXG4gICAgQ29sb3JQaWNrZXJDb21wb25lbnQsXG4gICAgQ29sb3JTbGlkZXJDb21wb25lbnQsXG4gICAgQ29sb3JQYWxldHRlQ29tcG9uZW50LFxuICBdLFxuICBpbXBvcnRzOiBbXG4gICAgQ29yZU1vZHVsZSxcbiAgICBDb21tb25Nb2R1bGUsXG4gICAgTW9kYWxNb2R1bGUuZm9yUm9vdCgpLFxuICAgIEZvcm1zTW9kdWxlLFxuICAgIE5nU2VsZWN0TW9kdWxlLFxuICAgIFJlYWN0aXZlRm9ybXNNb2R1bGUsXG4gICAgQ2hhcnRzTW9kdWxlLFxuICBdLFxuICBleHBvcnRzOiBbXG4gICAgR3BMaWJSY2FDb21wb25lbnQsXG4gICAgR3BMaWJSY2FDb25maWdDb21wb25lbnQsXG4gICAgUkNBVmlld01vZGFsQ29tcG9uZW50LFxuICAgIENvbG9yUGlja2VyQ29tcG9uZW50LFxuICBdLFxuICBlbnRyeUNvbXBvbmVudHM6IFtcbiAgICBHcExpYlJjYUNvbXBvbmVudCxcbiAgICBHcExpYlJjYUNvbmZpZ0NvbXBvbmVudCxcbiAgICBSQ0FWaWV3TW9kYWxDb21wb25lbnQsXG4gICAgQ29sb3JQaWNrZXJDb21wb25lbnQsXG4gIF0sXG4gIHByb3ZpZGVyczogW1xuICAgIEdwTGliUmNhU2VydmljZSxcbiAgICBCc01vZGFsU2VydmljZSxcbiAgICBDb21tb25jOHlTZXJ2aWNlLFxuICAgIHtcbiAgICAgIHByb3ZpZGU6IEhPT0tfQ09NUE9ORU5UUyxcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgICAgdXNlVmFsdWU6IHtcbiAgICAgICAgaWQ6ICdyY2EtY2hhcnQud2lkZ2V0JyxcbiAgICAgICAgbGFiZWw6ICdSQ0EgQ2hhcnQnLFxuICAgICAgICBwcmV2aWV3SW1hZ2U6IHByZXZpZXcucHJldmlld0ltYWdlLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc3BsYXkgdGhlIFJDQSB3aGVuZXZlciBBRCA+IDEnLFxuICAgICAgICBjb21wb25lbnQ6IEdwTGliUmNhQ29tcG9uZW50LFxuICAgICAgICBjb25maWdDb21wb25lbnQ6IEdwTGliUmNhQ29uZmlnQ29tcG9uZW50LFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgbmcxOiB7XG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgIG5vRGV2aWNlVGFyZ2V0OiBmYWxzZSxcbiAgICAgICAgICAgICAgbm9OZXdXaWRnZXRzOiBmYWxzZSxcbiAgICAgICAgICAgICAgZGV2aWNlVGFyZ2V0Tm90UmVxdWlyZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICBncm91cHNTZWxlY3RhYmxlOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBHcExpYlJjYU1vZHVsZSB7fVxuIl19