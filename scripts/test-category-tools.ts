#!/usr/bin/env npx tsx

/**
 * カテゴリーツールのテストスクリプト
 * 
 * 使用方法:
 * npx tsx scripts/test-category-tools.ts
 */

import { PrismaClient } from '@prisma/client';
import { 
  listCategories, 
  checkCategory,
  listCategoriesSchema,
  checkCategorySchema
} from '../src/mcp/tools/categoryTools';

const prisma = new PrismaClient({
  log: ['query', 'error']
});

// 色付きコンソール出力用のヘルパー
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function logTest(name: string) {
  console.log(`\n${colors.cyan}[TEST]${colors.reset} ${name}`);
}

function logSuccess(message: string) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message: string) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function logInfo(message: string) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

function logResult(data: any) {
  console.log(`${colors.gray}${JSON.stringify(data, null, 2)}${colors.reset}`);
}

async function testListCategories() {
  logTest('listCategories - デフォルトパラメータ');
  
  try {
    const result = await listCategories({});
    
    if (result.success) {
      logSuccess(`カテゴリー一覧を取得しました (${result.count}件)`);
      
      if (result.categories.length > 0) {
        logInfo('最初の3件のカテゴリー:');
        result.categories.slice(0, 3).forEach(cat => {
          console.log(`  - ${cat.name}${cat.itemCount !== undefined ? ` (${cat.itemCount}件)` : ''}`);
          if (cat.description) {
            console.log(`    ${colors.gray}${cat.description}${colors.reset}`);
          }
        });
      }
    } else {
      logError('カテゴリー一覧の取得に失敗しました');
      console.error(result.error);
    }
  } catch (error) {
    logError('エラーが発生しました');
    console.error(error);
  }
}

async function testListCategoriesWithOptions() {
  logTest('listCategories - アイテム数順でソート');
  
  try {
    const result = await listCategories({
      includeCount: true,
      orderBy: 'item_count'
    });
    
    if (result.success) {
      logSuccess('アイテム数順でカテゴリーを取得しました');
      
      if (result.categories.length > 0) {
        logInfo('上位5件のカテゴリー（アイテム数順）:');
        result.categories.slice(0, 5).forEach((cat, index) => {
          console.log(`  ${index + 1}. ${cat.name}: ${cat.itemCount}件`);
        });
      }
    } else {
      logError('カテゴリー一覧の取得に失敗しました');
      console.error(result.error);
    }
  } catch (error) {
    logError('エラーが発生しました');
    console.error(error);
  }
}

async function testCheckCategory() {
  logTest('checkCategory - 存在するカテゴリーの確認');
  
  // まず存在するカテゴリーを取得
  const categoriesList = await listCategories({ limit: 1 });
  
  if (categoriesList.success && categoriesList.categories.length > 0) {
    const testCategory = categoriesList.categories[0].name;
    logInfo(`テストカテゴリー: "${testCategory}"`);
    
    try {
      const result = await checkCategory({
        name: testCategory,
        fuzzy: false
      });
      
      if (result.success && result.exists) {
        logSuccess('カテゴリーが見つかりました');
        logResult({
          name: result.category?.name,
          slug: result.category?.slug,
          itemCount: result.category?.itemCount
        });
      } else if (result.success && !result.exists) {
        logError('カテゴリーが見つかりませんでした');
        if (result.suggestions && result.suggestions.length > 0) {
          logInfo(`提案: ${result.suggestions.join(', ')}`);
        }
      } else {
        logError('カテゴリーの確認に失敗しました');
        console.error(result.error);
      }
    } catch (error) {
      logError('エラーが発生しました');
      console.error(error);
    }
  }
}

async function testCheckCategoryNotFound() {
  logTest('checkCategory - 存在しないカテゴリーの確認');
  
  const testCategory = '存在しないカテゴリー123';
  logInfo(`テストカテゴリー: "${testCategory}"`);
  
  try {
    const result = await checkCategory({
      name: testCategory,
      fuzzy: false
    });
    
    if (result.success && !result.exists) {
      logSuccess('カテゴリーが存在しないことを正しく検出しました');
      console.log(`  メッセージ: ${result.message}`);
      
      if (result.suggestions && result.suggestions.length > 0) {
        logInfo(`類似カテゴリーの提案: ${result.suggestions.join(', ')}`);
      } else {
        logInfo('類似カテゴリーは見つかりませんでした');
      }
    } else if (result.success && result.exists) {
      logError('予期しない結果: カテゴリーが見つかりました');
    } else {
      logError('カテゴリーの確認に失敗しました');
      console.error(result.error);
    }
  } catch (error) {
    logError('エラーが発生しました');
    console.error(error);
  }
}

async function testCheckCategoryFuzzy() {
  logTest('checkCategory - 部分一致検索');
  
  // まず存在するカテゴリーを取得
  const categoriesList = await listCategories({ limit: 1 });
  
  if (categoriesList.success && categoriesList.categories.length > 0) {
    const fullName = categoriesList.categories[0].name;
    const partialName = fullName.substring(0, Math.min(3, fullName.length));
    logInfo(`部分文字列でテスト: "${partialName}"`);
    
    try {
      const result = await checkCategory({
        name: partialName,
        fuzzy: true
      });
      
      if (result.success && result.exists) {
        logSuccess('部分一致でカテゴリーが見つかりました');
        console.log(`  完全名: ${result.category?.name}`);
      } else if (result.success && !result.exists) {
        logInfo('部分一致でもカテゴリーが見つかりませんでした');
        if (result.suggestions && result.suggestions.length > 0) {
          logInfo(`提案: ${result.suggestions.join(', ')}`);
        }
      } else {
        logError('カテゴリーの確認に失敗しました');
        console.error(result.error);
      }
    } catch (error) {
      logError('エラーが発生しました');
      console.error(error);
    }
  }
}

async function testValidation() {
  logTest('パラメータバリデーション');
  
  try {
    // 無効なorderByパラメータのテスト
    logInfo('無効なorderByパラメータのテスト');
    const invalidOrderBy = listCategoriesSchema.safeParse({
      orderBy: 'invalid_order'
    });
    
    if (!invalidOrderBy.success) {
      logSuccess('無効なパラメータを正しく検出しました');
      console.log(`  ${colors.gray}${invalidOrderBy.error.errors[0].message}${colors.reset}`);
    } else {
      logError('無効なパラメータが検出されませんでした');
    }
    
    // 必須パラメータの欠落テスト
    logInfo('必須パラメータ欠落のテスト');
    const missingRequired = checkCategorySchema.safeParse({
      fuzzy: true
      // name is missing
    });
    
    if (!missingRequired.success) {
      logSuccess('必須パラメータの欠落を正しく検出しました');
      console.log(`  ${colors.gray}${missingRequired.error.errors[0].message}${colors.reset}`);
    } else {
      logError('必須パラメータの欠落が検出されませんでした');
    }
  } catch (error) {
    logError('バリデーションテスト中にエラーが発生しました');
    console.error(error);
  }
}

async function main() {
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}カテゴリーツール テストスクリプト${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
  
  try {
    // データベース接続テスト
    logTest('データベース接続');
    await prisma.$connect();
    logSuccess('データベースに接続しました');
    
    // 各テストを実行
    await testListCategories();
    await testListCategoriesWithOptions();
    await testCheckCategory();
    await testCheckCategoryNotFound();
    await testCheckCategoryFuzzy();
    await testValidation();
    
    console.log(`\n${colors.green}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.green}すべてのテストが完了しました${colors.reset}`);
    console.log(`${colors.green}${'='.repeat(60)}${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}テスト実行中にエラーが発生しました:${colors.reset}`, error);
  } finally {
    await prisma.$disconnect();
    logInfo('データベース接続を切断しました');
  }
}

// スクリプト実行
main().catch(console.error);