import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyPasswordComponent } from './modify-password.component';

describe('PasswordComponent', () => {
  let component: ModifyPasswordComponent;
  let fixture: ComponentFixture<ModifyPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifyPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifyPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
