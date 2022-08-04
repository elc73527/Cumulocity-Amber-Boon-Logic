import { InventoryBinaryService, FetchClient, InventoryService, IManagedObject, IResultList, MeasurementService, IdReference } from '@c8y/client';
import { BehaviorSubject } from 'rxjs';
export declare class Commonc8yService {
    private invSvc;
    private msmtSvc;
    private inventoryBinaryService;
    private fetchClient;
    devices: any[];
    statusResponse: any;
    constructor(invSvc: InventoryService, msmtSvc: MeasurementService, inventoryBinaryService: InventoryBinaryService, fetchClient: FetchClient);
    getTargetObject(deviceId: String): any;
    /**
     * This service will recursively get all the child devices for the given device id and return a promise with the result list.
     *
     * @param id ID of the managed object to check for child devices
     * @param pageToGet Number of the page passed to the API
     * @param allDevices Child Devices already found
     */
    getChildDevices(id: string, pageToGet: number, allDevices: {
        data: any[];
        res: any;
    }): Promise<IResultList<IManagedObject>>;
    generateRegEx(input: any): string;
    getAllDevices(pageToGet: number, searchName?: any): Promise<IResultList<IManagedObject>>;
    /**
     * This service will recursively get all the child devices for the given device id.
     *
     * @param id ID of the managed object to check for child additions
     * @param pageToGet Number of the page passed to the API
     * @param allAdditions Child additions already found... the newly found additions will be aded here
     * @param type Type of addition to return... the service does not use the "fragmentType"
     */
    getChildAdditions(id: string, pageToGet: number, allAdditions: {
        data: any[];
        res: any;
    }, type: string): Promise<IResultList<IManagedObject>>;
    /**
     * Get Inventory list based on type
     */
    getInventoryItems(pageToGet: number, allInventoryItems: {
        data: any[];
        res: any;
    }, type: string): Promise<IResultList<IManagedObject>>;
    getSpecificFragmentDevices(pageToGet: number, searchName?: any): Promise<IResultList<IManagedObject>>;
    /**
     * Creates the given object using the InventoryService.
     *
     * @param managedObject Object to be created
     * @returns Promise object with the result of the service call
     */
    createManagedObject(managedObject: Partial<IManagedObject>): Promise<any>;
    updateManagedObject(managedObject: Partial<IManagedObject>): Promise<any>;
    deleteManagedObject(id: IdReference): Promise<any>;
    /**
     *
     * @param input Validate JSON Input
     */
    isValidJson(input: any): any;
    /**
     * This method used in configuration of this widget to populate available measurements for given device id or group id
     */
    getFragmentSeries(aDevice: any, fragementList: any, observableFragment$: BehaviorSubject<any>): void;
    private getFragementList;
    private getSupportedSeriesForDevice;
    private getSupportedMeasurementsForDevice;
    getLastMeasurementForSource(sourceId: string, dateFrom: string, dateTo: string, type: string, series: string): Promise<IResultList<IManagedObject>>;
    getMeasurementForSource(sourceId: string, dateFrom: string, dateTo: string, type: string): Promise<IResultList<IManagedObject>>;
}
