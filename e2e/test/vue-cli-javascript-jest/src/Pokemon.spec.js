import { mount } from '@vue/test-utils'
import Pokemon from './Pokemon.vue';

describe('Pokemon component', () => {
  it('should render definition list', () => {
    const sut = mount(Pokemon, {
      propsData: {
        pokemon: {
          name: 'Foo',
          type: 'bar' 
        }
      }
    });
    expect(sut.find('dl').element).toBeTruthy();
    sut.destroy();
  });
  it('should render the type', async () => {
    const sut = mount(Pokemon, {
      propsData: {
        pokemon: {
          name: 'Foo',
          type: 'bar' 
        }
      }
    });
    expect(sut.find('dd').element.innerHTML).toBe('bar');
    sut.destroy();
  });
  it('should render the name', async () => {
    const sut = mount(Pokemon, {
      propsData: {
        pokemon: {
          name: 'Foo',
          type: 'bar' 
        }
      }
    });
    expect(sut.find('h2').element.innerHTML).toBe('Foo');
    sut.destroy();
  });
});
