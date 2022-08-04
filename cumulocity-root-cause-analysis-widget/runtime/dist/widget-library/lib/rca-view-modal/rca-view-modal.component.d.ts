import { OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject } from 'rxjs';
import { Commonc8yService } from '../Commonc8yservice.service';
export declare class RCAViewModalComponent implements OnInit {
    private cmonSvc;
    private bsModalRef;
    private bsModalService;
    device: any;
    label: any;
    value: any;
    rcaDataset: any;
    configcolor: any;
    configborderColor: any;
    barChartType: string;
    barChartData: any;
    barChartLabels: any;
    barChartColors: any[];
    colorsArr: any[];
    dataLoaded: Promise<boolean> | undefined;
    bsModalRefOption: BsModalRef;
    barChartOptions: {
        scaleShowVerticalLines: boolean;
        responsive: boolean;
        legend: {
            title: {
                display: boolean;
                text: string;
            };
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
    measurementList: any[];
    observableMeasurements$: BehaviorSubject<any>;
    measurementType: any;
    measurementTypeList: any;
    measurementSubs: any;
    constructor(cmonSvc: Commonc8yService, bsModalRef: BsModalRef, bsModalService: BsModalService);
    ngOnInit(): Promise<void>;
    createchart(): Promise<void>;
    setChartColors(): void;
    onCancelClicked(): void;
}
