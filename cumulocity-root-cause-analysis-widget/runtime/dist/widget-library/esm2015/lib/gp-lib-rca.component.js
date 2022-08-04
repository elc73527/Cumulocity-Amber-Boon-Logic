import { __awaiter } from "tslib";
import { Component, Input, isDevMode } from '@angular/core';
import { Realtime, MeasurementService } from '@c8y/client';
import { Commonc8yService } from './Commonc8yservice.service';
import { AlertService } from '@c8y/ngx-components';
import { skip, } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import * as moment_ from 'moment';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder } from '@angular/forms';
import { RCAViewModalComponent } from './rca-view-modal/rca-view-modal.component';
const moment = moment_;
export class GpLibRcaComponent {
    constructor(cmonSvc, alertervice, measurementService, formBuilder, modalService, realTimeService) {
        this.cmonSvc = cmonSvc;
        this.alertervice = alertervice;
        this.measurementService = measurementService;
        this.formBuilder = formBuilder;
        this.modalService = modalService;
        this.realTimeService = realTimeService;
        this.measurementList = [];
        this.observableMeasurements$ = new BehaviorSubject(this.measurementList);
        this.barChartOptions = {
            scaleShowVerticalLines: false,
            responsive: true,
            legend: {
                position: 'top',
                display: true,
            },
            scales: {},
            elements: {
                line: {
                    fill: false,
                },
            },
        };
        this.barChartType = '';
        this.barChartColors = [];
        this.colorsArr = [];
        this.rcaDataset = [];
        this.realtimeState = true;
        this.allSubscriptions = [];
    }
    ngOnInit() {
        return __awaiter(this, void 0, void 0, function* () {
            this.deviceId = this.config.device.id;
            this.selectedRCAMeasurements = this.config.selectedRCAMeasurements;
            this.interval = this.config.interval;
            // this.interval = "Last Hour";
            //     this.selectedRCAMeasurements = [
            //     "c8y_AmberRootCause.c8y_SignalStrength-actual_current_0",
            //     "c8y_AmberRootCause.c8y_SignalStrength-actual_current_1",
            //     "c8y_AmberRootCause.c8y_SignalStrength-actual_current_2",
            //     "c8y_AmberRootCause.c8y_SignalStrength-actual_current_3",
            //     "c8y_AmberRootCause.c8y_SignalStrength-actual_current_4",
            //     "c8y_AmberRootCause.c8y_SignalStrength-actual_current_5",
            // ];
            // this.deviceId = 8492;
            //   this.selectedRCAMeasurements = [
            //     "c8y_AmberRootCause.c8y_comp-gb_hss_de",
            //     "c8y_AmberRootCause.c8y_comp-gb_hss_nde",
            //     "c8y_AmberRootCause.c8y_comp-comp_female_nde",
            //     "c8y_AmberRootCause.c8y_comp-gb_lss_nde",
            //     "c8y_AmberRootCause.c8y_comp-gb_lss_de",
            //     "c8y_AmberRootCause.c8y_comp-mtr_nde",
            //     "c8y_AmberRootCause.c8y_comp-mtr_de",
            //     "c8y_AmberRootCause.c8y_comp-comp_male_de",
            //     "c8y_AmberRootCause.c8y_comp-comp_male_nde",
            //     "c8y_AmberRootCause.c8y_comp-comp_female_de"
            // ];
            //   this.deviceId = 1380;
            this.barChartOptions['scales'] = {
                xAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                            font: {
                                size: 6,
                            },
                        },
                    },
                ],
                yAxes: [
                    {
                        min: 0,
                        max: 2,
                        ticks: {
                            beginAtZero: true,
                            stepSize: 1,
                        },
                    },
                ],
            };
            yield this.LoadDeviceData();
            if (this.realtimeState) {
                this.allSubscriptions = [];
                this.realtTimeMeasurements(this.deviceId);
            }
        });
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            this.clearSubscriptions();
            yield this.LoadDeviceData();
        });
    }
    /** Toggles the realtime state */
    toggle() {
        return __awaiter(this, void 0, void 0, function* () {
            this.realtimeState = !this.realtimeState;
            if (this.realtimeState) {
                this.allSubscriptions = [];
                this.realtTimeMeasurements(this.deviceId);
            }
            else {
                this.clearSubscriptions();
            }
        });
    }
    realtTimeMeasurements(deviceId) {
        const measurementChannel = `/measurements/${deviceId}`;
        const detailSubs = this.realTimeService.subscribe(measurementChannel, (response) => __awaiter(this, void 0, void 0, function* () {
            if (response && response.data) {
                const measurementData = response.data;
                if (measurementData.data) {
                    const msmt = measurementData.data;
                    if (msmt && msmt[this.valueFragmentType] && msmt[this.valueFragmentType][this.valueFragmentSeries]) {
                        if (isDevMode()) {
                            console.log("msmt", msmt);
                        }
                        yield this.LoadDeviceData();
                    }
                }
            }
        }));
        if (this.realtimeState) {
            this.allSubscriptions.push({
                id: this.deviceId,
                subs: detailSubs,
                type: 'Realtime',
            });
        }
        else {
            this.realTimeService.unsubscribe(detailSubs);
        }
    }
    clearSubscriptions() {
        if (this.allSubscriptions) {
            this.allSubscriptions.forEach((s) => {
                this.realTimeService.unsubscribe(s.subs);
            });
        }
    }
    LoadDeviceData() {
        return __awaiter(this, void 0, void 0, function* () {
            this.device = yield this.cmonSvc.getTargetObject(this.deviceId);
            let response = yield this.cmonSvc.getSpecificFragmentDevices(1, this.device.name);
            if (isDevMode()) {
                console.log('+-+- MANAGED OBJECT WITH AMBER FRAGMENT', response.data);
            }
            if (response.data) {
                yield this.getmeasurement();
            }
            else {
                this.alertervice.danger('Device is not configured to Amber');
            }
        });
    }
    checkFargmentSeries() {
        return __awaiter(this, void 0, void 0, function* () {
            this.measurementList.forEach((ml) => {
                if (ml.name === 'ad') {
                    if (isDevMode()) {
                        console.log('+-+-c8y_ad.ad measurement exist');
                    }
                    this.valueFragmentType = 'c8y_ad';
                    this.valueFragmentSeries = 'ad';
                }
            });
            if (this.valueFragmentSeries && this.valueFragmentType && this.device.id) {
                yield this.createChart(this.device.id);
            }
        });
    }
    getmeasurement() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.device && this.device.id) {
                const response = yield this.cmonSvc.getTargetObject(this.device.id);
                yield this.cmonSvc.getFragmentSeries(response, this.measurementList, this.observableMeasurements$);
                if (!this.measurementType) {
                    this.measurementType = {};
                }
                else {
                    if (this.measurementTypeList.length > 0) {
                        let measurementType;
                        for (measurementType of this.measurementTypeList) {
                            if (this.measurementType.name === measurementType.name) {
                                this.measurementType = measurementType;
                            }
                        }
                    }
                }
                // Get the measurements as soon as device or group is selected
                this.measurementSubs = this.observableMeasurements$
                    .pipe(skip(1))
                    // tslint:disable-next-line: deprecation
                    .subscribe((mes) => __awaiter(this, void 0, void 0, function* () {
                    this.measurementTypeList = [];
                    if (mes && mes.length > 0) {
                        this.measurementTypeList = [...mes];
                        if (isDevMode()) {
                            console.log('+-+- CHECKING LIST MEASUREMENTS FOR: ', this.measurementTypeList);
                        }
                        yield this.checkFargmentSeries();
                    }
                }));
            }
        });
    }
    /** Fetches the events using Event Service for the given device and particular event type */
    createChart(deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = moment();
            var totime = moment(now, 'YYYY-MM-DD HH:mm:ss').format();
            let dataSet = [];
            var fromtime;
            if (this.interval === 'Last Hour') {
                fromtime = moment(totime).subtract(2, 'hours').format();
            }
            else if (this.interval === 'Last Minute') {
                fromtime = moment(totime).subtract(1, 'minutes').format();
            }
            else if (this.interval === '' || this.interval === undefined) {
                fromtime = moment(totime).subtract(1, 'hours').format();
            }
            if (isDevMode()) {
                console.log('fromtime - totime', fromtime);
            }
            const response = (yield this.cmonSvc.getLastMeasurementForSource(deviceId, fromtime, totime, this.valueFragmentType, this.valueFragmentSeries));
            if (isDevMode()) {
                console.log('+-+- Measurement data: ', response);
            }
            if (response && response.data.length > 0) {
                response.data.forEach((mes) => {
                    if (mes &&
                        mes[this.valueFragmentType] &&
                        mes[this.valueFragmentType][this.valueFragmentSeries]) {
                        const date = moment(mes.time).format('YYYY-MM-DD HH:mm:ss');
                        const value = mes[this.valueFragmentType][this.valueFragmentSeries].value;
                        let arr = { key: date, value: value };
                        dataSet.push(arr);
                    }
                });
                if (isDevMode()) {
                    console.log('dataset', dataSet);
                }
                dataSet.reverse();
                if (isDevMode()) {
                    console.log('+-+- val: ', dataSet);
                }
                let k;
                const dataValues = [];
                const labels = [];
                const dataResult = {};
                this.barChartLabels = [];
                this.barChartData = [];
                dataSet.forEach((iteam) => {
                    labels.push(moment(iteam.key).format('YYYY-MM-DD HH:mm:ss'));
                    dataValues.push(iteam.value);
                });
                if (isDevMode()) {
                    console.log('dataValues ', dataValues);
                    console.log('labels', labels);
                }
                let dlabels = labels.map((l) => l.split(' '));
                if (dataValues.length > 0) {
                    this.barChartLabels = dlabels;
                    this.barChartData = [{ data: dataValues, label: 'AD' }];
                    this.barChartType = 'line';
                    this.dataLoaded = Promise.resolve(true);
                }
                this.setChartColors();
                if (isDevMode()) {
                    console.log('barChartData', this.barChartData);
                }
            }
        });
    }
    chartClicked(event) {
        if (isDevMode()) {
            console.log('event', event);
        }
        if (event.active.length > 0) {
            const chart = event.active[0]._chart;
            const activePoints = chart.getElementsAtEventForMode(event.event, 'point', chart.options);
            const firstPoint = activePoints[0];
            const label = chart.data.labels[firstPoint._index];
            const value = chart.data.datasets[firstPoint._datasetIndex].data[firstPoint._index];
            if (value > 0) {
                this.displayModalDialog(label, value);
            }
        }
        else {
            if (isDevMode()) {
                console.log('there is no active element');
            }
            return;
        }
    }
    getRCAValue(time, setfalg) {
        return __awaiter(this, void 0, void 0, function* () {
            this.rcaDataset = [];
            let fragment;
            let series = [];
            let response;
            if (this.selectedRCAMeasurements.length > 0) {
                this.selectedRCAMeasurements.forEach((fs) => __awaiter(this, void 0, void 0, function* () {
                    let values = fs.split('.', 2);
                    fragment = values[0];
                    series.push(values[1]);
                }));
                if (setfalg === 1) {
                    var fromtime = moment(time).subtract(1, 'minutes').format();
                    var totime = moment(time, 'YYYY-MM-DD HH:mm:ss').format();
                    response = (yield this.cmonSvc.getMeasurementForSource(this.deviceId, fromtime, totime, fragment));
                }
                else if (setfalg === 0) {
                    var totime = moment(time).add(1, 'minutes').format();
                    var fromtime = moment(time, 'YYYY-MM-DD HH:mm:ss').format();
                    response = (yield this.cmonSvc.getMeasurementForSource(this.deviceId, fromtime, totime, fragment));
                }
                if (isDevMode()) {
                    console.log('response', response);
                }
                if (response && response.data.length === 1) {
                    response.data.forEach((mes) => {
                        series.forEach((series) => {
                            if (mes && mes[fragment]) {
                                const value = mes[fragment][series].value;
                                let arr = { key: series, value: value };
                                this.rcaDataset.push(arr);
                            }
                        });
                    });
                }
                else if (response && response.data.length > 1) {
                    const resp = response.data[response.data.length - 1];
                    series.forEach((series) => {
                        if (series) {
                            const value = resp[fragment][series].value;
                            let arr = { key: series, value: value };
                            this.rcaDataset.push(arr);
                        }
                    });
                }
            }
        });
    }
    displayModalDialog(time, value) {
        return __awaiter(this, void 0, void 0, function* () {
            let ctime = time.join(' ');
            let dataset;
            let setflag = 1;
            yield this.getRCAValue(ctime, setflag);
            if (isDevMode()) {
                console.log('rcaDataset', this.rcaDataset);
            }
            if (this.rcaDataset.length === 0) {
                setflag = 0;
                yield this.getRCAValue(ctime, setflag);
                if (isDevMode()) {
                    console.log('rcaDataset inner fnction', this.rcaDataset);
                }
            }
            const initialState = {
                device: this.deviceId,
                time: ctime,
                value: value,
                rcaDataset: this.rcaDataset,
                configcolor: this.config.color,
                configborderColor: this.config.borderColor,
            };
            this.bsModalRefOption = this.modalService.show(RCAViewModalComponent, {
                initialState,
            });
        });
    }
    setChartColors() {
        let borderColor = [];
        if (this.config.color !== undefined) {
            this.colorsArr = this.config.color.split(';');
            if (this.config.borderColor === undefined || this.config.borderColor === '') {
                borderColor = [];
            }
            else {
                borderColor = this.config.borderColor.split(';');
            }
            if (this.config.color === '') {
                this.barChartColors = [];
            }
            else if (this.colorsArr.length >= this.barChartData.length) {
                for (let k = 0; k < this.barChartData.length; k++) {
                    this.barChartColors.push({
                        backgroundColor: this.colorsArr[k],
                        // @ts-ignore
                        borderColor,
                    });
                }
            }
            else if (this.barChartData[0].data.length <= this.colorsArr.length) {
                if (borderColor.length < this.barChartData[0].data.length) {
                    borderColor = [];
                }
                this.barChartColors = [
                    {
                        // @ts-ignore
                        backgroundColor: this.colorsArr,
                        // @ts-ignore
                        borderColor,
                    },
                ];
            }
            else {
                this.barChartColors = [];
            }
        }
        else {
            this.barChartColors = [];
        }
    }
    ngOnDestroy() {
        this.clearSubscriptions();
    }
}
GpLibRcaComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-gp-lib-rca',
                template: "<div>\n  <div style=\"height: 40px\">\n    <div style=\"float: right; margin-right: 10px\">\n      <button\n        type=\"button\"\n        class=\"btn btn-link c8y-realtime\"\n        title=\"Toggle realtime\"\n        (click)=\"toggle()\"\n      >\n        <span [ngClass]=\"realtimeState ? 'c8y-pulse active' : 'c8y-pulse inactive'\"></span>\n        <span>Realtime</span>\n      </button>\n      <button\n        style=\"color: #1776bf; margin-right: 5px\"\n        type=\"button\"\n        class=\"btn btn-clean\"\n        (click)=\"refresh()\"\n      >\n        <i c8yIcon=\"refresh\"></i>\n      </button>\n    </div>\n  </div>\n  <div *ngIf=\"dataLoaded | async\">\n    <div style=\"display: block\">\n      <canvas\n        baseChart\n        [datasets]=\"barChartData\"\n        [labels]=\"barChartLabels\"\n        [colors]=\"barChartColors\"\n        [options]=\"barChartOptions\"\n        [chartType]=\"barChartType\"\n        (chartClick)=\"chartClicked($event)\"\n      >\n      </canvas>\n    </div>\n  </div>\n</div>\n",
                styles: [""]
            },] }
];
GpLibRcaComponent.ctorParameters = () => [
    { type: Commonc8yService },
    { type: AlertService },
    { type: MeasurementService },
    { type: FormBuilder },
    { type: BsModalService },
    { type: Realtime }
];
GpLibRcaComponent.propDecorators = {
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3AtbGliLXJjYS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9ncC1saWItcmNhL3NyYy9saWIvZ3AtbGliLXJjYS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQVUsS0FBSyxFQUFhLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMvRSxPQUFPLEVBQW9CLFFBQVEsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUM3RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDbkQsT0FBTyxFQU1MLElBQUksR0FHTCxNQUFNLGdCQUFnQixDQUFDO0FBQ3hCLE9BQU8sRUFBRSxlQUFlLEVBQXFDLE1BQU0sTUFBTSxDQUFDO0FBRTFFLE9BQU8sS0FBSyxPQUFPLE1BQU0sUUFBUSxDQUFDO0FBR2xDLE9BQU8sRUFBYyxjQUFjLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRSxPQUFPLEVBQUUsV0FBVyxFQUFzQyxNQUFNLGdCQUFnQixDQUFDO0FBQ2pGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBRWxGLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQztBQU92QixNQUFNLE9BQU8saUJBQWlCO0lBdUM1QixZQUNVLE9BQXlCLEVBQ3pCLFdBQXlCLEVBQ3pCLGtCQUFzQyxFQUN0QyxXQUF3QixFQUN4QixZQUE0QixFQUM1QixlQUF5QjtRQUx6QixZQUFPLEdBQVAsT0FBTyxDQUFrQjtRQUN6QixnQkFBVyxHQUFYLFdBQVcsQ0FBYztRQUN6Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1FBQ3RDLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQ3hCLGlCQUFZLEdBQVosWUFBWSxDQUFnQjtRQUM1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QVc7UUFDVCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUM1QixDQUFDOzs7WUF4YkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxnQkFBZ0I7Z0JBQzFCLHdoQ0FBMEM7O2FBRTNDOzs7WUEzQlEsZ0JBQWdCO1lBQ2hCLFlBQVk7WUFGZ0Isa0JBQWtCO1lBbUI5QyxXQUFXO1lBREMsY0FBYztZQWxCUixRQUFROzs7cUJBOEJoQyxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBPbkluaXQsIElucHV0LCBPbkRlc3Ryb3ksIGlzRGV2TW9kZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSW52ZW50b3J5U2VydmljZSwgUmVhbHRpbWUsIE1lYXN1cmVtZW50U2VydmljZSB9IGZyb20gJ0BjOHkvY2xpZW50JztcbmltcG9ydCB7IENvbW1vbmM4eVNlcnZpY2UgfSBmcm9tICcuL0NvbW1vbmM4eXNlcnZpY2Uuc2VydmljZSc7XG5pbXBvcnQgeyBBbGVydFNlcnZpY2UgfSBmcm9tICdAYzh5L25neC1jb21wb25lbnRzJztcbmltcG9ydCB7XG4gIGRlYm91bmNlVGltZSxcbiAgZGlzdGluY3RVbnRpbENoYW5nZWQsXG4gIHRhcCxcbiAgc3dpdGNoTWFwLFxuICBmaW5hbGl6ZSxcbiAgc2tpcCxcbiAgbWluLFxuICBtYXgsXG59IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgZnJvbSwgbmV2ZXIsIE9ic2VydmFibGUsIE9ic2VydmVyIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyB0aW1lIH0gZnJvbSAnY29uc29sZSc7XG5pbXBvcnQgKiBhcyBtb21lbnRfIGZyb20gJ21vbWVudCc7XG5pbXBvcnQgeyBEYXRlUGlwZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBTdWJqZWN0IH0gZnJvbSAncnhqcy9pbnRlcm5hbC9TdWJqZWN0JztcbmltcG9ydCB7IEJzTW9kYWxSZWYsIEJzTW9kYWxTZXJ2aWNlIH0gZnJvbSAnbmd4LWJvb3RzdHJhcC9tb2RhbCc7XG5pbXBvcnQgeyBGb3JtQnVpbGRlciwgRm9ybUNvbnRyb2wsIEZvcm1Hcm91cCwgVmFsaWRhdG9ycyB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IFJDQVZpZXdNb2RhbENvbXBvbmVudCB9IGZyb20gJy4vcmNhLXZpZXctbW9kYWwvcmNhLXZpZXctbW9kYWwuY29tcG9uZW50JztcbmltcG9ydCB7IGFuYWx5emVBbmRWYWxpZGF0ZU5nTW9kdWxlcyB9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmNvbnN0IG1vbWVudCA9IG1vbWVudF87XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1ncC1saWItcmNhJyxcbiAgdGVtcGxhdGVVcmw6ICcuL2dwLWxpYi1yY2EuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi9ncC1saWItcmNhLmNvbXBvbmVudC5jc3MnXSxcbn0pXG5leHBvcnQgY2xhc3MgR3BMaWJSY2FDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICBASW5wdXQoKSBjb25maWc6IGFueTtcbiAgZGV2aWNlSWQ6IGFueTtcbiAgZGV2aWNlOiBhbnk7XG4gIG1lYXN1cmVtZW50TGlzdCA9IFtdO1xuICBvYnNlcnZhYmxlTWVhc3VyZW1lbnRzJCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8YW55Pih0aGlzLm1lYXN1cmVtZW50TGlzdCk7XG4gIG1lYXN1cmVtZW50VHlwZTogYW55O1xuICBtZWFzdXJlbWVudFR5cGVMaXN0OiBhbnk7XG4gIG1lYXN1cmVtZW50U3ViczogYW55O1xuICB2YWx1ZUZyYWdtZW50VHlwZTogYW55O1xuICB2YWx1ZUZyYWdtZW50U2VyaWVzOiBhbnk7XG4gIHNlbGVjdGVkUkNBTWVhc3VyZW1lbnRzOiBhbnk7XG4gIG9sZERhdGFzZXQ6IGFueTtcbiAgcHVibGljIGJhckNoYXJ0T3B0aW9ucyA9IHtcbiAgICBzY2FsZVNob3dWZXJ0aWNhbExpbmVzOiBmYWxzZSxcbiAgICByZXNwb25zaXZlOiB0cnVlLFxuICAgIGxlZ2VuZDoge1xuICAgICAgcG9zaXRpb246ICd0b3AnLFxuICAgICAgZGlzcGxheTogdHJ1ZSxcbiAgICB9LFxuICAgIHNjYWxlczoge30sXG4gICAgZWxlbWVudHM6IHtcbiAgICAgIGxpbmU6IHtcbiAgICAgICAgZmlsbDogZmFsc2UsXG4gICAgICB9LFxuICAgIH0sXG4gIH07XG4gIHB1YmxpYyBiYXJDaGFydFR5cGUgPSAnJztcbiAgcHVibGljIGJhckNoYXJ0RGF0YTogYW55O1xuICBwdWJsaWMgYmFyQ2hhcnRMYWJlbHM6IGFueTtcbiAgcHVibGljIGJhckNoYXJ0Q29sb3JzID0gW107XG4gIGNvbG9yc0FyciA9IFtdO1xuICBkYXRhTG9hZGVkOiBQcm9taXNlPGJvb2xlYW4+IHwgdW5kZWZpbmVkO1xuICBic01vZGFsUmVmT3B0aW9uITogQnNNb2RhbFJlZjtcbiAgcmNhRGF0YXNldDogeyBrZXk6IHN0cmluZzsgdmFsdWU6IGFueSB9W10gPSBbXTtcbiAgYm9yZGVyQ29sb3I6IGFueTtcbiAgcmVhbHRpbWVTdGF0ZSA9IHRydWU7XG4gIGludGVydmFsOiBhbnk7XG4gIHByb3RlY3RlZCBhbGxTdWJzY3JpcHRpb25zOiBhbnkgPSBbXTtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBjbW9uU3ZjOiBDb21tb25jOHlTZXJ2aWNlLFxuICAgIHByaXZhdGUgYWxlcnRlcnZpY2U6IEFsZXJ0U2VydmljZSxcbiAgICBwcml2YXRlIG1lYXN1cmVtZW50U2VydmljZTogTWVhc3VyZW1lbnRTZXJ2aWNlLFxuICAgIHByaXZhdGUgZm9ybUJ1aWxkZXI6IEZvcm1CdWlsZGVyLFxuICAgIHByaXZhdGUgbW9kYWxTZXJ2aWNlOiBCc01vZGFsU2VydmljZSxcbiAgICBwcml2YXRlIHJlYWxUaW1lU2VydmljZTogUmVhbHRpbWVcbiAgKSB7fVxuXG4gIGFzeW5jIG5nT25Jbml0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuZGV2aWNlSWQgPSB0aGlzLmNvbmZpZy5kZXZpY2UuaWQ7XG4gICAgdGhpcy5zZWxlY3RlZFJDQU1lYXN1cmVtZW50cyA9IHRoaXMuY29uZmlnLnNlbGVjdGVkUkNBTWVhc3VyZW1lbnRzO1xuICAgIHRoaXMuaW50ZXJ2YWwgPSB0aGlzLmNvbmZpZy5pbnRlcnZhbDtcbiAgICAvLyB0aGlzLmludGVydmFsID0gXCJMYXN0IEhvdXJcIjtcbiAgICAvLyAgICAgdGhpcy5zZWxlY3RlZFJDQU1lYXN1cmVtZW50cyA9IFtcbiAgICAvLyAgICAgXCJjOHlfQW1iZXJSb290Q2F1c2UuYzh5X1NpZ25hbFN0cmVuZ3RoLWFjdHVhbF9jdXJyZW50XzBcIixcbiAgICAvLyAgICAgXCJjOHlfQW1iZXJSb290Q2F1c2UuYzh5X1NpZ25hbFN0cmVuZ3RoLWFjdHVhbF9jdXJyZW50XzFcIixcbiAgICAvLyAgICAgXCJjOHlfQW1iZXJSb290Q2F1c2UuYzh5X1NpZ25hbFN0cmVuZ3RoLWFjdHVhbF9jdXJyZW50XzJcIixcbiAgICAvLyAgICAgXCJjOHlfQW1iZXJSb290Q2F1c2UuYzh5X1NpZ25hbFN0cmVuZ3RoLWFjdHVhbF9jdXJyZW50XzNcIixcbiAgICAvLyAgICAgXCJjOHlfQW1iZXJSb290Q2F1c2UuYzh5X1NpZ25hbFN0cmVuZ3RoLWFjdHVhbF9jdXJyZW50XzRcIixcbiAgICAvLyAgICAgXCJjOHlfQW1iZXJSb290Q2F1c2UuYzh5X1NpZ25hbFN0cmVuZ3RoLWFjdHVhbF9jdXJyZW50XzVcIixcbiAgICAvLyBdO1xuICAgIC8vIHRoaXMuZGV2aWNlSWQgPSA4NDkyO1xuICAgIC8vICAgdGhpcy5zZWxlY3RlZFJDQU1lYXN1cmVtZW50cyA9IFtcbiAgICAvLyAgICAgXCJjOHlfQW1iZXJSb290Q2F1c2UuYzh5X2NvbXAtZ2JfaHNzX2RlXCIsXG4gICAgLy8gICAgIFwiYzh5X0FtYmVyUm9vdENhdXNlLmM4eV9jb21wLWdiX2hzc19uZGVcIixcbiAgICAvLyAgICAgXCJjOHlfQW1iZXJSb290Q2F1c2UuYzh5X2NvbXAtY29tcF9mZW1hbGVfbmRlXCIsXG4gICAgLy8gICAgIFwiYzh5X0FtYmVyUm9vdENhdXNlLmM4eV9jb21wLWdiX2xzc19uZGVcIixcbiAgICAvLyAgICAgXCJjOHlfQW1iZXJSb290Q2F1c2UuYzh5X2NvbXAtZ2JfbHNzX2RlXCIsXG4gICAgLy8gICAgIFwiYzh5X0FtYmVyUm9vdENhdXNlLmM4eV9jb21wLW10cl9uZGVcIixcbiAgICAvLyAgICAgXCJjOHlfQW1iZXJSb290Q2F1c2UuYzh5X2NvbXAtbXRyX2RlXCIsXG4gICAgLy8gICAgIFwiYzh5X0FtYmVyUm9vdENhdXNlLmM4eV9jb21wLWNvbXBfbWFsZV9kZVwiLFxuICAgIC8vICAgICBcImM4eV9BbWJlclJvb3RDYXVzZS5jOHlfY29tcC1jb21wX21hbGVfbmRlXCIsXG4gICAgLy8gICAgIFwiYzh5X0FtYmVyUm9vdENhdXNlLmM4eV9jb21wLWNvbXBfZmVtYWxlX2RlXCJcbiAgICAvLyBdO1xuICAgIC8vICAgdGhpcy5kZXZpY2VJZCA9IDEzODA7XG4gICAgdGhpcy5iYXJDaGFydE9wdGlvbnNbJ3NjYWxlcyddID0ge1xuICAgICAgeEF4ZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRpY2tzOiB7XG4gICAgICAgICAgICBiZWdpbkF0WmVybzogdHJ1ZSxcbiAgICAgICAgICAgIGZvbnQ6IHtcbiAgICAgICAgICAgICAgc2l6ZTogNixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICB5QXhlczogW1xuICAgICAgICB7XG4gICAgICAgICAgbWluOiAwLFxuICAgICAgICAgIG1heDogMixcbiAgICAgICAgICB0aWNrczoge1xuICAgICAgICAgICAgYmVnaW5BdFplcm86IHRydWUsXG4gICAgICAgICAgICBzdGVwU2l6ZTogMSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9O1xuICAgIGF3YWl0IHRoaXMuTG9hZERldmljZURhdGEoKTtcbiAgICBpZiAodGhpcy5yZWFsdGltZVN0YXRlKSB7XG4gICAgICB0aGlzLmFsbFN1YnNjcmlwdGlvbnMgPSBbXTtcbiAgICAgIHRoaXMucmVhbHRUaW1lTWVhc3VyZW1lbnRzKHRoaXMuZGV2aWNlSWQpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHJlZnJlc2goKSB7XG4gICAgdGhpcy5jbGVhclN1YnNjcmlwdGlvbnMoKTtcbiAgICBhd2FpdCB0aGlzLkxvYWREZXZpY2VEYXRhKCk7XG4gIH1cbiAgLyoqIFRvZ2dsZXMgdGhlIHJlYWx0aW1lIHN0YXRlICovXG4gIGFzeW5jIHRvZ2dsZSgpIHtcbiAgICB0aGlzLnJlYWx0aW1lU3RhdGUgPSAhdGhpcy5yZWFsdGltZVN0YXRlO1xuICAgIGlmICh0aGlzLnJlYWx0aW1lU3RhdGUpIHtcbiAgICAgIHRoaXMuYWxsU3Vic2NyaXB0aW9ucyA9IFtdO1xuICAgICAgdGhpcy5yZWFsdFRpbWVNZWFzdXJlbWVudHModGhpcy5kZXZpY2VJZCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5jbGVhclN1YnNjcmlwdGlvbnMoKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSByZWFsdFRpbWVNZWFzdXJlbWVudHMoZGV2aWNlSWQ6YW55KSB7XG5cbiAgICBjb25zdCBtZWFzdXJlbWVudENoYW5uZWwgPSBgL21lYXN1cmVtZW50cy8ke2RldmljZUlkfWA7XG4gICAgY29uc3QgZGV0YWlsU3VicyAgPSB0aGlzLnJlYWxUaW1lU2VydmljZS5zdWJzY3JpYmUoXG4gICAgICBtZWFzdXJlbWVudENoYW5uZWwsXG4gICAgICBhc3luYyAocmVzcG9uc2U6IHsgZGF0YTogYW55OyB9KSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgY29uc3QgbWVhc3VyZW1lbnREYXRhID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICBpZiAoIG1lYXN1cmVtZW50RGF0YS5kYXRhKSBcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb25zdCBtc210ID0gbWVhc3VyZW1lbnREYXRhLmRhdGE7XG4gICAgICAgICAgICBpZiAoIG1zbXQgJiYgbXNtdFt0aGlzLnZhbHVlRnJhZ21lbnRUeXBlXSAmJiBtc210W3RoaXMudmFsdWVGcmFnbWVudFR5cGVdW3RoaXMudmFsdWVGcmFnbWVudFNlcmllc10pXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGlmIChpc0Rldk1vZGUoKSkge2NvbnNvbGUubG9nKFwibXNtdFwiLG1zbXQpO31cbiAgICAgICAgICAgICAgYXdhaXQgdGhpcy5Mb2FkRGV2aWNlRGF0YSgpOyBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgICk7XG4gICAgICBpZiAodGhpcy5yZWFsdGltZVN0YXRlKSB7XG4gICAgICAgIHRoaXMuYWxsU3Vic2NyaXB0aW9ucy5wdXNoKHtcbiAgICAgICAgICBpZDogdGhpcy5kZXZpY2VJZCxcbiAgICAgICAgICBzdWJzOiBkZXRhaWxTdWJzLFxuICAgICAgICAgIHR5cGU6ICdSZWFsdGltZScsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWFsVGltZVNlcnZpY2UudW5zdWJzY3JpYmUoZGV0YWlsU3Vicyk7XG4gICAgICB9XG4gICAgfVxuIFxuXG4gIHByaXZhdGUgY2xlYXJTdWJzY3JpcHRpb25zKCkge1xuICAgIGlmICh0aGlzLmFsbFN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuYWxsU3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzOiBhbnkpID0+IHtcbiAgICAgICAgdGhpcy5yZWFsVGltZVNlcnZpY2UudW5zdWJzY3JpYmUocy5zdWJzKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICBhc3luYyBMb2FkRGV2aWNlRGF0YSgpIHtcbiAgICB0aGlzLmRldmljZSA9IGF3YWl0IHRoaXMuY21vblN2Yy5nZXRUYXJnZXRPYmplY3QodGhpcy5kZXZpY2VJZCk7XG4gICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5jbW9uU3ZjLmdldFNwZWNpZmljRnJhZ21lbnREZXZpY2VzKDEsIHRoaXMuZGV2aWNlLm5hbWUpO1xuICAgIGlmIChpc0Rldk1vZGUoKSkge1xuICAgICAgY29uc29sZS5sb2coJystKy0gTUFOQUdFRCBPQkpFQ1QgV0lUSCBBTUJFUiBGUkFHTUVOVCcsIHJlc3BvbnNlLmRhdGEpO1xuICAgIH1cbiAgICBpZiAocmVzcG9uc2UuZGF0YSkge1xuICAgICAgYXdhaXQgdGhpcy5nZXRtZWFzdXJlbWVudCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFsZXJ0ZXJ2aWNlLmRhbmdlcignRGV2aWNlIGlzIG5vdCBjb25maWd1cmVkIHRvIEFtYmVyJyk7XG4gICAgfVxuICB9XG4gIGFzeW5jIGNoZWNrRmFyZ21lbnRTZXJpZXMoKSB7XG4gICAgdGhpcy5tZWFzdXJlbWVudExpc3QuZm9yRWFjaCgobWw6IGFueSkgPT4ge1xuICAgICAgaWYgKG1sLm5hbWUgPT09ICdhZCcpIHtcbiAgICAgICAgaWYgKGlzRGV2TW9kZSgpKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJystKy1jOHlfYWQuYWQgbWVhc3VyZW1lbnQgZXhpc3QnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZhbHVlRnJhZ21lbnRUeXBlID0gJ2M4eV9hZCc7XG4gICAgICAgIHRoaXMudmFsdWVGcmFnbWVudFNlcmllcyA9ICdhZCc7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy52YWx1ZUZyYWdtZW50U2VyaWVzICYmIHRoaXMudmFsdWVGcmFnbWVudFR5cGUgJiYgdGhpcy5kZXZpY2UuaWQpIHtcbiAgICAgIGF3YWl0IHRoaXMuY3JlYXRlQ2hhcnQodGhpcy5kZXZpY2UuaWQpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGdldG1lYXN1cmVtZW50KCkge1xuICAgIGlmICh0aGlzLmRldmljZSAmJiB0aGlzLmRldmljZS5pZCkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmNtb25TdmMuZ2V0VGFyZ2V0T2JqZWN0KHRoaXMuZGV2aWNlLmlkKTtcbiAgICAgIGF3YWl0IHRoaXMuY21vblN2Yy5nZXRGcmFnbWVudFNlcmllcyhcbiAgICAgICAgcmVzcG9uc2UsXG4gICAgICAgIHRoaXMubWVhc3VyZW1lbnRMaXN0LFxuICAgICAgICB0aGlzLm9ic2VydmFibGVNZWFzdXJlbWVudHMkXG4gICAgICApO1xuICAgICAgaWYgKCF0aGlzLm1lYXN1cmVtZW50VHlwZSkge1xuICAgICAgICB0aGlzLm1lYXN1cmVtZW50VHlwZSA9IHt9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMubWVhc3VyZW1lbnRUeXBlTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgbGV0IG1lYXN1cmVtZW50VHlwZTtcbiAgICAgICAgICBmb3IgKG1lYXN1cmVtZW50VHlwZSBvZiB0aGlzLm1lYXN1cmVtZW50VHlwZUxpc3QpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1lYXN1cmVtZW50VHlwZS5uYW1lID09PSBtZWFzdXJlbWVudFR5cGUubmFtZSkge1xuICAgICAgICAgICAgICB0aGlzLm1lYXN1cmVtZW50VHlwZSA9IG1lYXN1cmVtZW50VHlwZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gR2V0IHRoZSBtZWFzdXJlbWVudHMgYXMgc29vbiBhcyBkZXZpY2Ugb3IgZ3JvdXAgaXMgc2VsZWN0ZWRcbiAgICAgIHRoaXMubWVhc3VyZW1lbnRTdWJzID0gdGhpcy5vYnNlcnZhYmxlTWVhc3VyZW1lbnRzJFxuICAgICAgICAucGlwZShza2lwKDEpKVxuICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IGRlcHJlY2F0aW9uXG4gICAgICAgIC5zdWJzY3JpYmUoYXN5bmMgKG1lcykgPT4ge1xuICAgICAgICAgIHRoaXMubWVhc3VyZW1lbnRUeXBlTGlzdCA9IFtdO1xuICAgICAgICAgIGlmIChtZXMgJiYgbWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMubWVhc3VyZW1lbnRUeXBlTGlzdCA9IFsuLi5tZXNdO1xuICAgICAgICAgICAgaWYgKGlzRGV2TW9kZSgpKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCcrLSstIENIRUNLSU5HIExJU1QgTUVBU1VSRU1FTlRTIEZPUjogJywgdGhpcy5tZWFzdXJlbWVudFR5cGVMaXN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IHRoaXMuY2hlY2tGYXJnbWVudFNlcmllcygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEZldGNoZXMgdGhlIGV2ZW50cyB1c2luZyBFdmVudCBTZXJ2aWNlIGZvciB0aGUgZ2l2ZW4gZGV2aWNlIGFuZCBwYXJ0aWN1bGFyIGV2ZW50IHR5cGUgKi9cbiAgYXN5bmMgY3JlYXRlQ2hhcnQoZGV2aWNlSWQ6IGFueSkge1xuICAgIGNvbnN0IG5vdyA9IG1vbWVudCgpO1xuICAgIHZhciB0b3RpbWUgPSBtb21lbnQobm93LCAnWVlZWS1NTS1ERCBISDptbTpzcycpLmZvcm1hdCgpO1xuICAgIGxldCBkYXRhU2V0OiB7IGtleTogc3RyaW5nOyB2YWx1ZTogYW55IH1bXSA9IFtdO1xuICAgIHZhciBmcm9tdGltZTogYW55O1xuICAgIGlmICh0aGlzLmludGVydmFsID09PSAnTGFzdCBIb3VyJykge1xuICAgICAgZnJvbXRpbWUgPSBtb21lbnQodG90aW1lKS5zdWJ0cmFjdCgyLCAnaG91cnMnKS5mb3JtYXQoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaW50ZXJ2YWwgPT09ICdMYXN0IE1pbnV0ZScpIHtcbiAgICAgIGZyb210aW1lID0gbW9tZW50KHRvdGltZSkuc3VidHJhY3QoMSwgJ21pbnV0ZXMnKS5mb3JtYXQoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaW50ZXJ2YWwgPT09ICcnIHx8IHRoaXMuaW50ZXJ2YWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZnJvbXRpbWUgPSBtb21lbnQodG90aW1lKS5zdWJ0cmFjdCgxLCAnaG91cnMnKS5mb3JtYXQoKTtcbiAgICB9XG4gICAgaWYgKGlzRGV2TW9kZSgpKSB7Y29uc29sZS5sb2coJ2Zyb210aW1lIC0gdG90aW1lJywgZnJvbXRpbWUpO31cbiAgICBjb25zdCByZXNwb25zZSA9IChhd2FpdCB0aGlzLmNtb25TdmMuZ2V0TGFzdE1lYXN1cmVtZW50Rm9yU291cmNlKFxuICAgICAgZGV2aWNlSWQsXG4gICAgICBmcm9tdGltZSxcbiAgICAgIHRvdGltZSxcbiAgICAgIHRoaXMudmFsdWVGcmFnbWVudFR5cGUsXG4gICAgICB0aGlzLnZhbHVlRnJhZ21lbnRTZXJpZXNcbiAgICApKSBhcyBhbnk7XG5cbiAgICBpZiAoaXNEZXZNb2RlKCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCcrLSstIE1lYXN1cmVtZW50IGRhdGE6ICcsIHJlc3BvbnNlKTtcbiAgICB9XG4gICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLmRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgcmVzcG9uc2UuZGF0YS5mb3JFYWNoKChtZXM6IGFueSkgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgbWVzICYmXG4gICAgICAgICAgbWVzW3RoaXMudmFsdWVGcmFnbWVudFR5cGVdICYmXG4gICAgICAgICAgbWVzW3RoaXMudmFsdWVGcmFnbWVudFR5cGVdW3RoaXMudmFsdWVGcmFnbWVudFNlcmllc11cbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3QgZGF0ZSA9IG1vbWVudChtZXMudGltZSkuZm9ybWF0KCdZWVlZLU1NLUREIEhIOm1tOnNzJyk7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBtZXNbdGhpcy52YWx1ZUZyYWdtZW50VHlwZV1bdGhpcy52YWx1ZUZyYWdtZW50U2VyaWVzXS52YWx1ZTtcbiAgICAgICAgICBsZXQgYXJyID0geyBrZXk6IGRhdGUsIHZhbHVlOiB2YWx1ZSB9O1xuICAgICAgICAgIGRhdGFTZXQucHVzaChhcnIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmIChpc0Rldk1vZGUoKSkge1xuICAgICAgY29uc29sZS5sb2coJ2RhdGFzZXQnLCBkYXRhU2V0KTt9XG4gICAgICBkYXRhU2V0LnJldmVyc2UoKTtcbiAgICAgIGlmIChpc0Rldk1vZGUoKSkge1xuICAgICAgY29uc29sZS5sb2coJystKy0gdmFsOiAnLCBkYXRhU2V0KTt9XG4gICAgICBsZXQgazogYW55O1xuICAgICAgY29uc3QgZGF0YVZhbHVlczogYW55W10gPSBbXTtcbiAgICAgIGNvbnN0IGxhYmVsczogc3RyaW5nW10gPSBbXTtcbiAgICAgIGNvbnN0IGRhdGFSZXN1bHQgPSB7fTtcbiAgICAgIHRoaXMuYmFyQ2hhcnRMYWJlbHMgPSBbXTtcbiAgICAgIHRoaXMuYmFyQ2hhcnREYXRhID0gW107XG5cbiAgICAgIGRhdGFTZXQuZm9yRWFjaCgoaXRlYW0pID0+IHtcbiAgICAgICAgbGFiZWxzLnB1c2gobW9tZW50KGl0ZWFtLmtleSkuZm9ybWF0KCdZWVlZLU1NLUREIEhIOm1tOnNzJykpO1xuICAgICAgICBkYXRhVmFsdWVzLnB1c2goaXRlYW0udmFsdWUpO1xuICAgICAgfSk7XG4gICAgICBpZiAoaXNEZXZNb2RlKCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdkYXRhVmFsdWVzICcsIGRhdGFWYWx1ZXMpO1xuICAgICAgY29uc29sZS5sb2coJ2xhYmVscycsIGxhYmVscyk7XG4gICAgICB9XG4gICAgICBsZXQgZGxhYmVscyA9IGxhYmVscy5tYXAoKGwpID0+IGwuc3BsaXQoJyAnKSk7XG5cbiAgICAgIGlmIChkYXRhVmFsdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5iYXJDaGFydExhYmVscyA9IGRsYWJlbHM7XG4gICAgICAgIHRoaXMuYmFyQ2hhcnREYXRhID0gW3sgZGF0YTogZGF0YVZhbHVlcywgbGFiZWw6ICdBRCcgfV07XG4gICAgICAgIHRoaXMuYmFyQ2hhcnRUeXBlID0gJ2xpbmUnO1xuICAgICAgICB0aGlzLmRhdGFMb2FkZWQgPSBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG4gICAgICB9XG4gICAgICB0aGlzLnNldENoYXJ0Q29sb3JzKCk7XG4gICAgICBpZiAoaXNEZXZNb2RlKCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdiYXJDaGFydERhdGEnLCB0aGlzLmJhckNoYXJ0RGF0YSk7fVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBjaGFydENsaWNrZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgIGlmIChpc0Rldk1vZGUoKSkge2NvbnNvbGUubG9nKCdldmVudCcsIGV2ZW50KTt9XG4gICAgaWYgKGV2ZW50LmFjdGl2ZS5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBjaGFydCA9IGV2ZW50LmFjdGl2ZVswXS5fY2hhcnQ7XG4gICAgICBjb25zdCBhY3RpdmVQb2ludHMgPSBjaGFydC5nZXRFbGVtZW50c0F0RXZlbnRGb3JNb2RlKGV2ZW50LmV2ZW50LCAncG9pbnQnLCBjaGFydC5vcHRpb25zKTtcbiAgICAgIGNvbnN0IGZpcnN0UG9pbnQgPSBhY3RpdmVQb2ludHNbMF07XG4gICAgICBjb25zdCBsYWJlbCA9IGNoYXJ0LmRhdGEubGFiZWxzW2ZpcnN0UG9pbnQuX2luZGV4XTtcbiAgICAgIGNvbnN0IHZhbHVlID0gY2hhcnQuZGF0YS5kYXRhc2V0c1tmaXJzdFBvaW50Ll9kYXRhc2V0SW5kZXhdLmRhdGFbZmlyc3RQb2ludC5faW5kZXhdO1xuICAgICAgaWYgKHZhbHVlID4gMCkge1xuICAgICAgICB0aGlzLmRpc3BsYXlNb2RhbERpYWxvZyhsYWJlbCwgdmFsdWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaXNEZXZNb2RlKCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCd0aGVyZSBpcyBubyBhY3RpdmUgZWxlbWVudCcpO31cbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbiAgYXN5bmMgZ2V0UkNBVmFsdWUodGltZTogc3RyaW5nLCBzZXRmYWxnOiBhbnkpIHtcbiAgICB0aGlzLnJjYURhdGFzZXQgPSBbXTtcbiAgICBsZXQgZnJhZ21lbnQ6IGFueTtcbiAgICBsZXQgc2VyaWVzOiB7IGtleTogc3RyaW5nIH1bXSA9IFtdO1xuICAgIGxldCByZXNwb25zZTogYW55O1xuICAgIGlmICh0aGlzLnNlbGVjdGVkUkNBTWVhc3VyZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWRSQ0FNZWFzdXJlbWVudHMuZm9yRWFjaChhc3luYyAoZnM6IGFueSkgPT4ge1xuICAgICAgICBsZXQgdmFsdWVzID0gZnMuc3BsaXQoJy4nLCAyKTtcbiAgICAgICAgZnJhZ21lbnQgPSB2YWx1ZXNbMF07XG4gICAgICAgIHNlcmllcy5wdXNoKHZhbHVlc1sxXSk7XG4gICAgICB9KTtcbiAgICAgIGlmIChzZXRmYWxnID09PSAxKSB7XG4gICAgICAgIHZhciBmcm9tdGltZSA9IG1vbWVudCh0aW1lKS5zdWJ0cmFjdCgxLCAnbWludXRlcycpLmZvcm1hdCgpO1xuICAgICAgICB2YXIgdG90aW1lID0gbW9tZW50KHRpbWUsICdZWVlZLU1NLUREIEhIOm1tOnNzJykuZm9ybWF0KCk7XG4gICAgICAgIHJlc3BvbnNlID0gKGF3YWl0IHRoaXMuY21vblN2Yy5nZXRNZWFzdXJlbWVudEZvclNvdXJjZShcbiAgICAgICAgICB0aGlzLmRldmljZUlkLFxuICAgICAgICAgIGZyb210aW1lLFxuICAgICAgICAgIHRvdGltZSxcbiAgICAgICAgICBmcmFnbWVudFxuICAgICAgICApKSBhcyBhbnk7XG4gICAgICB9IGVsc2UgaWYgKHNldGZhbGcgPT09IDApIHtcbiAgICAgICAgdmFyIHRvdGltZSA9IG1vbWVudCh0aW1lKS5hZGQoMSwgJ21pbnV0ZXMnKS5mb3JtYXQoKTtcbiAgICAgICAgdmFyIGZyb210aW1lID0gbW9tZW50KHRpbWUsICdZWVlZLU1NLUREIEhIOm1tOnNzJykuZm9ybWF0KCk7XG4gICAgICAgIHJlc3BvbnNlID0gKGF3YWl0IHRoaXMuY21vblN2Yy5nZXRNZWFzdXJlbWVudEZvclNvdXJjZShcbiAgICAgICAgICB0aGlzLmRldmljZUlkLFxuICAgICAgICAgIGZyb210aW1lLFxuICAgICAgICAgIHRvdGltZSxcbiAgICAgICAgICBmcmFnbWVudFxuICAgICAgICApKSBhcyBhbnk7XG4gICAgICB9XG4gICAgICBpZiAoaXNEZXZNb2RlKCkpIHtjb25zb2xlLmxvZygncmVzcG9uc2UnLCByZXNwb25zZSk7fVxuICAgICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLmRhdGEubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJlc3BvbnNlLmRhdGEuZm9yRWFjaCgobWVzOiBhbnkpID0+IHtcbiAgICAgICAgICBzZXJpZXMuZm9yRWFjaCgoc2VyaWVzOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGlmIChtZXMgJiYgbWVzW2ZyYWdtZW50XSkge1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IG1lc1tmcmFnbWVudF1bc2VyaWVzXS52YWx1ZTtcbiAgICAgICAgICAgICAgbGV0IGFyciA9IHsga2V5OiBzZXJpZXMsIHZhbHVlOiB2YWx1ZSB9O1xuICAgICAgICAgICAgICB0aGlzLnJjYURhdGFzZXQucHVzaChhcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UuZGF0YS5sZW5ndGggPiAxKSB7XG4gICAgICAgIGNvbnN0IHJlc3AgPSByZXNwb25zZS5kYXRhW3Jlc3BvbnNlLmRhdGEubGVuZ3RoIC0gMV07XG4gICAgICAgIHNlcmllcy5mb3JFYWNoKChzZXJpZXM6IGFueSkgPT4ge1xuICAgICAgICAgIGlmIChzZXJpZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcmVzcFtmcmFnbWVudF1bc2VyaWVzXS52YWx1ZTtcbiAgICAgICAgICAgIGxldCBhcnIgPSB7IGtleTogc2VyaWVzLCB2YWx1ZTogdmFsdWUgfTtcbiAgICAgICAgICAgIHRoaXMucmNhRGF0YXNldC5wdXNoKGFycik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcHVibGljIGFzeW5jIGRpc3BsYXlNb2RhbERpYWxvZyh0aW1lOiBhbnksIHZhbHVlOiBhbnkpIHtcbiAgICBsZXQgY3RpbWUgPSB0aW1lLmpvaW4oJyAnKTtcbiAgICBsZXQgZGF0YXNldDogYW55O1xuICAgIGxldCBzZXRmbGFnID0gMTtcbiAgICBhd2FpdCB0aGlzLmdldFJDQVZhbHVlKGN0aW1lLCBzZXRmbGFnKTtcblxuICAgIGlmIChpc0Rldk1vZGUoKSkge2NvbnNvbGUubG9nKCdyY2FEYXRhc2V0JywgdGhpcy5yY2FEYXRhc2V0KTt9XG5cbiAgICBpZiAodGhpcy5yY2FEYXRhc2V0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgc2V0ZmxhZyA9IDA7XG4gICAgICBhd2FpdCB0aGlzLmdldFJDQVZhbHVlKGN0aW1lLCBzZXRmbGFnKTtcbiAgICAgIGlmIChpc0Rldk1vZGUoKSkge2NvbnNvbGUubG9nKCdyY2FEYXRhc2V0IGlubmVyIGZuY3Rpb24nLCB0aGlzLnJjYURhdGFzZXQpO31cbiAgICB9XG5cbiAgICBjb25zdCBpbml0aWFsU3RhdGUgPSB7XG4gICAgICBkZXZpY2U6IHRoaXMuZGV2aWNlSWQsXG4gICAgICB0aW1lOiBjdGltZSxcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIHJjYURhdGFzZXQ6IHRoaXMucmNhRGF0YXNldCxcbiAgICAgIGNvbmZpZ2NvbG9yOiB0aGlzLmNvbmZpZy5jb2xvcixcbiAgICAgIGNvbmZpZ2JvcmRlckNvbG9yOiB0aGlzLmNvbmZpZy5ib3JkZXJDb2xvcixcbiAgICB9O1xuICAgIHRoaXMuYnNNb2RhbFJlZk9wdGlvbiA9IHRoaXMubW9kYWxTZXJ2aWNlLnNob3coUkNBVmlld01vZGFsQ29tcG9uZW50LCB7XG4gICAgICBpbml0aWFsU3RhdGUsXG4gICAgICAvLyBjbGFzczogJ21vZGFsLXNtJyxcbiAgICB9KTtcbiAgfVxuXG4gIHNldENoYXJ0Q29sb3JzKCkge1xuICAgIGxldCBib3JkZXJDb2xvciA9IFtdO1xuICAgIGlmICh0aGlzLmNvbmZpZy5jb2xvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmNvbG9yc0FyciA9IHRoaXMuY29uZmlnLmNvbG9yLnNwbGl0KCc7Jyk7XG4gICAgICBpZiAodGhpcy5jb25maWcuYm9yZGVyQ29sb3IgPT09IHVuZGVmaW5lZCB8fCB0aGlzLmNvbmZpZy5ib3JkZXJDb2xvciA9PT0gJycpIHtcbiAgICAgICAgYm9yZGVyQ29sb3IgPSBbXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJvcmRlckNvbG9yID0gdGhpcy5jb25maWcuYm9yZGVyQ29sb3Iuc3BsaXQoJzsnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuY29uZmlnLmNvbG9yID09PSAnJykge1xuICAgICAgICB0aGlzLmJhckNoYXJ0Q29sb3JzID0gW107XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuY29sb3JzQXJyLmxlbmd0aCA+PSB0aGlzLmJhckNoYXJ0RGF0YS5sZW5ndGgpIHtcbiAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCB0aGlzLmJhckNoYXJ0RGF0YS5sZW5ndGg7IGsrKykge1xuICAgICAgICAgIHRoaXMuYmFyQ2hhcnRDb2xvcnMucHVzaCh7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHRoaXMuY29sb3JzQXJyW2tdLFxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgYm9yZGVyQ29sb3IsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5iYXJDaGFydERhdGFbMF0uZGF0YS5sZW5ndGggPD0gdGhpcy5jb2xvcnNBcnIubGVuZ3RoKSB7XG4gICAgICAgIGlmIChib3JkZXJDb2xvci5sZW5ndGggPCB0aGlzLmJhckNoYXJ0RGF0YVswXS5kYXRhLmxlbmd0aCkge1xuICAgICAgICAgIGJvcmRlckNvbG9yID0gW107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5iYXJDaGFydENvbG9ycyA9IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHRoaXMuY29sb3JzQXJyLFxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgYm9yZGVyQ29sb3IsXG4gICAgICAgICAgfSxcbiAgICAgICAgXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYmFyQ2hhcnRDb2xvcnMgPSBbXTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5iYXJDaGFydENvbG9ycyA9IFtdO1xuICAgIH1cbiAgfVxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmNsZWFyU3Vic2NyaXB0aW9ucygpO1xuICB9XG59XG4iXX0=