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
    if (isDevMode()) {console.log(this.status)};
  }

  async amberConnect() {
    if (isDevMode()) {
      console.log('+-+- CONNECTION INVOKED');
    }
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
      if (isDevMode()) {
        console.log('+-+- STREAMALL INVOKED');
      }
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
    //    this.connectionform.reset();
  }

  async amberDisconnect() {
    this.list = [];
    let getResponse: any;
    if (isDevMode()) {
      console.log('+-+- DISCONNECTION INVOKED');
    }
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
    //    this.connectionform.reset();
  }
}
