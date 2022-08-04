import { TestBed } from '@angular/core/testing';

import { GpLibRcaService } from './gp-lib-rca.service';

describe('GpLibRcaService', () => {
  let service: GpLibRcaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GpLibRcaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
