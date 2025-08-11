#!/usr/bin/env node

// .envファイルを自動的に読み込む
import dotenv from 'dotenv';
import path from 'path';

// プロジェクトルートの.envファイルを読み込む
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// 元のserver.tsを実行
import './server.js';