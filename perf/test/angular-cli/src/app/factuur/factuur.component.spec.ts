import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {FactuurComponent} from './factuur.component';

describe('FactuurComponent', () => {
  let component: FactuurComponent;
  let fixture: ComponentFixture<FactuurComponent>;
  /**
   * Gets a element in the native element
   * @param querySelector The query selector of the element
   */
  const getElement = (querySelector: string): HTMLElement => {
    return fixture.debugElement.nativeElement.querySelector(querySelector);
  };


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FactuurComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactuurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('html testing', () => {
    it('#succes-melding should exist', async () => {
      const element = getElement('#succes-melding');
      expect(element).toBeTruthy();
    });
  });
});
