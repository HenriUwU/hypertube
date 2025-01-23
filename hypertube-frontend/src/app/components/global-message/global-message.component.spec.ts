import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalMessageComponent } from './global-message.component';

describe('GlobalMessageComponent', () => {
  let component: GlobalMessageComponent;
  let fixture: ComponentFixture<GlobalMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GlobalMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
