#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

// 最適化されたDXTファイルを作成
async function createOptimizedDXT() {
  const outputPath = 'bbcom-miyakojima-search-optimized.dxt';
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // 最大圧縮
  });

  output.on('close', () => {
    const size = (archive.pointer() / 1024 / 1024).toFixed(2);
    console.log(`✅ 最適化されたDXTファイルを作成しました: ${outputPath} (${size}MB)`);
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);

  // 必要なファイルのみを追加
  archive.file('manifest.json', { name: 'manifest.json' });
  archive.file('icon.png', { name: 'icon.png' });
  archive.file('dist/server-bundled.cjs', { name: 'dist/server-bundled.cjs' });
  
  // Prismaスキーマとクライアント（必須）
  archive.directory('prisma/', 'prisma/', {
    ignore: ['migrations/**'] // マイグレーションファイルは除外
  });
  
  // Prismaランタイムの必要最小限のファイル
  archive.file('node_modules/.prisma/client/index.js', { name: 'node_modules/.prisma/client/index.js' });
  archive.file('node_modules/.prisma/client/package.json', { name: 'node_modules/.prisma/client/package.json' });
  
  // Prismaエンジン（プラットフォーム固有）
  const platform = process.platform;
  const arch = process.arch;
  const engineName = `libquery_engine-${platform}-${arch}.dylib.node`;
  
  if (fs.existsSync(`node_modules/.prisma/client/${engineName}`)) {
    archive.file(`node_modules/.prisma/client/${engineName}`, {
      name: `node_modules/.prisma/client/${engineName}`
    });
  }
  
  // @prisma/clientの必要最小限
  archive.directory('node_modules/@prisma/client/', 'node_modules/@prisma/client/', {
    ignore: ['**/*.d.ts', '**/*.map', 'scripts/**', 'generator-build/**']
  });

  // その他の必須依存関係
  const essentialDeps = [
    '@modelcontextprotocol/sdk',
    'zod',
    'dotenv'
  ];

  essentialDeps.forEach(dep => {
    const depPath = `node_modules/${dep}`;
    if (fs.existsSync(depPath)) {
      archive.directory(depPath, depPath, {
        ignore: ['**/*.d.ts', '**/*.map', 'test/**', 'tests/**', 'example/**', 'examples/**']
      });
    }
  });

  await archive.finalize();
}

createOptimizedDXT().catch(console.error);