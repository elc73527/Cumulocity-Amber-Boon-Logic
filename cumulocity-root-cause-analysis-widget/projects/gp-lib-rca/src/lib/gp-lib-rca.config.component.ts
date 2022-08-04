import { Component, Input, isDevMode, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MeasurementService } from '@c8y/client';
import { AlertService } from '@c8y/ngx-components';
import { BehaviorSubject } from 'rxjs';
import { Commonc8yService } from './Commonc8yservice.service';
import { debounceTime, distinctUntilChanged, tap, switchMap, finalize, skip } from 'rxjs/operators';

@Component({
  selector: 'lib-gp-lib-config-rca',
  templateUrl: './gp-lib-rca.config.component.html',
  styleUrls: ['./gp-lib-rca.component.css'],
})
export class GpLibRcaConfigComponent implements OnInit {
  @Input() config: any = {};
  measurementRCAList = [];
  observableMeasurements$ = new BehaviorSubject<any>(this.measurementRCAList);
  measurementRCAType: any;
  ListMeasurementType: any;
  measurementSubs: any;
  isOpenCP = false;
  borderCP = false;
  deviceId: any;

  rcaMeasuremntDeviceForm = new FormGroup({
    rcadevicemeasure: new FormControl(),
    intervalSelect: new FormControl(),
    chartcolor: new FormControl(),
    bordercolor: new FormControl(),
  });

  constructor(
    private cmonSvc: Commonc8yService,
    private alertervice: AlertService,
    private measurementService: MeasurementService,
    private formBuilder: FormBuilder
  ) {}

  async ngOnInit() {
    if (this.config.device && this.config.device.id) {
      this.deviceId = this.config.device.id;
      await this.getmeasurement();
    }
  }

  async getmeasurement() {
    if (this.deviceId) {
      const response = await this.cmonSvc.getTargetObject(this.deviceId);
      await this.cmonSvc.getFragmentSeries(
        response,
        this.measurementRCAList,
        this.observableMeasurements$
      );
      if (!this.measurementRCAType) {
        this.measurementRCAType = {};
      } else {
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
        .subscribe(async (mes) => {
          this.ListMeasurementType = [];
          if (mes && mes.length > 0) {
            this.ListMeasurementType = [...mes];
            if (isDevMode()) {
              console.log('+-+- CHECKING LIST MEASUREMENTS FOR: ', this.ListMeasurementType);
            }
          }
        });
    }
  }

  invokeSetRCA() {
    if (this.config.selectedRCAMeasurements.length > 0) {
      if (isDevMode()) {
      console.log('Selected RCA Measurements', this.config.selectedRCAMeasurements);}
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
  setSelectedColor(value: string) {
    if (this.config.color) {
      this.config.color = this.config.color + ';' + value;
    } else {
      this.config.color = value;
    }
  }
  setSelectedBorderColor(value: string) {
    if (this.config.borderColor) {
      this.config.borderColor = this.config.borderColor + ';' + value;
    } else {
      this.config.borderColor = value;
    }
  }
  ngDoCheck(): void {
    if (this.config.device && this.config.device.id !== this.deviceId) {
      this.deviceId = this.config.device.id;
      this.ListMeasurementType = [];
      this.getmeasurement();
    }
  }
}
