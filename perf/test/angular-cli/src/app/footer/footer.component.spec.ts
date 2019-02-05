import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FooterComponent} from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  /**
   * Gets a element in the native element
   * @param querySelector The query selector of the element
   */
  const getElement = (querySelector: string): HTMLElement => {
    return fixture.debugElement.nativeElement.querySelector(querySelector);
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FooterComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('css testing', () => {
    it('address should have display: flex', async () => {
      const element = getElement('address');
      const computedElement = getComputedStyle(element);
      expect(computedElement.display).toBe('flex');
    });
  });
});
