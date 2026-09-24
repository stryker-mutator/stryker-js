import { mount } from '@vue/test-utils';
import PokemonFilter from '../src/PokemonFilter.vue';
import { expect, describe, it } from 'vitest';

describe('PokemonFilter component', () => {
  it('should render the default label', () => {
    const sut = mount(PokemonFilter);
    expect(sut.find('label').text()).contain('Filter by type');
    sut.unmount();
  });
  it('should select all types by default', () => {
    const sut = mount(PokemonFilter);
    expect(sut.find('select').element.value).eq('all');
    sut.unmount();
  });
  it('should update the model when another type is selected', async () => {
    const sut = mount(PokemonFilter);
    await sut.find('select').setValue('fire');
    expect(sut.emitted('update:type')).deep.eq([['fire']]);
    sut.unmount();
  });
});
