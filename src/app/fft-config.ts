export enum FFTType {
    Waveform = 1,
    Spectrum
}

export class FFTConfig {
    type: FFTType;
    size: number;

    static simpleConfig() {
        return {
            waveform: {
                type: FFTType.Waveform,
                size: 1024
            },
            spectrum: {
                type: FFTType.Spectrum,
                size: 128
            }
        };
    };
}
