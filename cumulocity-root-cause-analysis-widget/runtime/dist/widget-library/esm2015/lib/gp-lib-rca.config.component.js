import { __awaiter } from "tslib";
import { Component, Input, isDevMode } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MeasurementService } from '@c8y/client';
import { AlertService } from '@c8y/ngx-components';
import { BehaviorSubject } from 'rxjs';
import { Commonc8yService } from './Commonc8yservice.service';
import { skip } from 'rxjs/operators';
export class GpLibRcaConfigComponent {
    constructor(cmonSvc, alertervice, measurementService, formBuilder) {
        this.cmonSvc = cmonSvc;
        this.alertervice = alertervice;
        this.measurementService = measurementService;
        this.formBuilder = formBuilder;
        this.config = {};
        this.measurementRCAList = [];
        this.observableMeasurements$ = new BehaviorSubject(this.measurementRCAList);
        this.isOpenCP = false;
        this.borderCP = false;
        this.rcaMeasuremntDeviceForm = new FormGroup({
            rcadevicemeasure: new FormControl(),
            intervalSelect: new FormControl(),
            chartcolor: new FormControl(),
            bordercolor: new FormControl(),
        });
    }
    ngOnInit() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.config.device && this.config.device.id) {
                this.deviceId = this.config.device.id;
                yield this.getmeasurement();
            }
        });
    }
    getmeasurement() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.deviceId) {
                const response = yield this.cmonSvc.getTargetObject(this.deviceId);
                yield this.cmonSvc.getFragmentSeries(response, this.measurementRCAList, this.observableMeasurements$);
                if (!this.measurementRCAType) {
                    this.measurementRCAType = {};
                }
                else {
                    if (this.ListMeasurementType.length > 0) {
                        let measurementType;
                        for (measurementType of this.ListMeasurementType) {
                            if (this.measurementRCAType.name === measurementType.name) {
                                this.measurementRCAType = measurementType;
                            }
                        }
                    }
                }
                // Get the measurements as soon as device or group is selected
                this.measurementSubs = this.observableMeasurements$
                    .pipe(skip(1))
                    // tslint:disable-next-line: deprecation
                    .subscribe((mes) => __awaiter(this, void 0, void 0, function* () {
                    this.ListMeasurementType = [];
                    if (mes && mes.length > 0) {
                        this.ListMeasurementType = [...mes];
                        if (isDevMode()) {
                            console.log('+-+- CHECKING LIST MEASUREMENTS FOR: ', this.ListMeasurementType);
                        }
                    }
                }));
            }
        });
    }
    invokeSetRCA() {
        if (this.config.selectedRCAMeasurements.length > 0) {
            if (isDevMode()) {
                console.log('Selected RCA Measurements', this.config.selectedRCAMeasurements);
            }
        }
    }
    openColorPicker() {
        if (!this.isOpenCP) {
            this.isOpenCP = true;
        }
    }
    openBorderColorPicker() {
        if (!this.borderCP) {
            this.borderCP = true;
        }
    }
    closeColorPicker() {
        if (this.isOpenCP) {
            this.isOpenCP = false;
        }
    }
    closeBorderColorPicker() {
        if (this.borderCP) {
            this.borderCP = false;
        }
    }
    setSelectedColor(value) {
        if (this.config.color) {
            this.config.color = this.config.color + ';' + value;
        }
        else {
            this.config.color = value;
        }
    }
    setSelectedBorderColor(value) {
        if (this.config.borderColor) {
            this.config.borderColor = this.config.borderColor + ';' + value;
        }
        else {
            this.config.borderColor = value;
        }
    }
    ngDoCheck() {
        if (this.config.device && this.config.device.id !== this.deviceId) {
            this.deviceId = this.config.device.id;
            this.ListMeasurementType = [];
            this.getmeasurement();
        }
    }
}
GpLibRcaConfigComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-gp-lib-config-rca',
                template: "<form [formGroup]=\"rcaMeasuremntDeviceForm\">\n  <div bg-white card-block large-padding>\n    <label style=\"padding-top: 20px\" for=\"Measurements\" translate=\"\">Select RCA Measurement</label>\n    <div class=\"form-group\">\n      <ng-select\n        required\n        [items]=\"ListMeasurementType\"\n        bindLabel=\"description\"\n        bindValue=\"description\"\n        name=\"measurementRCASelect\"\n        required\n        [multiple]=\"true\"\n        [closeOnSelect]=\"false\"\n        [searchable]=\"true\"\n        placeholder=\"Select Measurements\"\n        [(ngModel)]=\"config.selectedRCAMeasurements\"\n        formControlName=\"rcadevicemeasure\"\n        (change)=\"invokeSetRCA()\"\n      >\n      </ng-select>\n    </div>\n  </div>\n  <div class=\"form-group\">\n    <label for=\"intervalSelect\">Interval (max.20 measurements considered)</label>\n    <div class=\"c8y-select-wrapper\">\n      <select\n        formControlName=\"intervalSelect\"\n        id=\"intervalSelect\"\n        class=\"form-control\"\n        [(ngModel)]=\"config.interval\"\n      >\n        <option>Select\u2026</option>\n        <option>Last Hour</option>\n        <option>Last Minute</option>\n      </select>\n      <span></span>\n    </div>\n  </div>\n  <div style=\"display: flex\">\n    <div style=\"flex-grow: 1; margin-right: 5px\">\n      <label translate>Chart Color</label>\n      <input\n        formControlName=\"chartcolor\"\n        class=\"form-control\"\n        type=\"text\"\n        id=\"colorInput\"\n        name=\"config.color\"\n        (click)=\"openColorPicker()\"\n        style=\"width: 100%\"\n        [(ngModel)]=\"config.color\"\n        placeholder=\"Color code i.e #0899CC or leave blank for default colors\"\n      />\n      <app-color-picker\n        [ngClass]=\"isOpenCP ? 'colorPickerModal' : 'hideColorPicker'\"\n        (closeColorPicker)=\"closeColorPicker()\"\n        (colorSet)=\"setSelectedColor($event)\"\n      ></app-color-picker>\n    </div>\n    <div style=\"flex-grow: 1; margin-right: 5px\">\n      <label translate>Border Color</label>\n      <input\n        formControlName=\"bordercolor\"\n        class=\"form-control\"\n        type=\"text\"\n        id=\"colorInputBorder\"\n        name=\"config.borderColor\"\n        (click)=\"openBorderColorPicker()\"\n        style=\"width: 100%\"\n        [(ngModel)]=\"config.borderColor\"\n        placeholder=\"Choose border color\"\n      />\n      <app-color-picker\n        [ngClass]=\"borderCP ? 'colorPickerModal' : 'hideColorPicker'\"\n        (closeColorPicker)=\"closeBorderColorPicker()\"\n        (colorSet)=\"setSelectedBorderColor($event)\"\n      ></app-color-picker>\n    </div>\n  </div>\n</form>\n",
                styles: [""]
            },] }
];
GpLibRcaConfigComponent.ctorParameters = () => [
    { type: Commonc8yService },
    { type: AlertService },
    { type: MeasurementService },
    { type: FormBuilder }
];
GpLibRcaConfigComponent.propDecorators = {
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3AtbGliLXJjYS5jb25maWcuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvZ3AtbGliLXJjYS9zcmMvbGliL2dwLWxpYi1yY2EuY29uZmlnLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3JFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNqRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDbkQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUN2QyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUM5RCxPQUFPLEVBQWdFLElBQUksRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBT3BHLE1BQU0sT0FBTyx1QkFBdUI7SUFrQmxDLFlBQ1UsT0FBeUIsRUFDekIsV0FBeUIsRUFDekIsa0JBQXNDLEVBQ3RDLFdBQXdCO1FBSHhCLFlBQU8sR0FBUCxPQUFPLENBQWtCO1FBQ3pCLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1FBQ3pCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUFDdEMsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFyQnpCLFdBQU0sR0FBUSxFQUFFLENBQUM7UUFDMUIsdUJBQWtCLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLDRCQUF1QixHQUFHLElBQUksZUFBZSxDQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBSTVFLGFBQVEsR0FBRyxLQUFLLENBQUM7UUFDakIsYUFBUSxHQUFHLEtBQUssQ0FBQztRQUdqQiw0QkFBdUIsR0FBRyxJQUFJ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QUFRLEVBQUUsdUJBQXVCO2dCQUNqQyw2cUZBQWlEOzthQUVsRDs7O1lBUFEsZ0JBQWdCO1lBRmhCLFlBQVk7WUFEWixrQkFBa0I7WUFEbEIsV0FBVzs7O3FCQWFqQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgaXNEZXZNb2RlLCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZvcm1CdWlsZGVyLCBGb3JtQ29udHJvbCwgRm9ybUdyb3VwIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgTWVhc3VyZW1lbnRTZXJ2aWNlIH0gZnJvbSAnQGM4eS9jbGllbnQnO1xuaW1wb3J0IHsgQWxlcnRTZXJ2aWNlIH0gZnJvbSAnQGM4eS9uZ3gtY29tcG9uZW50cyc7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IENvbW1vbmM4eVNlcnZpY2UgfSBmcm9tICcuL0NvbW1vbmM4eXNlcnZpY2Uuc2VydmljZSc7XG5pbXBvcnQgeyBkZWJvdW5jZVRpbWUsIGRpc3RpbmN0VW50aWxDaGFuZ2VkLCB0YXAsIHN3aXRjaE1hcCwgZmluYWxpemUsIHNraXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1ncC1saWItY29uZmlnLXJjYScsXG4gIHRlbXBsYXRlVXJsOiAnLi9ncC1saWItcmNhLmNvbmZpZy5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL2dwLWxpYi1yY2EuY29tcG9uZW50LmNzcyddLFxufSlcbmV4cG9ydCBjbGFzcyBHcExpYlJjYUNvbmZpZ0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gIEBJbnB1dCgpIGNvbmZpZzogYW55ID0ge307XG4gIG1lYXN1cmVtZW50UkNBTGlzdCA9IFtdO1xuICBvYnNlcnZhYmxlTWVhc3VyZW1lbnRzJCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8YW55Pih0aGlzLm1lYXN1cmVtZW50UkNBTGlzdCk7XG4gIG1lYXN1cmVtZW50UkNBVHlwZTogYW55O1xuICBMaXN0TWVhc3VyZW1lbnRUeXBlOiBhbnk7XG4gIG1lYXN1cmVtZW50U3ViczogYW55O1xuICBpc09wZW5DUCA9IGZhbHNlO1xuICBib3JkZXJDUCA9IGZhbHNlO1xuICBkZXZpY2VJZDogYW55O1xuXG4gIHJjYU1lYXN1cmVtbnREZXZpY2VGb3JtID0gbmV3IEZvcm1Hcm91cCh7XG4gICAgcmNhZGV2aWNlbWVhc3VyZTogbmV3IEZvcm1Db250cm9sKCksXG4gICAgaW50ZXJ2YWxTZWxlY3Q6IG5ldyBGb3JtQ29udHJvbCgpLFxuICAgIGNoYXJ0Y29sb3I6IG5ldyBGb3JtQ29udHJvbCgpLFxuICAgIGJvcmRlcmNvbG9yOiBuZXcgRm9ybUNvbnRyb2woKSxcbiAgfSk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBjbW9uU3ZjOiBDb21tb25jOHlTZXJ2aWNlLFxuICAgIHByaXZhdGUgYWxlcnRlcnZpY2U6IEFsZXJ0U2VydmljZSxcbiAgICBwcml2YXRlIG1lYXN1cmVtZW50U2VydmljZTogTWVhc3VyZW1lbnRTZXJ2aWNlLFxuICAgIHByaXZhdGUgZm9ybUJ1aWxkZXI6IEZvcm1CdWlsZGVyXG4gICkge31cblxuICBhc3luYyBuZ09uSW5pdCgpIHtcbiAgICBpZiAodGhpcy5jb25maWcuZGV2aWNlICYmIHRoaXMuY29uZmlnLmRldmljZS5pZCkge1xuICAgICAgdGhpcy5kZXZpY2VJZCA9IHRoaXMuY29uZmlnLmRldmljZS5pZDtcbiAgICAgIGF3YWl0IHRoaXMuZ2V0bWVhc3VyZW1lbnQoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXRtZWFzdXJlbWVudCgpIHtcbiAgICBpZiAodGhpcy5kZXZpY2VJZCkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmNtb25TdmMuZ2V0VGFyZ2V0T2JqZWN0KHRoaXMuZGV2aWNlSWQpO1xuICAgICAgYXdhaXQgdGhpcy5jbW9uU3ZjLmdldEZyYWdtZW50U2VyaWVzKFxuICAgICAgICByZXNwb25zZSxcbiAgICAgICAgdGhpcy5tZWFzdXJlbWVudFJDQUxpc3QsXG4gICAgICAgIHRoaXMub2JzZXJ2YWJsZU1lYXN1cmVtZW50cyRcbiAgICAgICk7XG4gICAgICBpZiAoIXRoaXMubWVhc3VyZW1lbnRSQ0FUeXBlKSB7XG4gICAgICAgIHRoaXMubWVhc3VyZW1lbnRSQ0FUeXBlID0ge307XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5MaXN0TWVhc3VyZW1lbnRUeXBlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsZXQgbWVhc3VyZW1lbnRUeXBlO1xuICAgICAgICAgIGZvciAobWVhc3VyZW1lbnRUeXBlIG9mIHRoaXMuTGlzdE1lYXN1cmVtZW50VHlwZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMubWVhc3VyZW1lbnRSQ0FUeXBlLm5hbWUgPT09IG1lYXN1cmVtZW50VHlwZS5uYW1lKSB7XG4gICAgICAgICAgICAgIHRoaXMubWVhc3VyZW1lbnRSQ0FUeXBlID0gbWVhc3VyZW1lbnRUeXBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBHZXQgdGhlIG1lYXN1cmVtZW50cyBhcyBzb29uIGFzIGRldmljZSBvciBncm91cCBpcyBzZWxlY3RlZFxuICAgICAgdGhpcy5tZWFzdXJlbWVudFN1YnMgPSB0aGlzLm9ic2VydmFibGVNZWFzdXJlbWVudHMkXG4gICAgICAgIC5waXBlKHNraXAoMSkpXG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogZGVwcmVjYXRpb25cbiAgICAgICAgLnN1YnNjcmliZShhc3luYyAobWVzKSA9PiB7XG4gICAgICAgICAgdGhpcy5MaXN0TWVhc3VyZW1lbnRUeXBlID0gW107XG4gICAgICAgICAgaWYgKG1lcyAmJiBtZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5MaXN0TWVhc3VyZW1lbnRUeXBlID0gWy4uLm1lc107XG4gICAgICAgICAgICBpZiAoaXNEZXZNb2RlKCkpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJystKy0gQ0hFQ0tJTkcgTElTVCBNRUFTVVJFTUVOVFMgRk9SOiAnLCB0aGlzLkxpc3RNZWFzdXJlbWVudFR5cGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgaW52b2tlU2V0UkNBKCkge1xuICAgIGlmICh0aGlzLmNvbmZpZy5zZWxlY3RlZFJDQU1lYXN1cmVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoaXNEZXZNb2RlKCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdTZWxlY3RlZCBSQ0EgTWVhc3VyZW1lbnRzJywgdGhpcy5jb25maWcuc2VsZWN0ZWRSQ0FNZWFzdXJlbWVudHMpO31cbiAgICB9XG4gIH1cbiAgb3BlbkNvbG9yUGlja2VyKCkge1xuICAgIGlmICghdGhpcy5pc09wZW5DUCkge1xuICAgICAgdGhpcy5pc09wZW5DUCA9IHRydWU7XG4gICAgfVxuICB9XG4gIG9wZW5Cb3JkZXJDb2xvclBpY2tlcigpIHtcbiAgICBpZiAoIXRoaXMuYm9yZGVyQ1ApIHtcbiAgICAgIHRoaXMuYm9yZGVyQ1AgPSB0cnVlO1xuICAgIH1cbiAgfVxuICBjbG9zZUNvbG9yUGlja2VyKCkge1xuICAgIGlmICh0aGlzLmlzT3BlbkNQKSB7XG4gICAgICB0aGlzLmlzT3BlbkNQID0gZmFsc2U7XG4gICAgfVxuICB9XG4gIGNsb3NlQm9yZGVyQ29sb3JQaWNrZXIoKSB7XG4gICAgaWYgKHRoaXMuYm9yZGVyQ1ApIHtcbiAgICAgIHRoaXMuYm9yZGVyQ1AgPSBmYWxzZTtcbiAgICB9XG4gIH1cbiAgc2V0U2VsZWN0ZWRDb2xvcih2YWx1ZTogc3RyaW5nKSB7XG4gICAgaWYgKHRoaXMuY29uZmlnLmNvbG9yKSB7XG4gICAgICB0aGlzLmNvbmZpZy5jb2xvciA9IHRoaXMuY29uZmlnLmNvbG9yICsgJzsnICsgdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29uZmlnLmNvbG9yID0gdmFsdWU7XG4gICAgfVxuICB9XG4gIHNldFNlbGVjdGVkQm9yZGVyQ29sb3IodmFsdWU6IHN0cmluZykge1xuICAgIGlmICh0aGlzLmNvbmZpZy5ib3JkZXJDb2xvcikge1xuICAgICAgdGhpcy5jb25maWcuYm9yZGVyQ29sb3IgPSB0aGlzLmNvbmZpZy5ib3JkZXJDb2xvciArICc7JyArIHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNvbmZpZy5ib3JkZXJDb2xvciA9IHZhbHVlO1xuICAgIH1cbiAgfVxuICBuZ0RvQ2hlY2soKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY29uZmlnLmRldmljZSAmJiB0aGlzLmNvbmZpZy5kZXZpY2UuaWQgIT09IHRoaXMuZGV2aWNlSWQpIHtcbiAgICAgIHRoaXMuZGV2aWNlSWQgPSB0aGlzLmNvbmZpZy5kZXZpY2UuaWQ7XG4gICAgICB0aGlzLkxpc3RNZWFzdXJlbWVudFR5cGUgPSBbXTtcbiAgICAgIHRoaXMuZ2V0bWVhc3VyZW1lbnQoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==