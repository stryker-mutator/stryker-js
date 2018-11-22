import StrykerPreset from './presets/StrykerPreset';

interface PresetOption {
  name: string;
  create(): StrykerPreset;
}

export default PresetOption;
