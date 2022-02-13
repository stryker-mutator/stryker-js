import { AngularPreset } from './presets/angular-preset.js';
import { Preset } from './presets/preset.js';
import { ReactPreset } from './presets/react-preset.js';
import { VueJsPreset } from './presets/vue-js-preset.js';

// Add new presets here
export const strykerPresets: Preset[] = [new AngularPreset(), new ReactPreset(), new VueJsPreset()];
