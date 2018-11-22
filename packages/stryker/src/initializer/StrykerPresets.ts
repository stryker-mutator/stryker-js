import { AngularPreset } from './presets/AngularPreset';
import { VueJsPreset } from './presets/VueJsPreset';
import { ReactPreset } from './presets/ReactPreset';
import PresetOption from './PresetOption';

const strykerPresets: PresetOption[] = [
        {name: 'angular', create() { return new AngularPreset(); } },
        {name: 'react', create() { return new ReactPreset(); } },
        {name: 'vueJs', create() { return new VueJsPreset(); } }
        // Add new presets here
];
export default strykerPresets;
