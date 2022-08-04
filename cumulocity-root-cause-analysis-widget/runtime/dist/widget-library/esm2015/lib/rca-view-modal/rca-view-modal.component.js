import { __awaiter } from "tslib";
import { Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DataGridComponent, } from '@c8y/ngx-components';
import { BehaviorSubject } from 'rxjs';
import { Commonc8yService } from '../Commonc8yservice.service';
export class RCAViewModalComponent {
    constructor(cmonSvc, bsModalRef, bsModalService) {
        this.cmonSvc = cmonSvc;
        this.bsModalRef = bsModalRef;
        this.bsModalService = bsModalService;
        this.barChartType = '';
        this.barChartColors = [];
        this.colorsArr = [];
        this.barChartOptions = {
            scaleShowVerticalLines: false,
            responsive: true,
            legend: {
                title: {
                    display: true,
                    text: 'RCA',
                },
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
        this.measurementList = [];
        this.observableMeasurements$ = new BehaviorSubject(this.measurementList);
    }
    ngOnInit() {
        return __awaiter(this, void 0, void 0, function* () {
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
                        ticks: {
                            beginAtZero: true,
                            stepSize: 0.2,
                        },
                    },
                ],
            };
            this.createchart();
        });
    }
    createchart() {
        return __awaiter(this, void 0, void 0, function* () {
            let k;
            const dataValues = [];
            const labels = [];
            const dataResult = {};
            this.barChartLabels = [];
            this.barChartData = [];
            this.rcaDataset.forEach((iteam) => {
                labels.push(iteam.key);
                dataValues.push(iteam.value);
            });
            console.log('dataValues ', dataValues);
            let dlabels = labels.map((l) => l.split('-'));
            let vlabels = [];
            dlabels.forEach((label) => {
                vlabels.push(label[1]);
            });
            if (dataValues.length > 0) {
                this.barChartLabels = vlabels;
                this.barChartData = [{ data: dataValues, label: 'Amber Route Cause' }];
                this.barChartType = 'bar';
                this.dataLoaded = Promise.resolve(true);
            }
            this.setChartColors();
            console.log('barChartData', this.barChartData);
        });
    }
    setChartColors() {
        let borderColor = [];
        if (this.configcolor !== undefined) {
            this.colorsArr = this.configcolor.split(';');
            if (this.configborderColor === undefined || this.configborderColor === '') {
                borderColor = [];
            }
            else {
                borderColor = this.configborderColor.split(';');
            }
            if (this.configcolor === '') {
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
    onCancelClicked() {
        this.bsModalRef.hide();
    }
}
RCAViewModalComponent.decorators = [
    { type: Component, args: [{
                selector: 'rca-view-modal',
                template: "<div class=\"modal-header text-center bg-primary\">\n  <div ng-transclude=\"header\">\n    <header class=\"text-white\">\n      <h4 class=\"text-uppercase m-0\" style=\"letter-spacing: 0.15em\" translate=\"\">RCA</h4>\n    </header>\n  </div>\n</div>\n<div class=\"modal-body\">\n  <div *ngIf=\"dataLoaded | async\">\n    <div style=\"display: block\">\n      <canvas\n        baseChart\n        [datasets]=\"barChartData\"\n        [labels]=\"barChartLabels\"\n        [colors]=\"barChartColors\"\n        [options]=\"barChartOptions\"\n        [chartType]=\"barChartType\"\n      >\n      </canvas>\n    </div>\n  </div>\n</div>\n<div class=\"modal-footer\">\n  <button type=\"button\" class=\"btn btn-default\" (click)=\"onCancelClicked()\">Cancel</button>\n</div>\n",
                encapsulation: ViewEncapsulation.None,
                styles: ["eaas-select-plan-modal c8y-data-grid th.cdk-header-cell.cdk-column-checkbox label.c8y-checkbox span{display:none!important}eaas-select-plan-modal c8y-data-grid table.large-padding{padding:0!important}eaas-select-plan-modal .modal-body{padding:0}"]
            },] }
];
RCAViewModalComponent.ctorParameters = () => [
    { type: Commonc8yService },
    { type: BsModalRef },
    { type: BsModalService }
];
RCAViewModalComponent.propDecorators = {
    device: [{ type: ViewChild, args: [DataGridComponent, { static: true },] }, { type: Input }],
    label: [{ type: Input }],
    value: [{ type: Input }],
    rcaDataset: [{ type: Input }],
    configcolor: [{ type: Input }],
    configborderColor: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmNhLXZpZXctbW9kYWwuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvZ3AtbGliLXJjYS9zcmMvbGliL3JjYS12aWV3LW1vZGFsL3JjYS12aWV3LW1vZGFsLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQXFCLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNsRyxPQUFPLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2pFLE9BQU8sRUFLTCxpQkFBaUIsR0FNbEIsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QixPQUFPLEVBQUUsZUFBZSxFQUFXLE1BQU0sTUFBTSxDQUFDO0FBQ2hELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBUy9ELE1BQU0sT0FBTyxxQkFBcUI7SUF5Q2hDLFlBQ1UsT0FBeUIsRUFDekIsVUFBc0IsRUFDdEIsY0FBOEI7UUFGOUIsWUFBTyxHQUFQLE9BQU8sQ0FBa0I7UUFDekIsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUN0QixtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7UUFsQ2pDLGlCQUFZLEdBQUcsRUFBRSxDQUFDO1FBR2xCLG1CQUFjLEdBQUcsRUFBRSxDQUFDO1FBQzNCLGNBQVMsR0FBRyxFQUFFLENBQUM7UUFHUixvQkFBZSxHQUFHO1lBQ3ZCLHNCQUFzQixFQUFFLEtBQUs7WUFDN0IsVUFBVSxFQUFFLElBQUk7WUFDaEIsTUFBTSxFQUFFO2dCQUNOLEtBQUssRUFBRTtvQkFDTCxPQUFPLEVBQUUsSUFBSTtvQkFDYixJQUFJLEVBQUUsS0FBSztpQkFDWjtnQkFDRCxRQUFRLEVBQUUsS0FBSztnQkFDZixPQUFPLEVBQUUsSUFBSTthQUNkO1lBQ0QsTUFBTSxFQUFFLEVBQUU7WUFDVixRQUFRLEVBQUU7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SCxDQUFDO0lBRU0sZUFBZTtRQUNwQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3pCLENBQUM7OztZQWhKRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGdCQUFnQjtnQkFDMUIsNndCQUE0QztnQkFFNUMsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7O2FBQ3RDOzs7WUFSUSxnQkFBZ0I7WUFkaEIsVUFBVTtZQUFFLGNBQWM7OztxQkF3QmhDLFNBQVMsU0FBQyxpQkFBaUIsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsY0FDN0MsS0FBSztvQkFFTCxLQUFLO29CQUNMLEtBQUs7eUJBQ0wsS0FBSzswQkFDTCxLQUFLO2dDQUNMLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBpc0Rldk1vZGUsIE9uSW5pdCwgVmlld0NoaWxkLCBWaWV3RW5jYXBzdWxhdGlvbiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQnNNb2RhbFJlZiwgQnNNb2RhbFNlcnZpY2UgfSBmcm9tICduZ3gtYm9vdHN0cmFwL21vZGFsJztcbmltcG9ydCB7XG4gIEFjdGlvbkNvbnRyb2wsXG4gIENvbHVtbixcbiAgQ29sdW1uRGF0YVR5cGUsXG4gIENvbmZpcm1Nb2RhbENvbXBvbmVudCxcbiAgRGF0YUdyaWRDb21wb25lbnQsXG4gIGdldHRleHQsXG4gIE1vZGFsTGFiZWxzLFxuICBQYWdpbmF0aW9uLFxuICBTdGF0dXMsXG4gIFN0YXR1c1R5cGUsXG59IGZyb20gJ0BjOHkvbmd4LWNvbXBvbmVudHMnO1xuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBDb21tb25jOHlTZXJ2aWNlIH0gZnJvbSAnLi4vQ29tbW9uYzh5c2VydmljZS5zZXJ2aWNlJztcbmltcG9ydCB7IGRlYm91bmNlVGltZSwgZGlzdGluY3RVbnRpbENoYW5nZWQsIHRhcCwgc3dpdGNoTWFwLCBmaW5hbGl6ZSwgc2tpcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAncmNhLXZpZXctbW9kYWwnLFxuICB0ZW1wbGF0ZVVybDogJ3JjYS12aWV3LW1vZGFsLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vc3R5bGVzLmxlc3MnXSxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbn0pXG5leHBvcnQgY2xhc3MgUkNBVmlld01vZGFsQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgQFZpZXdDaGlsZChEYXRhR3JpZENvbXBvbmVudCwgeyBzdGF0aWM6IHRydWUgfSlcbiAgQElucHV0KClcbiAgZGV2aWNlITogYW55O1xuICBASW5wdXQoKSBsYWJlbCE6IGFueTtcbiAgQElucHV0KCkgdmFsdWUhOiBhbnk7XG4gIEBJbnB1dCgpIHJjYURhdGFzZXQhOiBhbnk7XG4gIEBJbnB1dCgpIGNvbmZpZ2NvbG9yITogYW55O1xuICBASW5wdXQoKSBjb25maWdib3JkZXJDb2xvciE6IGFueTtcblxuICBwdWJsaWMgYmFyQ2hhcnRUeXBlID0gJyc7XG4gIHB1YmxpYyBiYXJDaGFydERhdGE6IGFueTtcbiAgcHVibGljIGJhckNoYXJ0TGFiZWxzOiBhbnk7XG4gIHB1YmxpYyBiYXJDaGFydENvbG9ycyA9IFtdO1xuICBjb2xvcnNBcnIgPSBbXTtcbiAgZGF0YUxvYWRlZDogUHJvbWlzZTxib29sZWFuPiB8IHVuZGVmaW5lZDtcbiAgYnNNb2RhbFJlZk9wdGlvbiE6IEJzTW9kYWxSZWY7XG4gIHB1YmxpYyBiYXJDaGFydE9wdGlvbnMgPSB7XG4gICAgc2NhbGVTaG93VmVydGljYWxMaW5lczogZmFsc2UsXG4gICAgcmVzcG9uc2l2ZTogdHJ1ZSxcbiAgICBsZWdlbmQ6IHtcbiAgICAgIHRpdGxlOiB7XG4gICAgICAgIGRpc3BsYXk6IHRydWUsXG4gICAgICAgIHRleHQ6ICdSQ0EnLFxuICAgICAgfSxcbiAgICAgIHBvc2l0aW9uOiAndG9wJyxcbiAgICAgIGRpc3BsYXk6IHRydWUsXG4gICAgfSxcbiAgICBzY2FsZXM6IHt9LFxuICAgIGVsZW1lbnRzOiB7XG4gICAgICBsaW5lOiB7XG4gICAgICAgIGZpbGw6IGZhbHNlLFxuICAgICAgfSxcbiAgICB9LFxuICB9O1xuICBtZWFzdXJlbWVudExpc3QgPSBbXTtcbiAgb2JzZXJ2YWJsZU1lYXN1cmVtZW50cyQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PGFueT4odGhpcy5tZWFzdXJlbWVudExpc3QpO1xuICBtZWFzdXJlbWVudFR5cGU6IGFueTtcbiAgbWVhc3VyZW1lbnRUeXBlTGlzdDogYW55O1xuICBtZWFzdXJlbWVudFN1YnM6IGFueTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGNtb25TdmM6IENvbW1vbmM4eVNlcnZpY2UsXG4gICAgcHJpdmF0ZSBic01vZGFsUmVmOiBCc01vZGFsUmVmLFxuICAgIHByaXZhdGUgYnNNb2RhbFNlcnZpY2U6IEJzTW9kYWxTZXJ2aWNlXG4gICkge31cblxuICBhc3luYyBuZ09uSW5pdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLmJhckNoYXJ0T3B0aW9uc1snc2NhbGVzJ10gPSB7XG4gICAgICB4QXhlczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGlja3M6IHtcbiAgICAgICAgICAgIGJlZ2luQXRaZXJvOiB0cnVlLFxuICAgICAgICAgICAgZm9udDoge1xuICAgICAgICAgICAgICBzaXplOiA2LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIHlBeGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0aWNrczoge1xuICAgICAgICAgICAgYmVnaW5BdFplcm86IHRydWUsXG4gICAgICAgICAgICBzdGVwU2l6ZTogMC4yLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH07XG4gICAgdGhpcy5jcmVhdGVjaGFydCgpO1xuICB9XG4gIGFzeW5jIGNyZWF0ZWNoYXJ0KCkge1xuICAgIGxldCBrOiBhbnk7XG4gICAgY29uc3QgZGF0YVZhbHVlczogYW55W10gPSBbXTtcbiAgICBjb25zdCBsYWJlbHM6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgZGF0YVJlc3VsdCA9IHt9O1xuICAgIHRoaXMuYmFyQ2hhcnRMYWJlbHMgPSBbXTtcbiAgICB0aGlzLmJhckNoYXJ0RGF0YSA9IFtdO1xuICAgIHRoaXMucmNhRGF0YXNldC5mb3JFYWNoKChpdGVhbTogYW55KSA9PiB7XG4gICAgICBsYWJlbHMucHVzaChpdGVhbS5rZXkpO1xuICAgICAgZGF0YVZhbHVlcy5wdXNoKGl0ZWFtLnZhbHVlKTtcbiAgICB9KTtcbiAgICBjb25zb2xlLmxvZygnZGF0YVZhbHVlcyAnLCBkYXRhVmFsdWVzKTtcbiAgICBsZXQgZGxhYmVscyA9IGxhYmVscy5tYXAoKGwpID0+IGwuc3BsaXQoJy0nKSk7XG4gICAgbGV0IHZsYWJlbHM6IGFueVtdID0gW107XG4gICAgZGxhYmVscy5mb3JFYWNoKChsYWJlbDogYW55KSA9PiB7XG4gICAgICB2bGFiZWxzLnB1c2gobGFiZWxbMV0pO1xuICAgIH0pO1xuICAgIGlmIChkYXRhVmFsdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuYmFyQ2hhcnRMYWJlbHMgPSB2bGFiZWxzO1xuICAgICAgdGhpcy5iYXJDaGFydERhdGEgPSBbeyBkYXRhOiBkYXRhVmFsdWVzLCBsYWJlbDogJ0FtYmVyIFJvdXRlIENhdXNlJyB9XTtcbiAgICAgIHRoaXMuYmFyQ2hhcnRUeXBlID0gJ2Jhcic7XG4gICAgICB0aGlzLmRhdGFMb2FkZWQgPSBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG4gICAgfVxuICAgIHRoaXMuc2V0Q2hhcnRDb2xvcnMoKTtcbiAgICBjb25zb2xlLmxvZygnYmFyQ2hhcnREYXRhJywgdGhpcy5iYXJDaGFydERhdGEpO1xuICB9XG4gIHNldENoYXJ0Q29sb3JzKCkge1xuICAgIGxldCBib3JkZXJDb2xvciA9IFtdO1xuICAgIGlmICh0aGlzLmNvbmZpZ2NvbG9yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuY29sb3JzQXJyID0gdGhpcy5jb25maWdjb2xvci5zcGxpdCgnOycpO1xuICAgICAgaWYgKHRoaXMuY29uZmlnYm9yZGVyQ29sb3IgPT09IHVuZGVmaW5lZCB8fCB0aGlzLmNvbmZpZ2JvcmRlckNvbG9yID09PSAnJykge1xuICAgICAgICBib3JkZXJDb2xvciA9IFtdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYm9yZGVyQ29sb3IgPSB0aGlzLmNvbmZpZ2JvcmRlckNvbG9yLnNwbGl0KCc7Jyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNvbmZpZ2NvbG9yID09PSAnJykge1xuICAgICAgICB0aGlzLmJhckNoYXJ0Q29sb3JzID0gW107XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuY29sb3JzQXJyLmxlbmd0aCA+PSB0aGlzLmJhckNoYXJ0RGF0YS5sZW5ndGgpIHtcbiAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCB0aGlzLmJhckNoYXJ0RGF0YS5sZW5ndGg7IGsrKykge1xuICAgICAgICAgIHRoaXMuYmFyQ2hhcnRDb2xvcnMucHVzaCh7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHRoaXMuY29sb3JzQXJyW2tdLFxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgYm9yZGVyQ29sb3IsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5iYXJDaGFydERhdGFbMF0uZGF0YS5sZW5ndGggPD0gdGhpcy5jb2xvcnNBcnIubGVuZ3RoKSB7XG4gICAgICAgIGlmIChib3JkZXJDb2xvci5sZW5ndGggPCB0aGlzLmJhckNoYXJ0RGF0YVswXS5kYXRhLmxlbmd0aCkge1xuICAgICAgICAgIGJvcmRlckNvbG9yID0gW107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5iYXJDaGFydENvbG9ycyA9IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHRoaXMuY29sb3JzQXJyLFxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgYm9yZGVyQ29sb3IsXG4gICAgICAgICAgfSxcbiAgICAgICAgXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYmFyQ2hhcnRDb2xvcnMgPSBbXTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5iYXJDaGFydENvbG9ycyA9IFtdO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBvbkNhbmNlbENsaWNrZWQoKSB7XG4gICAgdGhpcy5ic01vZGFsUmVmLmhpZGUoKTtcbiAgfVxufVxuIl19