// services/telemetryService.ts
import { FeedMessage } from '../pages/substrate-telemetry'
import type { Message } from '../pages/substrate-telemetry/feed'

type TelemetryMessage = {
  action: string;
  payload: Message;
};
type TelemetryCallback = (message: any) => void;

export default class TelemetryService {
  private ws: WebSocket | null = null;
  private listeners: TelemetryCallback[] = [];
  private readonly TELEMETRY_WS_URL = 'wss://telemetry-backend.w3f.community/feed';
  // private chainId = 'kusama';

  // Connect to the WebSocket server
  async connect(): Promise<void> {
    if (!import.meta.client) {
      console.warn('TelemetryService is only available in the browser');
      return;
    }
    if (this.ws) {
      console.warn('WebSocket is already connected');
      return;
    }

    this.ws = new WebSocket(this.TELEMETRY_WS_URL);
    await this.waitForOpenConnection();

    // Handle WebSocket open event
    this.ws.onopen = () => {
      console.log('Connected to Polkadot Telemetry server');
    };

    // Handle incoming messages
    this.ws.onmessage = async (event: MessageEvent) => {
      // console.debug('Received telemetry message:', await event.data.text());
      try {
        const messages: any[] = FeedMessage.deserialize(await event.data.text());

        messages.forEach((message) => {
          // console.debug('Received telemetry message:', message);
          this.listeners.forEach((callback) => callback(message));
        })

      } catch (error) {
        console.error('Error parsing telemetry message:', error);
      }
    };

    // Handle connection close
    this.ws.onclose = () => {
      console.log('Disconnected from Polkadot Telemetry server');
      this.ws = null;
    };

    // Handle WebSocket errors
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  // Wait for the WebSocket connection to open
  private async waitForOpenConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
      } else if (this.ws) {
        console.log('Waiting for WebSocket connection to open...');
        const onOpen = () => {
          this.ws?.removeEventListener('open', onOpen);
          resolve();
        };
        const onError = (err: Event) => {
          this.ws?.removeEventListener('error', onError);
          reject(err);
        };
        this.ws.addEventListener('open', onOpen);
        this.ws.addEventListener('error', onError);
      } else {
        reject(new Error('WebSocket is not initialized'));
      }
    });
  }

  // Disconnect the WebSocket
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // subscribe kusama subscribe:0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe
  // subscribe polkadot subscribe:0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3
  private chains: Record<string, string> = {
    kusama: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
    polkadot: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
  }
  async subscribe(chain: string): Promise<void> {
    if (!this.ws) {
      await this.connect();
      // while(this.ws)
    }
    if (this.ws) {
      const chainHash = this.chains[chain];
      this.ws.send(`subscribe:${chainHash}`);
      console.log(`Subscribed to ${chain}`);
    }
  }
  unsubscribe(chain: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const chainHash = this.chains[chain];
      if (chainHash) {
        this.ws.send(`unsubscribe:${chainHash}`);
        console.log(`Unsubscribed from ${chain}`);
      }
    }
  }

  // Add a listener for incoming telemetry data
  addListener(callback: TelemetryCallback): void {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  // Remove a listener
  removeListener(callback: TelemetryCallback): void {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }
}
