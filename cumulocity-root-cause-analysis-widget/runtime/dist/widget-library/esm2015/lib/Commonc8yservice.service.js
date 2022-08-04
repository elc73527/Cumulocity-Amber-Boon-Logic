import { __awaiter } from "tslib";
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
import { isDevMode, Injectable } from '@angular/core';
import { InventoryBinaryService, FetchClient, InventoryService, MeasurementService, } from '@c8y/client';
export class Commonc8yService {
    constructor(invSvc, msmtSvc, inventoryBinaryService, fetchClient) {
        this.invSvc = invSvc;
        this.msmtSvc = msmtSvc;
        this.inventoryBinaryService = inventoryBinaryService;
        this.fetchClient = fetchClient;
        this.devices = [];
    }
    getTargetObject(deviceId) {
        if (isDevMode()) {
            console.log('+-+- checking for ', deviceId);
        }
        return new Promise((resolve, reject) => {
            this.invSvc.detail(deviceId).then((resp) => {
                if (isDevMode()) {
                    console.log('+-+- DETAILS FOR MANAGED OBJECT ' + deviceId, resp);
                }
                if (resp.res.status === 200) {
                    resolve(resp.data);
                }
                else {
                    reject(resp);
                }
            });
        });
    }
    /**
     * This service will recursively get all the child devices for the given device id and return a promise with the result list.
     *
     * @param id ID of the managed object to check for child devices
     * @param pageToGet Number of the page passed to the API
     * @param allDevices Child Devices already found
     */
    getChildDevices(id, pageToGet, allDevices) {
        const inventoryFilter = {
            // fragmentType: 'c8y_IsDevice',
            pageSize: 50,
            withTotalPages: true,
            currentPage: pageToGet,
        };
        if (!allDevices) {
            allDevices = { data: [], res: null };
        }
        return new Promise((resolve, reject) => {
            this.invSvc.childAssetsList(id, inventoryFilter).then((resp) => {
                if (resp.res.status === 200) {
                    if (resp.data && resp.data.length >= 0) {
                        allDevices.data.push.apply(allDevices.data, resp.data);
                        if (isDevMode()) {
                            console.log('+-+- checking on devices found\n', resp);
                        }
                        // response does not have totalPages... :(
                        // suppose that if # of devices is less that the page size, then all devices have already been retrieved
                        if (resp.data.length < inventoryFilter.pageSize) {
                            resolve(allDevices);
                        }
                        else {
                            this.getChildDevices(id, resp.paging.nextPage, allDevices)
                                .then((np) => {
                                resolve(allDevices);
                            })
                                .catch((err) => reject(err));
                        }
                    }
                }
                else {
                    reject(resp);
                }
            });
        });
    }
    // Regular expression for validation
    generateRegEx(input) {
        const name = input + '';
        const nameLower = name.toLowerCase();
        const nameUpper = name.toUpperCase();
        let regex = '*';
        const numRegex = new RegExp(/^([0-9]+)$/);
        const splCharRegex = new RegExp(/^([,._-]+)$/);
        for (let i = 0; i < name.length; i++) {
            if (name.charAt(i) === ' ') {
                regex += ' ';
            }
            else if (name.charAt(i).match(numRegex)) {
                regex += '[' + name.charAt(i) + ']';
            }
            else if (name.charAt(i).match(splCharRegex)) {
                regex += '[' + name.charAt(i) + ']';
            }
            else {
                regex += '[' + nameLower.charAt(i) + '|' + nameUpper.charAt(i) + ']';
            }
        }
        regex += '*';
        return regex;
    }
    // Get All devices based on query search parameter
    getAllDevices(pageToGet, searchName) {
        let inventoryFilter = {};
        inventoryFilter = {
            pageSize: 10,
            withTotalPages: true,
            currentPage: pageToGet,
        };
        if (searchName) {
            inventoryFilter['query'] = `$filter=(has(c8y_IsDevice) and (name eq '${this.generateRegEx(searchName)}'))`;
        }
        else {
            inventoryFilter['query'] = `$filter=(has(c8y_IsDevice))`;
        }
        return new Promise((resolve, reject) => {
            this.invSvc.list(inventoryFilter).then((resp) => {
                if (resp.res.status === 200) {
                    resolve(resp);
                }
                else {
                    reject(resp);
                }
            });
        });
    }
    /**
     * This service will recursively get all the child devices for the given device id.
     *
     * @param id ID of the managed object to check for child additions
     * @param pageToGet Number of the page passed to the API
     * @param allAdditions Child additions already found... the newly found additions will be aded here
     * @param type Type of addition to return... the service does not use the "fragmentType"
     */
    getChildAdditions(id, pageToGet, allAdditions, type) {
        const inventoryFilter = {
            // fragmentType: type,
            // valueFragmentType: type,
            // type: type,
            pageSize: 15,
            withTotalPages: true,
            currentPage: pageToGet,
        };
        if (!allAdditions) {
            allAdditions = { data: [], res: null };
        }
        return new Promise((resolve, reject) => {
            this.invSvc.childAdditionsList(id, inventoryFilter).then((resp) => {
                if (resp.res.status === 200) {
                    if (resp.data && resp.data.length >= 0) {
                        allAdditions.data.push.apply(allAdditions.data, resp.data);
                        if (isDevMode()) {
                            console.log('+-+- checking on additions found\n', resp);
                        }
                        // response does not have totalPages... :(
                        // suppose that if # of devices is less that the page size, then all devices have already been retrieved
                        if (resp.data.length < inventoryFilter.pageSize) {
                            allAdditions.data = allAdditions.data.filter((d) => {
                                return d.type && d.type.localeCompare(type) === 0;
                            });
                            resolve(allAdditions);
                        }
                        else {
                            this.getChildAdditions(id, resp.paging.nextPage, allAdditions, type)
                                .then((np) => {
                                resolve(allAdditions);
                            })
                                .catch((err) => reject(err));
                        }
                    }
                }
                else {
                    reject(resp);
                }
            });
        });
    }
    /**
     * Get Inventory list based on type
     */
    getInventoryItems(pageToGet, allInventoryItems, type) {
        let inventoryFilter;
        inventoryFilter = {
            pageSize: 50,
            withTotalPages: true,
            currentPage: pageToGet,
            query: `type eq ${type}`,
        };
        if (!allInventoryItems) {
            allInventoryItems = { data: [], res: null };
        }
        return new Promise((resolve, reject) => {
            this.invSvc.list(inventoryFilter).then((resp) => {
                if (resp.res.status === 200) {
                    if (resp.data && resp.data.length >= 0) {
                        allInventoryItems.data.push.apply(allInventoryItems.data, resp.data);
                        if (isDevMode()) {
                            console.log('+-+- checking on inventory items found\n', resp);
                        }
                        // response does not have totalPages... :(
                        // suppose that if # of devices is less that the page size, then all devices have already been retrieved
                        if (resp.data.length < inventoryFilter.pageSize) {
                            // remove the additions that does not fit into the given type, if any
                            resolve(allInventoryItems);
                        }
                        else {
                            this.getInventoryItems(resp.paging.nextPage, allInventoryItems, type)
                                .then((np) => {
                                resolve(allInventoryItems);
                            })
                                .catch((err) => reject(err));
                        }
                    }
                }
                else {
                    reject(resp);
                }
            });
        });
    }
    getSpecificFragmentDevices(pageToGet, searchName) {
        let inventoryFilter = {};
        inventoryFilter = {
            pageSize: 10,
            withTotalPages: true,
            currentPage: pageToGet,
        };
        if (searchName) {
            inventoryFilter['query'] = `$filter=(has(c8y_IsDevice) and (has(c8y_AmberSensorConfiguration)) and (name eq '${this.generateRegEx(searchName)}'))`;
        }
        else {
            inventoryFilter['query'] = `$filter=(has(c8y_IsDevice)) and (has(c8y_AmberSensorConfiguration)) `;
        }
        return new Promise((resolve, reject) => {
            this.invSvc.list(inventoryFilter).then((resp) => {
                if (resp.res.status === 200) {
                    resolve(resp);
                }
                else {
                    reject(resp);
                }
            });
        });
    }
    /**
     * Creates the given object using the InventoryService.
     *
     * @param managedObject Object to be created
     * @returns Promise object with the result of the service call
     */
    createManagedObject(managedObject) {
        if (isDevMode()) {
            console.log('+-+- CREATING MANAGED OBJECT ');
        }
        return this.invSvc.create(managedObject);
        /* return new Promise(
                 (resolve, reject) => {
                     this.invSvc.create(managedObject)
                         .then((resp) => {
                             if (isDevMode()) { console.log('+-+- DETAILS FOR MANAGED OBJECT CREATION', resp); }
                             // successful return code is 201 Created
                             if (resp.res.status === 201) {
                                 resolve(resp.data);
                             } else {
                                 reject(resp);
                             }
                         });
                 }); */
    }
    updateManagedObject(managedObject) {
        if (isDevMode()) {
            console.log('+-+- CREATING MANAGED OBJECT ');
        }
        return this.invSvc.update(managedObject);
    }
    deleteManagedObject(id) {
        return this.invSvc.delete(id);
    }
    /**
     *
     * @param input Validate JSON Input
     */
    isValidJson(input) {
        try {
            if (input) {
                const o = JSON.parse(input);
                if (o && o.constructor === Object) {
                    return o;
                }
            }
        }
        catch (e) { }
        return false;
    }
    /**
     * This method used in configuration of this widget to populate available measurements for given device id or group id
     */
    getFragmentSeries(aDevice, fragementList, observableFragment$) {
        let deviceList = null;
        if (aDevice) {
            // get all child assets for the target object, defined in the configuration
            this.getTargetObject(aDevice.id)
                .then((mo) => __awaiter(this, void 0, void 0, function* () {
                if (mo &&
                    mo.type &&
                    (mo.type.localeCompare('c8y_DeviceGroup') === 0 ||
                        mo.type.localeCompare('c8y_DeviceSubgroup') === 0)) {
                    // GET child devices
                    this.getChildDevices(aDevice.id, 1, deviceList)
                        .then((deviceFound) => __awaiter(this, void 0, void 0, function* () {
                        deviceList = deviceFound.data;
                        const uniqueDeviceList = deviceList
                            .filter((device, index, self) => index === self.findIndex((t) => t.type === device.type))
                            .map((device) => device.id);
                        for (const device of uniqueDeviceList) {
                            if (isDevMode()) {
                                console.log('+-+- CHECKING Series FOR: ', device);
                            }
                            const supportedMeasurements = yield this.getSupportedMeasurementsForDevice(device);
                            if (isDevMode()) {
                                console.log('+-+- supportedMeasurements FOR... ' + device, supportedMeasurements);
                            }
                            const fragmentSeries = yield this.getSupportedSeriesForDevice(device);
                            if (isDevMode()) {
                                console.log('+-+- FragmentSeries FOR... ' + device, fragmentSeries);
                            }
                            if (fragmentSeries &&
                                fragmentSeries.c8y_SupportedSeries &&
                                supportedMeasurements &&
                                supportedMeasurements.c8y_SupportedMeasurements) {
                                fragementList = this.getFragementList(fragementList, fragmentSeries.c8y_SupportedSeries, supportedMeasurements.c8y_SupportedMeasurements);
                            }
                        }
                        observableFragment$.next(fragementList);
                    }))
                        .catch((err) => {
                        if (isDevMode()) {
                            console.log('+-+- ERROR FOUND WHILE GETTING CHILD DEVICES... ', err);
                        }
                    });
                }
                else {
                    if (isDevMode()) {
                        console.log('+-+- CHECKING MEASUREMENTS FOR: ', aDevice.id);
                    }
                    const supportedMeasurements = yield this.getSupportedMeasurementsForDevice(aDevice.id);
                    if (isDevMode()) {
                        console.log('+-+- supportedMeasurements FOR... ' + aDevice.id, supportedMeasurements);
                    }
                    const fragmentSeries = yield this.getSupportedSeriesForDevice(aDevice.id);
                    if (isDevMode()) {
                        console.log('+-+- FragmentSeries FOR... ' + aDevice.id, fragmentSeries);
                    }
                    if (fragmentSeries &&
                        fragmentSeries.c8y_SupportedSeries &&
                        supportedMeasurements &&
                        supportedMeasurements.c8y_SupportedMeasurements) {
                        fragementList = this.getFragementList(fragementList, fragmentSeries.c8y_SupportedSeries, supportedMeasurements.c8y_SupportedMeasurements);
                    }
                    observableFragment$.next(fragementList);
                }
            }))
                .catch((err) => {
                if (isDevMode()) {
                    console.log('+-+- ERROR while getting Device details ', err);
                }
            });
        }
    }
    // This method populate measurementList/fragementList based on series and measurements
    getFragementList(fragementList, fragmentSeries, supportedMeasurements) {
        if (fragementList) {
            fragmentSeries.forEach((fs) => {
                const measurementType = supportedMeasurements.filter((smFilter) => fs.indexOf(smFilter) !== -1);
                if (measurementType && measurementType.length > 0) {
                    const fsName = fs.replace(measurementType[0] + '.', '');
                    const fsType = measurementType[0];
                    const existingF = fragementList.find((sm) => sm.type === fsType && sm.name === fsName);
                    if (!existingF || existingF == null) {
                        fragementList.push({
                            name: fsName,
                            type: fsType,
                            description: fs,
                        });
                    }
                }
            });
        }
        else {
            fragmentSeries.forEach((fs) => {
                const measurementType = supportedMeasurements.filter((smFilter) => fs.indexOf(smFilter) !== -1);
                if (measurementType && measurementType.length > 0) {
                    const fsName = fs.replace(measurementType[0] + '.', '');
                    const fsType = measurementType[0];
                    fragementList.push({
                        name: fsName,
                        type: fsType,
                        description: fs,
                    });
                }
            });
        }
        return fragementList;
    }
    // Get Supported Series for given device id/
    getSupportedSeriesForDevice(deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            };
            return yield (yield this.fetchClient.fetch(`/inventory/managedObjects/${deviceId}/supportedSeries`, options)).json();
        });
    }
    // Get Supported Measurements for given device Id
    getSupportedMeasurementsForDevice(deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            };
            return yield (yield this.fetchClient.fetch(`/inventory/managedObjects/${deviceId}/supportedMeasurements`, options)).json();
        });
    }
    // tslint:disable-next-line:max-line-length
    getLastMeasurementForSource(sourceId, dateFrom, dateTo, type, series) {
        const msmtFilter = {
            pageSize: 20,
            valueFragmentSeries: series,
            valueFragmentType: type,
            dateFrom,
            dateTo,
            revert: true,
            source: sourceId,
        };
        return new Promise((resolve) => {
            this.msmtSvc.list(msmtFilter).then((resp) => {
                resolve(resp);
            });
        });
    }
    getMeasurementForSource(sourceId, dateFrom, dateTo, type) {
        const msmtFilter = {
            pageSize: 10,
            valueFragmentType: type,
            dateFrom,
            dateTo,
            revert: true,
            source: sourceId,
        };
        return new Promise((resolve) => {
            this.msmtSvc.list(msmtFilter).then((resp) => {
                resolve(resp);
            });
        });
    }
}
Commonc8yService.decorators = [
    { type: Injectable }
];
Commonc8yService.ctorParameters = () => [
    { type: InventoryService },
    { type: MeasurementService },
    { type: InventoryBinaryService },
    { type: FetchClient }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbW9uYzh5c2VydmljZS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvZ3AtbGliLXJjYS9zcmMvbGliL0NvbW1vbmM4eXNlcnZpY2Uuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7QUFDSCxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN0RCxPQUFPLEVBQ0wsc0JBQXNCLEVBQ3RCLFdBQVcsRUFDWCxnQkFBZ0IsRUFHaEIsa0JBQWtCLEdBR25CLE1BQU0sYUFBYSxDQUFDO0FBS3JCLE1BQU0sT0FBTyxnQkFBZ0I7SUFJM0IsWUFDVSxNQUF3QixFQUN4QixPQUEyQixFQUMzQixzQkFBOEMsRUFDOUMsV0FBd0I7UUFIeEIsV0FBTSxHQUFOLE1BQU0sQ0FBa0I7UUFDeEIsWUFBTyxHQUFQLE9BQU8sQ0FBb0I7UUFDM0IsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QjtRQUM5QyxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQVBsQyxZQUFPLEdBQVUsRUFBRSxDQUFDO0lBUWpCLENBQUM7SUFFSixlQUFlLENBQUMsUUFBZ0I7UUFDOUIsSUFBSSxTQUFTLEVBQUUsRUFBRTtZQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDN0M7UUFDRCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUN6QyxJQUFJLFNBQVMsRUFBRSxFQUFFO29CQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLEdBQUcsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUNsRTtnQkFD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Q0FBQyxDQUFDLElBQVMsRUFBRSxFQUFFO2dCQUMvQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCx1QkFBdUIsQ0FDckIsUUFBZ0IsRUFDaEIsUUFBZ0IsRUFDaEIsTUFBYyxFQUNkLElBQVk7UUFFWixNQUFNLFVBQVUsR0FBRztZQUNqQixRQUFRLEVBQUUsRUFBRTtZQUNaLGlCQUFpQixFQUFFLElBQUk7WUFDdkIsUUFBUTtZQUNSLE1BQU07WUFDTixNQUFNLEVBQUUsSUFBSTtZQUNaLE1BQU0sRUFBRSxRQUFRO1NBRWpCLENBQUM7UUFFRixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDN0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBUyxFQUFFLEVBQUU7Z0JBQy9DLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7O1lBOWdCRixVQUFVOzs7WUFWVCxnQkFBZ0I7WUFHaEIsa0JBQWtCO1lBTGxCLHNCQUFzQjtZQUN0QixXQUFXIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjAgU29mdHdhcmUgQUcsIERhcm1zdGFkdCwgR2VybWFueSBhbmQvb3IgaXRzIGxpY2Vuc29yc1xuICpcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBBcGFjaGUtMi4wXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbmltcG9ydCB7IGlzRGV2TW9kZSwgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgSW52ZW50b3J5QmluYXJ5U2VydmljZSxcbiAgRmV0Y2hDbGllbnQsXG4gIEludmVudG9yeVNlcnZpY2UsXG4gIElNYW5hZ2VkT2JqZWN0LFxuICBJUmVzdWx0TGlzdCxcbiAgTWVhc3VyZW1lbnRTZXJ2aWNlLFxuICBJRmV0Y2hPcHRpb25zLFxuICBJZFJlZmVyZW5jZSxcbn0gZnJvbSAnQGM4eS9jbGllbnQnO1xuaW1wb3J0IHsgZGVib3VuY2VUaW1lLCBkaXN0aW5jdFVudGlsQ2hhbmdlZCwgdGFwLCBzd2l0Y2hNYXAsIGZpbmFsaXplLCBza2lwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBmcm9tLCBPYnNlcnZhYmxlLCBPYnNlcnZlciB9IGZyb20gJ3J4anMnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ29tbW9uYzh5U2VydmljZSB7XG4gIGRldmljZXM6IGFueVtdID0gW107XG4gIHN0YXR1c1Jlc3BvbnNlITogYW55O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgaW52U3ZjOiBJbnZlbnRvcnlTZXJ2aWNlLFxuICAgIHByaXZhdGUgbXNtdFN2YzogTWVhc3VyZW1lbnRTZXJ2aWNlLFxuICAgIHByaXZhdGUgaW52ZW50b3J5QmluYXJ5U2VydmljZTogSW52ZW50b3J5QmluYXJ5U2VydmljZSxcbiAgICBwcml2YXRlIGZldGNoQ2xpZW50OiBGZXRjaENsaWVudFxuICApIHt9XG5cbiAgZ2V0VGFyZ2V0T2JqZWN0KGRldmljZUlkOiBTdHJpbmcpOiBhbnkge1xuICAgIGlmIChpc0Rldk1vZGUoKSkge1xuICAgICAgY29uc29sZS5sb2coJystKy0gY2hlY2tpbmcgZm9yICcsIGRldmljZUlkKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuaW52U3ZjLmRldGFpbChkZXZpY2VJZCkudGhlbigocmVzcCkgPT4ge1xuICAgICAgICBpZiAoaXNEZXZNb2RlKCkpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnKy0rLSBERVRBSUxTIEZPUiBNQU5BR0VEIE9CSkVDVCAnICsgZGV2aWNlSWQsIHJlc3ApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXNwLnJlcy5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgIHJlc29sdmUocmVzcC5kYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWplY3QocmVzcCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgc2VydmljZSB3aWxsIHJlY3Vyc2l2ZWx5IGdldCBhbGwgdGhlIGNoaWxkIGRldmljZXMgZm9yIHRoZSBnaXZlbiBkZXZpY2UgaWQgYW5kIHJldHVybiBhIHByb21pc2Ugd2l0aCB0aGUgcmVzdWx0IGxpc3QuXG4gICAqXG4gICAqIEBwYXJhbSBpZCBJRCBvZiB0aGUgbWFuYWdlZCBvYmplY3QgdG8gY2hlY2sgZm9yIGNoaWxkIGRldmljZXNcbiAgICogQHBhcmFtIHBhZ2VUb0dldCBOdW1iZXIgb2YgdGhlIHBhZ2UgcGFzc2VkIHRvIHRoZSBBUElcbiAgICogQHBhcmFtIGFsbERldmljZXMgQ2hpbGQgRGV2aWNlcyBhbHJlYWR5IGZvdW5kXG4gICAqL1xuICBnZXRDaGlsZERldmljZXMoXG4gICAgaWQ6IHN0cmluZyxcbiAgICBwYWdlVG9HZXQ6IG51bWJlcixcbiAgICBhbGxEZXZpY2VzOiB7IGRhdGE6IGFueVtdOyByZXM6IGFueSB9XG4gICk6IFByb21pc2U8SVJlc3VsdExpc3Q8SU1hbmFnZWRPYmplY3Q+PiB7XG4gICAgY29uc3QgaW52ZW50b3J5RmlsdGVyID0ge1xuICAgICAgLy8gZnJhZ21lbnRUeXBlOiAnYzh5X0lzRGV2aWNlJyxcbiAgICAgIHBhZ2VTaXplOiA1MCxcbiAgICAgIHdpdGhUb3RhbFBhZ2VzOiB0cnVlLFxuICAgICAgY3VycmVudFBhZ2U6IHBhZ2VUb0dldCxcbiAgICB9O1xuICAgIGlmICghYWxsRGV2aWNlcykge1xuICAgICAgYWxsRGV2aWNlcyA9IHsgZGF0YTogW10sIHJlczogbnVsbCB9O1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5pbnZTdmMuY2hpbGRBc3NldHNMaXN0KGlkLCBpbnZlbnRvcnlGaWx0ZXIpLnRoZW4oKHJlc3A6IGFueSkgPT4ge1xuICAgICAgICBpZiAocmVzcC5yZXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICBpZiAocmVzcC5kYXRhICYmIHJlc3AuZGF0YS5sZW5ndGggPj0gMCkge1xuICAgICAgICAgICAgYWxsRGV2aWNlcy5kYXRhLnB1c2guYXBwbHkoYWxsRGV2aWNlcy5kYXRhLCByZXNwLmRhdGEpO1xuICAgICAgICAgICAgaWYgKGlzRGV2TW9kZSgpKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCcrLSstIGNoZWNraW5nIG9uIGRldmljZXMgZm91bmRcXG4nLCByZXNwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHJlc3BvbnNlIGRvZXMgbm90IGhhdmUgdG90YWxQYWdlcy4uLiA6KFxuICAgICAgICAgICAgLy8gc3VwcG9zZSB0aGF0IGlmICMgb2YgZGV2aWNlcyBpcyBsZXNzIHRoYXQgdGhlIHBhZ2Ugc2l6ZSwgdGhlbiBhbGwgZGV2aWNlcyBoYXZlIGFscmVhZHkgYmVlbiByZXRyaWV2ZWRcbiAgICAgICAgICAgIGlmIChyZXNwLmRhdGEubGVuZ3RoIDwgaW52ZW50b3J5RmlsdGVyLnBhZ2VTaXplKSB7XG4gICAgICAgICAgICAgIHJlc29sdmUoYWxsRGV2aWNlcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLmdldENoaWxkRGV2aWNlcyhpZCwgcmVzcC5wYWdpbmcubmV4dFBhZ2UsIGFsbERldmljZXMpXG4gICAgICAgICAgICAgICAgLnRoZW4oKG5wKSA9PiB7XG4gICAgICAgICAgICAgICAgICByZXNvbHZlKGFsbERldmljZXMpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHJlamVjdChlcnIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVqZWN0KHJlc3ApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFJlZ3VsYXIgZXhwcmVzc2lvbiBmb3IgdmFsaWRhdGlvblxuICBnZW5lcmF0ZVJlZ0V4KGlucHV0OiBhbnkpIHtcbiAgICBjb25zdCBuYW1lID0gaW5wdXQgKyAnJztcbiAgICBjb25zdCBuYW1lTG93ZXIgPSBuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgY29uc3QgbmFtZVVwcGVyID0gbmFtZS50b1VwcGVyQ2FzZSgpO1xuICAgIGxldCByZWdleCA9ICcqJztcbiAgICBjb25zdCBudW1SZWdleCA9IG5ldyBSZWdFeHAoL14oWzAtOV0rKSQvKTtcbiAgICBjb25zdCBzcGxDaGFyUmVnZXggPSBuZXcgUmVnRXhwKC9eKFssLl8tXSspJC8pO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmFtZS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKG5hbWUuY2hhckF0KGkpID09PSAnICcpIHtcbiAgICAgICAgcmVnZXggKz0gJyAnO1xuICAgICAgfSBlbHNlIGlmIChuYW1lLmNoYXJBdChpKS5tYXRjaChudW1SZWdleCkpIHtcbiAgICAgICAgcmVnZXggKz0gJ1snICsgbmFtZS5jaGFyQXQoaSkgKyAnXSc7XG4gICAgICB9IGVsc2UgaWYgKG5hbWUuY2hhckF0KGkpLm1hdGNoKHNwbENoYXJSZWdleCkpIHtcbiAgICAgICAgcmVnZXggKz0gJ1snICsgbmFtZS5jaGFyQXQoaSkgKyAnXSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWdleCArPSAnWycgKyBuYW1lTG93ZXIuY2hhckF0KGkpICsgJ3wnICsgbmFtZVVwcGVyLmNoYXJBdChpKSArICddJztcbiAgICAgIH1cbiAgICB9XG4gICAgcmVnZXggKz0gJyonO1xuICAgIHJldHVybiByZWdleDtcbiAgfVxuXG4gIC8vIEdldCBBbGwgZGV2aWNlcyBiYXNlZCBvbiBxdWVyeSBzZWFyY2ggcGFyYW1ldGVyXG5cbiAgZ2V0QWxsRGV2aWNlcyhwYWdlVG9HZXQ6IG51bWJlciwgc2VhcmNoTmFtZT86IGFueSk6IFByb21pc2U8SVJlc3VsdExpc3Q8SU1hbmFnZWRPYmplY3Q+PiB7XG4gICAgbGV0IGludmVudG9yeUZpbHRlcjogYW55ID0ge307XG4gICAgaW52ZW50b3J5RmlsdGVyID0ge1xuICAgICAgcGFnZVNpemU6IDEwLFxuICAgICAgd2l0aFRvdGFsUGFnZXM6IHRydWUsXG4gICAgICBjdXJyZW50UGFnZTogcGFnZVRvR2V0LFxuICAgIH07XG4gICAgaWYgKHNlYXJjaE5hbWUpIHtcbiAgICAgIGludmVudG9yeUZpbHRlclsncXVlcnknXSA9IGAkZmlsdGVyPShoYXMoYzh5X0lzRGV2aWNlKSBhbmQgKG5hbWUgZXEgJyR7dGhpcy5nZW5lcmF0ZVJlZ0V4KFxuICAgICAgICBzZWFyY2hOYW1lXG4gICAgICApfScpKWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGludmVudG9yeUZpbHRlclsncXVlcnknXSA9IGAkZmlsdGVyPShoYXMoYzh5X0lzRGV2aWNlKSlgO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5pbnZTdmMubGlzdChpbnZlbnRvcnlGaWx0ZXIpLnRoZW4oKHJlc3ApID0+IHtcbiAgICAgICAgaWYgKHJlc3AucmVzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgcmVzb2x2ZShyZXNwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWplY3QocmVzcCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgc2VydmljZSB3aWxsIHJlY3Vyc2l2ZWx5IGdldCBhbGwgdGhlIGNoaWxkIGRldmljZXMgZm9yIHRoZSBnaXZlbiBkZXZpY2UgaWQuXG4gICAqXG4gICAqIEBwYXJhbSBpZCBJRCBvZiB0aGUgbWFuYWdlZCBvYmplY3QgdG8gY2hlY2sgZm9yIGNoaWxkIGFkZGl0aW9uc1xuICAgKiBAcGFyYW0gcGFnZVRvR2V0IE51bWJlciBvZiB0aGUgcGFnZSBwYXNzZWQgdG8gdGhlIEFQSVxuICAgKiBAcGFyYW0gYWxsQWRkaXRpb25zIENoaWxkIGFkZGl0aW9ucyBhbHJlYWR5IGZvdW5kLi4uIHRoZSBuZXdseSBmb3VuZCBhZGRpdGlvbnMgd2lsbCBiZSBhZGVkIGhlcmVcbiAgICogQHBhcmFtIHR5cGUgVHlwZSBvZiBhZGRpdGlvbiB0byByZXR1cm4uLi4gdGhlIHNlcnZpY2UgZG9lcyBub3QgdXNlIHRoZSBcImZyYWdtZW50VHlwZVwiXG4gICAqL1xuICBnZXRDaGlsZEFkZGl0aW9ucyhcbiAgICBpZDogc3RyaW5nLFxuICAgIHBhZ2VUb0dldDogbnVtYmVyLFxuICAgIGFsbEFkZGl0aW9uczogeyBkYXRhOiBhbnlbXTsgcmVzOiBhbnkgfSxcbiAgICB0eXBlOiBzdHJpbmdcbiAgKTogUHJvbWlzZTxJUmVzdWx0TGlzdDxJTWFuYWdlZE9iamVjdD4+IHtcbiAgICBjb25zdCBpbnZlbnRvcnlGaWx0ZXIgPSB7XG4gICAgICAvLyBmcmFnbWVudFR5cGU6IHR5cGUsXG4gICAgICAvLyB2YWx1ZUZyYWdtZW50VHlwZTogdHlwZSxcbiAgICAgIC8vIHR5cGU6IHR5cGUsXG4gICAgICBwYWdlU2l6ZTogMTUsXG4gICAgICB3aXRoVG90YWxQYWdlczogdHJ1ZSxcbiAgICAgIGN1cnJlbnRQYWdlOiBwYWdlVG9HZXQsXG4gICAgfTtcbiAgICBpZiAoIWFsbEFkZGl0aW9ucykge1xuICAgICAgYWxsQWRkaXRpb25zID0geyBkYXRhOiBbXSwgcmVzOiBudWxsIH07XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLmludlN2Yy5jaGlsZEFkZGl0aW9uc0xpc3QoaWQsIGludmVudG9yeUZpbHRlcikudGhlbigocmVzcDogYW55KSA9PiB7XG4gICAgICAgIGlmIChyZXNwLnJlcy5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgIGlmIChyZXNwLmRhdGEgJiYgcmVzcC5kYXRhLmxlbmd0aCA+PSAwKSB7XG4gICAgICAgICAgICBhbGxBZGRpdGlvbnMuZGF0YS5wdXNoLmFwcGx5KGFsbEFkZGl0aW9ucy5kYXRhLCByZXNwLmRhdGEpO1xuICAgICAgICAgICAgaWYgKGlzRGV2TW9kZSgpKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCcrLSstIGNoZWNraW5nIG9uIGFkZGl0aW9ucyBmb3VuZFxcbicsIHJlc3ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcmVzcG9uc2UgZG9lcyBub3QgaGF2ZSB0b3RhbFBhZ2VzLi4uIDooXG4gICAgICAgICAgICAvLyBzdXBwb3NlIHRoYXQgaWYgIyBvZiBkZXZpY2VzIGlzIGxlc3MgdGhhdCB0aGUgcGFnZSBzaXplLCB0aGVuIGFsbCBkZXZpY2VzIGhhdmUgYWxyZWFkeSBiZWVuIHJldHJpZXZlZFxuICAgICAgICAgICAgaWYgKHJlc3AuZGF0YS5sZW5ndGggPCBpbnZlbnRvcnlGaWx0ZXIucGFnZVNpemUpIHtcbiAgICAgICAgICAgICAgYWxsQWRkaXRpb25zLmRhdGEgPSBhbGxBZGRpdGlvbnMuZGF0YS5maWx0ZXIoKGQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZC50eXBlICYmIGQudHlwZS5sb2NhbGVDb21wYXJlKHR5cGUpID09PSAwO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmVzb2x2ZShhbGxBZGRpdGlvbnMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5nZXRDaGlsZEFkZGl0aW9ucyhpZCwgcmVzcC5wYWdpbmcubmV4dFBhZ2UsIGFsbEFkZGl0aW9ucywgdHlwZSlcbiAgICAgICAgICAgICAgICAudGhlbigobnApID0+IHtcbiAgICAgICAgICAgICAgICAgIHJlc29sdmUoYWxsQWRkaXRpb25zKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiByZWplY3QoZXJyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlamVjdChyZXNwKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IEludmVudG9yeSBsaXN0IGJhc2VkIG9uIHR5cGVcbiAgICovXG4gIGdldEludmVudG9yeUl0ZW1zKFxuICAgIHBhZ2VUb0dldDogbnVtYmVyLFxuICAgIGFsbEludmVudG9yeUl0ZW1zOiB7IGRhdGE6IGFueVtdOyByZXM6IGFueSB9LFxuICAgIHR5cGU6IHN0cmluZ1xuICApOiBQcm9taXNlPElSZXN1bHRMaXN0PElNYW5hZ2VkT2JqZWN0Pj4ge1xuICAgIGxldCBpbnZlbnRvcnlGaWx0ZXI6IGFueTtcbiAgICBpbnZlbnRvcnlGaWx0ZXIgPSB7XG4gICAgICBwYWdlU2l6ZTogNTAsXG4gICAgICB3aXRoVG90YWxQYWdlczogdHJ1ZSxcbiAgICAgIGN1cnJlbnRQYWdlOiBwYWdlVG9HZXQsXG4gICAgICBxdWVyeTogYHR5cGUgZXEgJHt0eXBlfWAsXG4gICAgfTtcbiAgICBpZiAoIWFsbEludmVudG9yeUl0ZW1zKSB7XG4gICAgICBhbGxJbnZlbnRvcnlJdGVtcyA9IHsgZGF0YTogW10sIHJlczogbnVsbCB9O1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5pbnZTdmMubGlzdChpbnZlbnRvcnlGaWx0ZXIpLnRoZW4oKHJlc3A6IGFueSkgPT4ge1xuICAgICAgICBpZiAocmVzcC5yZXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICBpZiAocmVzcC5kYXRhICYmIHJlc3AuZGF0YS5sZW5ndGggPj0gMCkge1xuICAgICAgICAgICAgYWxsSW52ZW50b3J5SXRlbXMuZGF0YS5wdXNoLmFwcGx5KGFsbEludmVudG9yeUl0ZW1zLmRhdGEsIHJlc3AuZGF0YSk7XG4gICAgICAgICAgICBpZiAoaXNEZXZNb2RlKCkpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJystKy0gY2hlY2tpbmcgb24gaW52ZW50b3J5IGl0ZW1zIGZvdW5kXFxuJywgcmVzcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyByZXNwb25zZSBkb2VzIG5vdCBoYXZlIHRvdGFsUGFnZXMuLi4gOihcbiAgICAgICAgICAgIC8vIHN1cHBvc2UgdGhhdCBpZiAjIG9mIGRldmljZXMgaXMgbGVzcyB0aGF0IHRoZSBwYWdlIHNpemUsIHRoZW4gYWxsIGRldmljZXMgaGF2ZSBhbHJlYWR5IGJlZW4gcmV0cmlldmVkXG4gICAgICAgICAgICBpZiAocmVzcC5kYXRhLmxlbmd0aCA8IGludmVudG9yeUZpbHRlci5wYWdlU2l6ZSkge1xuICAgICAgICAgICAgICAvLyByZW1vdmUgdGhlIGFkZGl0aW9ucyB0aGF0IGRvZXMgbm90IGZpdCBpbnRvIHRoZSBnaXZlbiB0eXBlLCBpZiBhbnlcbiAgICAgICAgICAgICAgcmVzb2x2ZShhbGxJbnZlbnRvcnlJdGVtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLmdldEludmVudG9yeUl0ZW1zKHJlc3AucGFnaW5nLm5leHRQYWdlLCBhbGxJbnZlbnRvcnlJdGVtcywgdHlwZSlcbiAgICAgICAgICAgICAgICAudGhlbigobnApID0+IHtcbiAgICAgICAgICAgICAgICAgIHJlc29sdmUoYWxsSW52ZW50b3J5SXRlbXMpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHJlamVjdChlcnIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVqZWN0KHJlc3ApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldFNwZWNpZmljRnJhZ21lbnREZXZpY2VzKFxuICAgIHBhZ2VUb0dldDogbnVtYmVyLFxuICAgIHNlYXJjaE5hbWU/OiBhbnlcbiAgKTogUHJvbWlzZTxJUmVzdWx0TGlzdDxJTWFuYWdlZE9iamVjdD4+IHtcbiAgICBsZXQgaW52ZW50b3J5RmlsdGVyOiBhbnkgPSB7fTtcbiAgICBpbnZlbnRvcnlGaWx0ZXIgPSB7XG4gICAgICBwYWdlU2l6ZTogMTAsXG4gICAgICB3aXRoVG90YWxQYWdlczogdHJ1ZSxcbiAgICAgIGN1cnJlbnRQYWdlOiBwYWdlVG9HZXQsXG4gICAgfTtcbiAgICBpZiAoc2VhcmNoTmFtZSkge1xuICAgICAgaW52ZW50b3J5RmlsdGVyW1xuICAgICAgICAncXVlcnknXG4gICAgICBdID0gYCRmaWx0ZXI9KGhhcyhjOHlfSXNEZXZpY2UpIGFuZCAoaGFzKGM4eV9BbWJlclNlbnNvckNvbmZpZ3VyYXRpb24pKSBhbmQgKG5hbWUgZXEgJyR7dGhpcy5nZW5lcmF0ZVJlZ0V4KFxuICAgICAgICBzZWFyY2hOYW1lXG4gICAgICApfScpKWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGludmVudG9yeUZpbHRlcltcbiAgICAgICAgJ3F1ZXJ5J1xuICAgICAgXSA9IGAkZmlsdGVyPShoYXMoYzh5X0lzRGV2aWNlKSkgYW5kIChoYXMoYzh5X0FtYmVyU2Vuc29yQ29uZmlndXJhdGlvbikpIGA7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLmludlN2Yy5saXN0KGludmVudG9yeUZpbHRlcikudGhlbigocmVzcCkgPT4ge1xuICAgICAgICBpZiAocmVzcC5yZXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICByZXNvbHZlKHJlc3ApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlamVjdChyZXNwKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyB0aGUgZ2l2ZW4gb2JqZWN0IHVzaW5nIHRoZSBJbnZlbnRvcnlTZXJ2aWNlLlxuICAgKlxuICAgKiBAcGFyYW0gbWFuYWdlZE9iamVjdCBPYmplY3QgdG8gYmUgY3JlYXRlZFxuICAgKiBAcmV0dXJucyBQcm9taXNlIG9iamVjdCB3aXRoIHRoZSByZXN1bHQgb2YgdGhlIHNlcnZpY2UgY2FsbFxuICAgKi9cbiAgY3JlYXRlTWFuYWdlZE9iamVjdChtYW5hZ2VkT2JqZWN0OiBQYXJ0aWFsPElNYW5hZ2VkT2JqZWN0Pik6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKGlzRGV2TW9kZSgpKSB7XG4gICAgICBjb25zb2xlLmxvZygnKy0rLSBDUkVBVElORyBNQU5BR0VEIE9CSkVDVCAnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5pbnZTdmMuY3JlYXRlKG1hbmFnZWRPYmplY3QpO1xuICAgIC8qIHJldHVybiBuZXcgUHJvbWlzZShcbiAgICAgICAgICAgICAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgIHRoaXMuaW52U3ZjLmNyZWF0ZShtYW5hZ2VkT2JqZWN0KVxuICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3ApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNEZXZNb2RlKCkpIHsgY29uc29sZS5sb2coJystKy0gREVUQUlMUyBGT1IgTUFOQUdFRCBPQkpFQ1QgQ1JFQVRJT04nLCByZXNwKTsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHN1Y2Nlc3NmdWwgcmV0dXJuIGNvZGUgaXMgMjAxIENyZWF0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcC5yZXMuc3RhdHVzID09PSAyMDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXNwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICB9KTsgKi9cbiAgfVxuXG4gIHVwZGF0ZU1hbmFnZWRPYmplY3QobWFuYWdlZE9iamVjdDogUGFydGlhbDxJTWFuYWdlZE9iamVjdD4pOiBQcm9taXNlPGFueT4ge1xuICAgIGlmIChpc0Rldk1vZGUoKSkge1xuICAgICAgY29uc29sZS5sb2coJystKy0gQ1JFQVRJTkcgTUFOQUdFRCBPQkpFQ1QgJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuaW52U3ZjLnVwZGF0ZShtYW5hZ2VkT2JqZWN0KTtcbiAgfVxuXG4gIGRlbGV0ZU1hbmFnZWRPYmplY3QoaWQ6IElkUmVmZXJlbmNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5pbnZTdmMuZGVsZXRlKGlkKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0gaW5wdXQgVmFsaWRhdGUgSlNPTiBJbnB1dFxuICAgKi9cbiAgaXNWYWxpZEpzb24oaW5wdXQ6IGFueSkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgbyA9IEpTT04ucGFyc2UoaW5wdXQpO1xuICAgICAgICBpZiAobyAmJiBvLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgICByZXR1cm4gbztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIHVzZWQgaW4gY29uZmlndXJhdGlvbiBvZiB0aGlzIHdpZGdldCB0byBwb3B1bGF0ZSBhdmFpbGFibGUgbWVhc3VyZW1lbnRzIGZvciBnaXZlbiBkZXZpY2UgaWQgb3IgZ3JvdXAgaWRcbiAgICovXG4gIGdldEZyYWdtZW50U2VyaWVzKFxuICAgIGFEZXZpY2U6IGFueSxcbiAgICBmcmFnZW1lbnRMaXN0OiBhbnksXG4gICAgb2JzZXJ2YWJsZUZyYWdtZW50JDogQmVoYXZpb3JTdWJqZWN0PGFueT5cbiAgKTogdm9pZCB7XG4gICAgbGV0IGRldmljZUxpc3Q6IGFueSA9IG51bGw7XG4gICAgaWYgKGFEZXZpY2UpIHtcbiAgICAgIC8vIGdldCBhbGwgY2hpbGQgYXNzZXRzIGZvciB0aGUgdGFyZ2V0IG9iamVjdCwgZGVmaW5lZCBpbiB0aGUgY29uZmlndXJhdGlvblxuICAgICAgdGhpcy5nZXRUYXJnZXRPYmplY3QoYURldmljZS5pZClcbiAgICAgICAgLnRoZW4oYXN5bmMgKG1vOiBhbnkpID0+IHtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBtbyAmJlxuICAgICAgICAgICAgbW8udHlwZSAmJlxuICAgICAgICAgICAgKG1vLnR5cGUubG9jYWxlQ29tcGFyZSgnYzh5X0RldmljZUdyb3VwJykgPT09IDAgfHxcbiAgICAgICAgICAgICAgbW8udHlwZS5sb2NhbGVDb21wYXJlKCdjOHlfRGV2aWNlU3ViZ3JvdXAnKSA9PT0gMClcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIC8vIEdFVCBjaGlsZCBkZXZpY2VzXG4gICAgICAgICAgICB0aGlzLmdldENoaWxkRGV2aWNlcyhhRGV2aWNlLmlkLCAxLCBkZXZpY2VMaXN0KVxuICAgICAgICAgICAgICAudGhlbihhc3luYyAoZGV2aWNlRm91bmQpID0+IHtcbiAgICAgICAgICAgICAgICBkZXZpY2VMaXN0ID0gZGV2aWNlRm91bmQuZGF0YTtcbiAgICAgICAgICAgICAgICBjb25zdCB1bmlxdWVEZXZpY2VMaXN0ID0gZGV2aWNlTGlzdFxuICAgICAgICAgICAgICAgICAgLmZpbHRlcihcbiAgICAgICAgICAgICAgICAgICAgKGRldmljZTogYW55LCBpbmRleDogYW55LCBzZWxmOiBhbnkpID0+XG4gICAgICAgICAgICAgICAgICAgICAgaW5kZXggPT09IHNlbGYuZmluZEluZGV4KCh0OiBhbnkpID0+IHQudHlwZSA9PT0gZGV2aWNlLnR5cGUpXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAubWFwKChkZXZpY2U6IGFueSkgPT4gZGV2aWNlLmlkKTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGRldmljZSBvZiB1bmlxdWVEZXZpY2VMaXN0KSB7XG4gICAgICAgICAgICAgICAgICBpZiAoaXNEZXZNb2RlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJystKy0gQ0hFQ0tJTkcgU2VyaWVzIEZPUjogJywgZGV2aWNlKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGNvbnN0IHN1cHBvcnRlZE1lYXN1cmVtZW50cyA9IGF3YWl0IHRoaXMuZ2V0U3VwcG9ydGVkTWVhc3VyZW1lbnRzRm9yRGV2aWNlKFxuICAgICAgICAgICAgICAgICAgICBkZXZpY2VcbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICBpZiAoaXNEZXZNb2RlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgICAgICAgICAgJystKy0gc3VwcG9ydGVkTWVhc3VyZW1lbnRzIEZPUi4uLiAnICsgZGV2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgIHN1cHBvcnRlZE1lYXN1cmVtZW50c1xuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgY29uc3QgZnJhZ21lbnRTZXJpZXMgPSBhd2FpdCB0aGlzLmdldFN1cHBvcnRlZFNlcmllc0ZvckRldmljZShkZXZpY2UpO1xuICAgICAgICAgICAgICAgICAgaWYgKGlzRGV2TW9kZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCcrLSstIEZyYWdtZW50U2VyaWVzIEZPUi4uLiAnICsgZGV2aWNlLCBmcmFnbWVudFNlcmllcyk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIGZyYWdtZW50U2VyaWVzICYmXG4gICAgICAgICAgICAgICAgICAgIGZyYWdtZW50U2VyaWVzLmM4eV9TdXBwb3J0ZWRTZXJpZXMgJiZcbiAgICAgICAgICAgICAgICAgICAgc3VwcG9ydGVkTWVhc3VyZW1lbnRzICYmXG4gICAgICAgICAgICAgICAgICAgIHN1cHBvcnRlZE1lYXN1cmVtZW50cy5jOHlfU3VwcG9ydGVkTWVhc3VyZW1lbnRzXG4gICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgZnJhZ2VtZW50TGlzdCA9IHRoaXMuZ2V0RnJhZ2VtZW50TGlzdChcbiAgICAgICAgICAgICAgICAgICAgICBmcmFnZW1lbnRMaXN0LFxuICAgICAgICAgICAgICAgICAgICAgIGZyYWdtZW50U2VyaWVzLmM4eV9TdXBwb3J0ZWRTZXJpZXMsXG4gICAgICAgICAgICAgICAgICAgICAgc3VwcG9ydGVkTWVhc3VyZW1lbnRzLmM4eV9TdXBwb3J0ZWRNZWFzdXJlbWVudHNcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb2JzZXJ2YWJsZUZyYWdtZW50JC5uZXh0KGZyYWdlbWVudExpc3QpO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpc0Rldk1vZGUoKSkge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJystKy0gRVJST1IgRk9VTkQgV0hJTEUgR0VUVElORyBDSElMRCBERVZJQ0VTLi4uICcsIGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGlzRGV2TW9kZSgpKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCcrLSstIENIRUNLSU5HIE1FQVNVUkVNRU5UUyBGT1I6ICcsIGFEZXZpY2UuaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgc3VwcG9ydGVkTWVhc3VyZW1lbnRzID0gYXdhaXQgdGhpcy5nZXRTdXBwb3J0ZWRNZWFzdXJlbWVudHNGb3JEZXZpY2UoYURldmljZS5pZCk7XG4gICAgICAgICAgICBpZiAoaXNEZXZNb2RlKCkpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJystKy0gc3VwcG9ydGVkTWVhc3VyZW1lbnRzIEZPUi4uLiAnICsgYURldmljZS5pZCwgc3VwcG9ydGVkTWVhc3VyZW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGZyYWdtZW50U2VyaWVzID0gYXdhaXQgdGhpcy5nZXRTdXBwb3J0ZWRTZXJpZXNGb3JEZXZpY2UoYURldmljZS5pZCk7XG4gICAgICAgICAgICBpZiAoaXNEZXZNb2RlKCkpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJystKy0gRnJhZ21lbnRTZXJpZXMgRk9SLi4uICcgKyBhRGV2aWNlLmlkLCBmcmFnbWVudFNlcmllcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIGZyYWdtZW50U2VyaWVzICYmXG4gICAgICAgICAgICAgIGZyYWdtZW50U2VyaWVzLmM4eV9TdXBwb3J0ZWRTZXJpZXMgJiZcbiAgICAgICAgICAgICAgc3VwcG9ydGVkTWVhc3VyZW1lbnRzICYmXG4gICAgICAgICAgICAgIHN1cHBvcnRlZE1lYXN1cmVtZW50cy5jOHlfU3VwcG9ydGVkTWVhc3VyZW1lbnRzXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgZnJhZ2VtZW50TGlzdCA9IHRoaXMuZ2V0RnJhZ2VtZW50TGlzdChcbiAgICAgICAgICAgICAgICBmcmFnZW1lbnRMaXN0LFxuICAgICAgICAgICAgICAgIGZyYWdtZW50U2VyaWVzLmM4eV9TdXBwb3J0ZWRTZXJpZXMsXG4gICAgICAgICAgICAgICAgc3VwcG9ydGVkTWVhc3VyZW1lbnRzLmM4eV9TdXBwb3J0ZWRNZWFzdXJlbWVudHNcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9ic2VydmFibGVGcmFnbWVudCQubmV4dChmcmFnZW1lbnRMaXN0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyOiBhbnkpID0+IHtcbiAgICAgICAgICBpZiAoaXNEZXZNb2RlKCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcrLSstIEVSUk9SIHdoaWxlIGdldHRpbmcgRGV2aWNlIGRldGFpbHMgJywgZXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgfVxuICAvLyBUaGlzIG1ldGhvZCBwb3B1bGF0ZSBtZWFzdXJlbWVudExpc3QvZnJhZ2VtZW50TGlzdCBiYXNlZCBvbiBzZXJpZXMgYW5kIG1lYXN1cmVtZW50c1xuICBwcml2YXRlIGdldEZyYWdlbWVudExpc3QoZnJhZ2VtZW50TGlzdDogYW55LCBmcmFnbWVudFNlcmllczogYW55LCBzdXBwb3J0ZWRNZWFzdXJlbWVudHM6IGFueSkge1xuICAgIGlmIChmcmFnZW1lbnRMaXN0KSB7XG4gICAgICBmcmFnbWVudFNlcmllcy5mb3JFYWNoKChmczogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IG1lYXN1cmVtZW50VHlwZSA9IHN1cHBvcnRlZE1lYXN1cmVtZW50cy5maWx0ZXIoXG4gICAgICAgICAgKHNtRmlsdGVyOiBzdHJpbmcpID0+IGZzLmluZGV4T2Yoc21GaWx0ZXIpICE9PSAtMVxuICAgICAgICApO1xuICAgICAgICBpZiAobWVhc3VyZW1lbnRUeXBlICYmIG1lYXN1cmVtZW50VHlwZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgY29uc3QgZnNOYW1lID0gZnMucmVwbGFjZShtZWFzdXJlbWVudFR5cGVbMF0gKyAnLicsICcnKTtcbiAgICAgICAgICBjb25zdCBmc1R5cGUgPSBtZWFzdXJlbWVudFR5cGVbMF07XG4gICAgICAgICAgY29uc3QgZXhpc3RpbmdGID0gZnJhZ2VtZW50TGlzdC5maW5kKFxuICAgICAgICAgICAgKHNtOiB7IHR5cGU6IGFueTsgbmFtZTogc3RyaW5nIH0pID0+IHNtLnR5cGUgPT09IGZzVHlwZSAmJiBzbS5uYW1lID09PSBmc05hbWVcbiAgICAgICAgICApO1xuICAgICAgICAgIGlmICghZXhpc3RpbmdGIHx8IGV4aXN0aW5nRiA9PSBudWxsKSB7XG4gICAgICAgICAgICBmcmFnZW1lbnRMaXN0LnB1c2goe1xuICAgICAgICAgICAgICBuYW1lOiBmc05hbWUsXG4gICAgICAgICAgICAgIHR5cGU6IGZzVHlwZSxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGZzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZnJhZ21lbnRTZXJpZXMuZm9yRWFjaCgoZnM6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBtZWFzdXJlbWVudFR5cGUgPSBzdXBwb3J0ZWRNZWFzdXJlbWVudHMuZmlsdGVyKFxuICAgICAgICAgIChzbUZpbHRlcjogc3RyaW5nKSA9PiBmcy5pbmRleE9mKHNtRmlsdGVyKSAhPT0gLTFcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKG1lYXN1cmVtZW50VHlwZSAmJiBtZWFzdXJlbWVudFR5cGUubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGNvbnN0IGZzTmFtZSA9IGZzLnJlcGxhY2UobWVhc3VyZW1lbnRUeXBlWzBdICsgJy4nLCAnJyk7XG4gICAgICAgICAgY29uc3QgZnNUeXBlID0gbWVhc3VyZW1lbnRUeXBlWzBdO1xuICAgICAgICAgIGZyYWdlbWVudExpc3QucHVzaCh7XG4gICAgICAgICAgICBuYW1lOiBmc05hbWUsXG4gICAgICAgICAgICB0eXBlOiBmc1R5cGUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZnMsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZnJhZ2VtZW50TGlzdDtcbiAgfVxuICAvLyBHZXQgU3VwcG9ydGVkIFNlcmllcyBmb3IgZ2l2ZW4gZGV2aWNlIGlkL1xuICBwcml2YXRlIGFzeW5jIGdldFN1cHBvcnRlZFNlcmllc0ZvckRldmljZShkZXZpY2VJZDogc3RyaW5nKSB7XG4gICAgY29uc3Qgb3B0aW9uczogSUZldGNoT3B0aW9ucyA9IHtcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICB9O1xuICAgIHJldHVybiBhd2FpdCAoXG4gICAgICBhd2FpdCB0aGlzLmZldGNoQ2xpZW50LmZldGNoKGAvaW52ZW50b3J5L21hbmFnZWRPYmplY3RzLyR7ZGV2aWNlSWR9L3N1cHBvcnRlZFNlcmllc2AsIG9wdGlvbnMpXG4gICAgKS5qc29uKCk7XG4gIH1cbiAgLy8gR2V0IFN1cHBvcnRlZCBNZWFzdXJlbWVudHMgZm9yIGdpdmVuIGRldmljZSBJZFxuICBwcml2YXRlIGFzeW5jIGdldFN1cHBvcnRlZE1lYXN1cmVtZW50c0ZvckRldmljZShkZXZpY2VJZDogc3RyaW5nKSB7XG4gICAgY29uc3Qgb3B0aW9uczogSUZldGNoT3B0aW9ucyA9IHtcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICB9O1xuICAgIHJldHVybiBhd2FpdCAoXG4gICAgICBhd2FpdCB0aGlzLmZldGNoQ2xpZW50LmZldGNoKFxuICAgICAgICBgL2ludmVudG9yeS9tYW5hZ2VkT2JqZWN0cy8ke2RldmljZUlkfS9zdXBwb3J0ZWRNZWFzdXJlbWVudHNgLFxuICAgICAgICBvcHRpb25zXG4gICAgICApXG4gICAgKS5qc29uKCk7XG4gIH1cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1saW5lLWxlbmd0aFxuICBnZXRMYXN0TWVhc3VyZW1lbnRGb3JTb3VyY2UoXG4gICAgc291cmNlSWQ6IHN0cmluZyxcbiAgICBkYXRlRnJvbTogc3RyaW5nLFxuICAgIGRhdGVUbzogc3RyaW5nLFxuICAgIHR5cGU6IHN0cmluZyxcbiAgICBzZXJpZXM6IHN0cmluZ1xuICApOiBQcm9taXNlPElSZXN1bHRMaXN0PElNYW5hZ2VkT2JqZWN0Pj4ge1xuICAgIGNvbnN0IG1zbXRGaWx0ZXIgPSB7XG4gICAgICBwYWdlU2l6ZTogMjAsXG4gICAgICB2YWx1ZUZyYWdtZW50U2VyaWVzOiBzZXJpZXMsXG4gICAgICB2YWx1ZUZyYWdtZW50VHlwZTogdHlwZSxcbiAgICAgIGRhdGVGcm9tLFxuICAgICAgZGF0ZVRvLFxuICAgICAgcmV2ZXJ0OiB0cnVlLFxuICAgICAgc291cmNlOiBzb3VyY2VJZCxcbiAgICAgIC8vIHR5cGVcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICB0aGlzLm1zbXRTdmMubGlzdChtc210RmlsdGVyKS50aGVuKChyZXNwOiBhbnkpID0+IHtcbiAgICAgICAgcmVzb2x2ZShyZXNwKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0TWVhc3VyZW1lbnRGb3JTb3VyY2UoXG4gICAgc291cmNlSWQ6IHN0cmluZyxcbiAgICBkYXRlRnJvbTogc3RyaW5nLFxuICAgIGRhdGVUbzogc3RyaW5nLFxuICAgIHR5cGU6IHN0cmluZ1xuICApOiBQcm9taXNlPElSZXN1bHRMaXN0PElNYW5hZ2VkT2JqZWN0Pj4ge1xuICAgIGNvbnN0IG1zbXRGaWx0ZXIgPSB7XG4gICAgICBwYWdlU2l6ZTogMTAsXG4gICAgICB2YWx1ZUZyYWdtZW50VHlwZTogdHlwZSxcbiAgICAgIGRhdGVGcm9tLFxuICAgICAgZGF0ZVRvLFxuICAgICAgcmV2ZXJ0OiB0cnVlLFxuICAgICAgc291cmNlOiBzb3VyY2VJZCxcbiAgICAgIC8vIHR5cGVcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICB0aGlzLm1zbXRTdmMubGlzdChtc210RmlsdGVyKS50aGVuKChyZXNwOiBhbnkpID0+IHtcbiAgICAgICAgcmVzb2x2ZShyZXNwKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG4iXX0=