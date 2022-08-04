import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GpLibRcaComponent } from './gp-lib-rca.component';

describe('GpLibRcaComponent', () => {
  let component: GpLibRcaComponent;
  let fixture: ComponentFixture<GpLibRcaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GpLibRcaComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GpLibRcaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
