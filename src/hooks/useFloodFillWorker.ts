import { useRef, useCallback, useEffect } from 'react';
import { FillRegion } from '@/lib/flood-fill';

// Interface for WorkerResponse basert på det workeren sender tilbake
interface WorkerResponse {
  id: number;
  action: 'floodFill';
  changes: {
    x: number;
    y: number;
    oldColor: number[];
    newColor: number[];
  }[];
  region: FillRegion;
  performance: {
    totalTime: number;
    processedPixels: number;
    changedPixels: number;
  };
}

export type FloodFillWorkerResult = {
  region: FillRegion;
  changes: WorkerResponse['changes'];
  performance: WorkerResponse['performance'];
};

export default function useFloodFillWorker() {
  // Vi holder en referanse til workeren så den ikke re-opprettes ved hver rendering
  const workerRef = useRef<Worker | null>(null);
  // Vi bruker en Map til å lagre callbacks for hver flood fill-operasjon
  const callbacksRef = useRef<Map<number, (result: FloodFillWorkerResult) => void>>(new Map());
  // Teller for å gi hver operasjon en unik ID
  const requestIdRef = useRef<number>(0);

  // Opprett workeren ved første render
  useEffect(() => {
    if (typeof window === 'undefined') return; // Ikke kjør på serveren

    workerRef.current = new Worker(new URL('../workers/flood-fill-worker.ts', import.meta.url));

    // Sett opp message handler
    workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { id, action, changes, region, performance } = event.data;
      
      if (action === 'floodFill') {
        // Finn og kall callback for denne operasjonen
        const callback = callbacksRef.current.get(id);
        if (callback) {
          callback({ region, changes, performance });
          callbacksRef.current.delete(id); // Rydd opp
        }
      }
    };

    // Cleanup-funksjon
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      callbacksRef.current.clear();
    };
  }, []);

  // Funksjon for å utføre flood fill i workeren
  const performFloodFill = useCallback(
    (params: {
      imageData: ImageData;
      x: number;
      y: number;
      fillColor: string;
      tolerance: number;
      maxPoints?: number;
    }): Promise<FloodFillWorkerResult> => {
      const { imageData, x, y, fillColor, tolerance, maxPoints } = params;
      
      // Vi sender et Promise som kan resolves av onmessage-handleren
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not initialized'));
          return;
        }
        
        // Generer en unik ID for denne operasjonen
        const id = ++requestIdRef.current;
        
        // Lagre callback-funksjonen
        callbacksRef.current.set(id, resolve);
        
        // Send melding til workeren
        workerRef.current.postMessage({
          id,
          action: 'floodFill',
          imageData: imageData.data.buffer,
          width: imageData.width,
          height: imageData.height,
          x,
          y,
          fillColor,
          tolerance,
          maxPoints
        }, [imageData.data.buffer.slice(0)]); // Bruk transferable objects for bedre ytelse
      });
    },
    []
  );

  return {
    performFloodFill
  };
} 