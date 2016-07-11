export class FFTConfig {
    type: string;
    size: number;

    static simpleConfig() {
        return {
            waveform: {
                type: "waveform",
                size: 1024
            },
            spectrum: {
                type: "spectrum",
                size: 128
            }
        };
    };

}
