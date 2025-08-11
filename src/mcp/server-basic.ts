#!/usr/bin/env node

// 最初のログ - Node.jsが起動したことを確認
console.error('[BASIC] Node.js started:', new Date().toISOString());
console.error('[BASIC] Node version:', process.version);
console.error('[BASIC] Script path:', __filename);

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

console.error('[BASIC] Imports completed');

// 最小限のサーバー作成
const server = new Server(
  {
    name: 'bbcom-miyakojima',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

console.error('[BASIC] Server instance created');

// transport作成と接続
async function run() {
  console.error('[BASIC] run() function called');
  
  try {
    const transport = new StdioServerTransport();
    console.error('[BASIC] Transport created');
    
    await server.connect(transport);
    console.error('[BASIC] Server connected to transport');
    
    // プロセスを維持
    console.error('[BASIC] Setting up process handlers');
    
    // stdin を開いたままにする
    process.stdin.resume();
    
    // 定期的にハートビート
    const heartbeat = setInterval(() => {
      console.error('[BASIC] Heartbeat:', new Date().toISOString());
    }, 30000);
    
    // クリーンアップ
    process.on('SIGINT', () => {
      console.error('[BASIC] SIGINT received');
      clearInterval(heartbeat);
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.error('[BASIC] SIGTERM received');
      clearInterval(heartbeat);
      process.exit(0);
    });
    
    console.error('[BASIC] Server is running');
    
  } catch (error) {
    console.error('[BASIC] Error in run():', error);
    process.exit(1);
  }
}

// 即座に実行
console.error('[BASIC] Calling run()');
run().then(() => {
  console.error('[BASIC] run() completed successfully');
}).catch((error) => {
  console.error('[BASIC] run() failed:', error);
  process.exit(1);
});