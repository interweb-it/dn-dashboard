/**
 * Memory monitoring utility for workers
 */

export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private intervalId: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  startMonitoring(intervalMs: number = 30000): void {
    if (this.isMonitoring) {
      console.log('Memory monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    this.intervalId = setInterval(() => {
      this.logMemoryUsage();
    }, intervalMs);

    console.log(`Memory monitoring started (interval: ${intervalMs}ms)`);
  }

  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isMonitoring = false;
    console.log('Memory monitoring stopped');
  }

  logMemoryUsage(context?: string): void {
    const memUsage = process.memoryUsage();
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context}]` : '';
    
    console.log(`${timestamp}${contextStr} - Memory Usage:`);
    console.log(`  RSS: ${Math.round(memUsage.rss / 1024 / 1024)}MB`);
    console.log(`  Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
    console.log(`  Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);
    console.log(`  External: ${Math.round(memUsage.external / 1024 / 1024)}MB`);
    console.log(`  Array Buffers: ${Math.round(memUsage.arrayBuffers / 1024 / 1024)}MB`);
    
    // Warning if memory usage is high
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    if (heapUsedMB > 1000) {
      console.warn(`⚠️  HIGH MEMORY USAGE: ${heapUsedMB}MB`);
    }
    if (heapUsedMB > 2000) {
      console.error(`🚨 CRITICAL MEMORY USAGE: ${heapUsedMB}MB`);
    }
  }

  forceGC(): void {
    if (global.gc) {
      const before = process.memoryUsage();
      global.gc();
      const after = process.memoryUsage();
      
      console.log('Garbage collection performed:');
      console.log(`  Heap before: ${Math.round(before.heapUsed / 1024 / 1024)}MB`);
      console.log(`  Heap after: ${Math.round(after.heapUsed / 1024 / 1024)}MB`);
      console.log(`  Freed: ${Math.round((before.heapUsed - after.heapUsed) / 1024 / 1024)}MB`);
    } else {
      console.log('Garbage collection not available (run with --expose-gc flag)');
    }
  }

  getMemoryStats() {
    const memUsage = process.memoryUsage();
    return {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024),
    };
  }
}

// Export singleton instance
export const memoryMonitor = MemoryMonitor.getInstance();
