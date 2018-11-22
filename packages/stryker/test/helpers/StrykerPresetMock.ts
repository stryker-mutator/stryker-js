import StrykerPreset from '../../src/initializer/presets/StrykerPreset';

export class StrykerPresetMock extends StrykerPreset {
    public dependencies: string[] = [];
    public conf: string = '';
}
