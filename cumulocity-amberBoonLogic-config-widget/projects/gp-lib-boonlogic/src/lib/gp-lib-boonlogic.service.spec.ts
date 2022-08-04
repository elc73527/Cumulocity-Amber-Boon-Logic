import { TestBed } from '@angular/core/testing';

import { GpLibBoonlogicService } from './gp-lib-boonlogic.service';

describe('GpLibBoonlogicService', () => {
  let service: GpLibBoonlogicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GpLibBoonlogicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
