import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotPasswordPopupComponent } from './forgot-password-popup.component';

describe('ForgotPasswordPopupComponent', () => {
  let component: ForgotPasswordPopupComponent;
  let fixture: ComponentFixture<ForgotPasswordPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
