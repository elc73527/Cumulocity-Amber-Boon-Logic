import { Injectable, OnInit } from '@angular/core';
import { Service, FetchClient } from '@c8y/client';
import { AlertService } from '@c8y/ngx-components';
@Injectable()
export class GpLibBoonlogicService extends Service<any> {
  listUrl = '';
  // microservice navigation url list
  baseUrl = 'service';
  isMSExist = false;

  constructor(client: FetchClient, private alertervice: AlertService) {
    super(client);
  }

  post(amberBoonLogicObj: any) {
    if (!this.isMSExist) return;
    return this.client.fetch(`${this.baseUrl}/${this.listUrl}`, {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(amberBoonLogicObj),
      method: 'POST',
    });
  }

  put(amberBoonLogicObj: any) {
    if (!this.isMSExist) return;
    return this.client.fetch(`${this.baseUrl}/${this.listUrl}`, {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(amberBoonLogicObj),
      method: 'PUT',
    });
  }

  remove(amberBoonLogicObj: any) {
    if (!this.isMSExist) return;
    return this.client.fetch(`${this.baseUrl}/${this.listUrl}`, {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(amberBoonLogicObj),
      method: 'DELETE',
    });
  }

  async verifySimulatorMicroServiceStatus() {
    const response = await this.client.fetch('service/amber-integration/health');
    const data = await response.json();
    if (data && data.status && data.status === 'UP') {
      this.isMSExist = true;
    } else {
      this.isMSExist = false;
      this.alertervice.danger('Please Install respective Amber Microservice ');
    }
  }

  async getConnectionStatus() {
    if (!this.isMSExist) return;
    else {
      const response = this.client.fetch('service/amber-integration/status');
      const data = await (await response).json();
      return data;
    }
  }
}
