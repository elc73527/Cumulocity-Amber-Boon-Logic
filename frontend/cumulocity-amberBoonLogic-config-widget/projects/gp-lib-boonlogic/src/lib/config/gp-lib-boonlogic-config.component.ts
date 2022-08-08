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

import { Component, Input, isDevMode, OnInit } from '@angular/core';
import { GpLibBoonlogicService } from '../gp-lib-boonlogic.service';
import { AlertService, TranslateService } from '@c8y/ngx-components';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Commonc8yService } from '../Commonc8yservice.service';

@Component({
  selector: 'lib-gp-lib-boonlogic-config',
  templateUrl: './gp-lib-boonlogic-config.component.html',
  styleUrls: ['./gp-lib-boonlogic-config.component.css'],
})
export class GpLibBoonlogicConfigComponent implements OnInit {
  @Input() config: any = {};
  connectResponse: any;
  status: any;
  list: any;

  connectionform = new FormGroup({
    connectionurl: new FormControl(),
    connectionusername: new FormControl(),
    connectionpassword: new FormControl(),
    connectioncall: new FormControl(),
  });

  constructor(
    private cms: Commonc8yService,
    private microserviceBoonLogic: GpLibBoonlogicService,
    private alertervice: AlertService
  ) {}

  async ngOnInit() {
    this.config.connect = '0';
    await this.microserviceBoonLogic.verifySimulatorMicroServiceStatus();
    this.status = await this.cms.getAmberConnectionStatus();
  }

  async amberConnect() {
    this.microserviceBoonLogic.listUrl = 'amber-integration/configure';
    this.connectResponse = await this.microserviceBoonLogic.post({
      username: this.config.username,
      password: this.config.password,
      url: this.config.url,
    });
    this.status = await this.cms.getAmberConnectionStatus();
    if (this.connectResponse.status === 200) {
      this.alertervice.success('Connection Established');
      this.list = [];
      let getResponse: any;
      let response = await this.cms.getSpecificFragmentDevices(1);
      response.data.forEach((device: any) => {
        let arr = { id: device.id };
        this.list.push(arr);
      });
      if (this.list) {
        await this.list.forEach(async (device: any) => {
          this.microserviceBoonLogic.listUrl = 'amber-integration/sensors/' + device.id + '/status';
          getResponse = await this.microserviceBoonLogic.put({
            isStreaming: true,
          });
        });
      }
    } else {
      this.alertervice.danger('Failed to Establish connection');
    }
  }

  async amberDisconnect() {
    this.list = [];
    let getResponse: any;
    let response = await this.cms.getSpecificFragmentDevices(1);
    response.data.forEach((device: any) => {
      let arr = { id: device.id };
      this.list.push(arr);
    });
    if (this.list) {
      const promises = this.list.map(async (device: any) => {
        this.microserviceBoonLogic.listUrl = 'amber-integration/sensors/' + device.id + '/status';
        getResponse = await this.microserviceBoonLogic.put({
          isStreaming: false,
        });
      });
      await Promise.all(promises);
    }

    this.microserviceBoonLogic.listUrl = 'amber-integration/disconnect';
    this.connectResponse = await this.microserviceBoonLogic.post({});
    this.status = await this.cms.getAmberConnectionStatus();
    if (this.connectResponse.status === 200) {
      this.alertervice.success('Successfully Disconnected');
    } else {
      this.alertervice.danger('Failed to Disconnect');
    }
  }
}
