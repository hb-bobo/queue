export interface Config {
    limit: number;
    autoStart?: boolean;
    autoDoNext?: boolean;
}
declare type Done = () => void;
export declare type QueueItem = (done: Done) => void;
export declare type LineType = 'processingQueue' | 'processedQueue';
export {};
