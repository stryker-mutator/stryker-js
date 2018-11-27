import { AngularPreset } from './presets/AngularPreset';
import { ReactPreset } from './presets/ReactPreset';
import Preset from './presets/Preset';
import { VueJsPreset } from './presets/VueJsPreset';

// Add new presets here
const strykerPresets: Preset[] = [ new AngularPreset(), new ReactPreset(), new VueJsPreset() ];
export default strykerPresets;
