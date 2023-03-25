import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {BestellingPlaatsenComponent} from './bestelling-plaatsen.component';
import {KlantgegevensFormulierComponent} from './klantgegevens-formulier/klantgegevens-formulier.component';
import {ReactiveFormsModule} from '@angular/forms';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';


describe('BestellingPlaatsenComponent', () => {
  let component: BestellingPlaatsenComponent;
  let fixture: ComponentFixture<BestellingPlaatsenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BestellingPlaatsenComponent, KlantgegevensFormulierComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BestellingPlaatsenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
