import { AngularPreset } from './presets/AngularPreset';
import { ReactPreset } from './presets/ReactPreset';
import StrykerPreset from './presets/StrykerPreset';
import { VueJsPreset } from './presets/VueJsPreset';

// Add new presets here
const strykerPresets: StrykerPreset[] = [ new AngularPreset(), new ReactPreset(), new VueJsPreset() ];
export default strykerPresets;
