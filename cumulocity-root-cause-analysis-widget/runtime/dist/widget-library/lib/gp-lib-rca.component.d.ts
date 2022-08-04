import { OnInit } from '@angular/core';
import { Realtime, MeasurementService } from '@c8y/client';
import { Commonc8yService } from './Commonc8yservice.service';
import { AlertService } from '@c8y/ngx-components';
import { BehaviorSubject } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder } from '@angular/forms';
export declare class GpLibRcaComponent implements OnInit {
    private cmonSvc;
    private alertervice;
    private measurementService;
    private formBuilder;
    private modalService;
    private realTimeService;
    config: any;
    deviceId: any;
    device: any;
    measurementList: any[];
    observableMeasurements$: BehaviorSubject<any>;
    measurementType: any;
    measurementTypeList: any;
    measurementSubs: any;
    valueFragmentType: any;
    valueFragmentSeries: any;
    selectedRCAMeasurements: any;
    oldDataset: any;
    barChartOptions: {
        scaleShowVerticalLines: boolean;
        responsive: boolean;
        legend: {
            position: string;
            display: boolean;
        };
        scales: {};
        elements: {
            line: {
                fill: boolean;
            };
        };
    };
    barChartType: string;
    barChartData: any;
    barChartLabels: any;
    barChartColors: any[];
    colorsArr: any[];
    dataLoaded: Promise<boolean> | undefined;
    bsModalRefOption: BsModalRef;
    rcaDataset: {
        key: string;
        value: any;
    }[];
    borderColor: any;
    realtimeState: boolean;
    interval: any;
    protected allSubscriptions: any;
    constructor(cmonSvc: Commonc8yService, alertervice: AlertService, measurementService: MeasurementService, formBuilder: FormBuilder, modalService: BsModalService, realTimeService: Realtime);
    ngOnInit(): Promise<void>;
    refresh(): Promise<void>;
    /** Toggles the realtime state */
    toggle(): Promise<void>;
    private realtTimeMeasurements;
    private clearSubscriptions;
    LoadDeviceData(): Promise<void>;
    checkFargmentSeries(): Promise<void>;
    getmeasurement(): Promise<void>;
    /** Fetches the events using Event Service for the given device and particular event type */
    createChart(deviceId: any): Promise<void>;
    chartClicked(event: any): void;
    getRCAValue(time: string, setfalg: any): Promise<void>;
    displayModalDialog(time: any, value: any): Promise<void>;
    setChartColors(): void;
    ngOnDestroy(): void;
}
