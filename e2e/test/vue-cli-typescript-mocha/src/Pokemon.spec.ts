import { mount } from '@vue/test-utils'
import Pokemon from './Pokemon.vue';
import { expect } from 'chai';

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
    expect(sut.find('dl').element).ok;
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
    expect(sut.find('dd').element.innerHTML).eq('bar');
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
    expect(sut.find('h2').element.innerHTML).eq('Foo');
    sut.destroy();
  });
});
