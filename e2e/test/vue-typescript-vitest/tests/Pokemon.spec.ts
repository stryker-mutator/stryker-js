import { mount } from '@vue/test-utils';
import Pokemon from '../src/Pokemon.vue';
import { expect, describe, it } from 'vitest';

describe('Pokemon component', () => {
  it('should render definition list', () => {
    const sut = mount(Pokemon, {
      propsData: {
        pokemon: {
          name: 'Foo',
          type: 'bar',
        },
      },
    });
    expect(sut.find('dl').element).ok;
    sut.unmount();
  });
  it('should render the type', async () => {
    const sut = mount(Pokemon, {
      propsData: {
        pokemon: {
          name: 'Foo',
          type: 'bar',
        },
      },
    });
    expect(sut.find('dd').element.innerHTML).eq('bar');
    sut.unmount();
  });
  it('should render the name', async () => {
    const sut = mount(Pokemon, {
      propsData: {
        pokemon: {
          name: 'Foo',
          type: 'bar',
        },
      },
    });
    expect(sut.find('h2').element.innerHTML).eq('Foo');
    sut.unmount();
  });
});
