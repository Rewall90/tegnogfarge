// This script will help create a write token or use the Sanity CLI
import { execSync } from 'child_process';

console.log('🔑 CREATING SANITY WRITE TOKEN');
console.log('='.repeat(40));

try {
  // Try to use Sanity CLI to create a token
  console.log('Attempting to create write token via Sanity CLI...');

  const result = execSync('npx sanity debug --secrets', {
    encoding: 'utf8',
    cwd: './sanity-studio'
  });

  console.log('Sanity debug result:', result);

} catch (error) {
  console.log('CLI method failed, trying alternative approach...');

  try {
    // Try to get project info
    const projectInfo = execSync('npx sanity projects list', {
      encoding: 'utf8',
      cwd: './sanity-studio'
    });

    console.log('Project info:', projectInfo);

    // Try to create token
    const tokenResult = execSync('npx sanity users invite', {
      encoding: 'utf8',
      cwd: './sanity-studio'
    });

    console.log('Token result:', tokenResult);

  } catch (cliError) {
    console.log('❌ CLI methods failed');
    console.log('📝 Manual token creation required:');
    console.log('');
    console.log('1. Go to: https://www.sanity.io/manage/project/fn0kjvlp/api#tokens');
    console.log('2. Click "Add API token"');
    console.log('3. Name: "Copyright Cleanup"');
    console.log('4. Permissions: "Editor" or "Admin"');
    console.log('5. Copy the token');
    console.log('6. Add to .env.local as SANITY_WRITE_TOKEN=your_token_here');
    console.log('');
    console.log('Or alternatively, use the Vision tool in Sanity Studio as instructed.');
  }
}