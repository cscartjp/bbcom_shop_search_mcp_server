#!/usr/bin/env tsx

import { spawn } from 'child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testMCPServer() {
  console.log('🔌 Testing MCP Server via stdio...\n');

  try {
    // Start the MCP server as a child process
    const serverProcess = spawn('npx', ['tsx', 'src/mcp/server.ts'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Create MCP client with stdio transport
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['tsx', 'src/mcp/server.ts']
    });

    const client = new Client({
      name: 'test-client',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    // Connect to the server
    await client.connect(transport);
    console.log('✅ Connected to MCP server\n');

    // List available tools
    const tools = await client.listTools();
    console.log('📋 Available tools:');
    tools.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description?.substring(0, 60)}...`);
    });
    console.log();

    // Test searchByCategory tool
    console.log('🧪 Testing searchByCategory tool...');
    const categoryResult = await client.callTool('searchByCategory', {
      category: 'グルメ',
      limit: 3
    });
    console.log(`  Found ${categoryResult.content[0].text.items.length} items in グルメ category`);
    console.log(`  First item: ${categoryResult.content[0].text.items[0].title}\n`);

    // Test searchByText tool
    console.log('🧪 Testing searchByText tool...');
    const textResult = await client.callTool('searchByText', {
      query: '宮古島',
      limit: 2
    });
    console.log(`  Found ${textResult.content[0].text.items.length} items matching "宮古島"`);
    console.log(`  First match: ${textResult.content[0].text.items[0].title}\n`);

    // Test searchByLocation tool
    console.log('🧪 Testing searchByLocation tool...');
    const locationResult = await client.callTool('searchByLocation', {
      latitude: 24.8054,
      longitude: 125.2814,
      radiusKm: 5,
      limit: 5
    });
    console.log(`  Found ${locationResult.content[0].text.items.length} items within 5km`);
    if (locationResult.content[0].text.items.length > 0) {
      console.log(`  Nearest: ${locationResult.content[0].text.items[0].title} (${locationResult.content[0].text.items[0].distance}m)\n`);
    }

    // Clean up
    await client.close();
    serverProcess.kill();

    console.log('✅ All MCP server tests passed successfully!');
  } catch (error) {
    console.error('❌ MCP server test failed:', error);
    process.exit(1);
  }
}

testMCPServer().catch(console.error);