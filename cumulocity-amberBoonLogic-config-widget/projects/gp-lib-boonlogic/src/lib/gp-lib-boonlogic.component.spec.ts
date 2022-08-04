import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GpLibBoonlogicComponent } from './gp-lib-boonlogic.component';

describe('GpLibBoonlogicComponent', () => {
  let component: GpLibBoonlogicComponent;
  let fixture: ComponentFixture<GpLibBoonlogicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GpLibBoonlogicComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GpLibBoonlogicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
