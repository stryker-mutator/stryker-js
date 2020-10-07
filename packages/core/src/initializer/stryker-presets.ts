import { AngularPreset } from './presets/angular-preset';
import Preset from './presets/preset';
import { ReactPreset } from './presets/react-preset';
import { VueJsPreset } from './presets/vue-js-preset';

// Add new presets here
const strykerPresets: Preset[] = [new AngularPreset(), new ReactPreset(), new VueJsPreset()];
export default strykerPresets;
