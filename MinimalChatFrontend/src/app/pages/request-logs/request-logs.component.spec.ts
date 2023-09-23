import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestLogsComponent } from './request-logs.component';

describe('RequestLogsComponent', () => {
  let component: RequestLogsComponent;
  let fixture: ComponentFixture<RequestLogsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RequestLogsComponent]
    });
    fixture = TestBed.createComponent(RequestLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
