export interface Config {
    limit: number;
    autoStart?: boolean;
    autoDoNext?: boolean;
}
type Done = () => void;

export type QueueItem = (done: Done) => void;

export type LineType = 'processingQueue' | 'processedQueue';