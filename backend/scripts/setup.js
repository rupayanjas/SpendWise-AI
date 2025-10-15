#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 SpendWise AI Backend Setup');
console.log('==============================\n');

async function setup() {
  try {
    // Check if .env exists
    const envPath = path.join(__dirname, '../.env');
    if (!fs.existsSync(envPath)) {
      console.log('📝 Creating .env file from template...');
      const envExamplePath = path.join(__dirname, '../.env.example');
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ .env file created\n');
    } else {
      console.log('✅ .env file already exists\n');
    }

    // Check Node.js version
    console.log('🔍 Checking Node.js version...');
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      console.log('⚠️  Warning: Node.js 18+ is recommended. Current version:', nodeVersion);
    } else {
      console.log('✅ Node.js version:', nodeVersion);
    }

    // Install dependencies
    console.log('\n📦 Installing dependencies...');
    try {
      execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
      console.log('✅ Dependencies installed successfully');
    } catch (error) {
      console.log('❌ Failed to install dependencies');
      throw error;
    }

    // Check MongoDB connection
    console.log('\n🍃 Checking MongoDB requirements...');
    console.log('Please ensure MongoDB is running and accessible');
    console.log('Default connection: mongodb://localhost:27017/spendwise-ai');
    console.log('Update MONGO_URI in .env if using a different connection');

    // Display configuration checklist
    console.log('\n📋 Configuration Checklist:');
    console.log('==========================');
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const requiredVars = [
      'PORT',
      'MONGO_URI',
      'JWT_SECRET',
      'OPENAI_API_KEY',
      'RPC_URL',
      'PRIVATE_KEY'
    ];

    requiredVars.forEach(varName => {
      const hasValue = envContent.includes(`${varName}=`) && 
                      !envContent.includes(`${varName}=your-`) && 
                      !envContent.includes(`${varName}=<`);
      console.log(`${hasValue ? '✅' : '⚠️ '} ${varName}`);
    });

    console.log('\n🔧 Next Steps:');
    console.log('==============');
    console.log('1. Update .env file with your configuration:');
    console.log('   - Set JWT_SECRET to a secure random string');
    console.log('   - Add OPENAI_API_KEY (optional, has fallback)');
    console.log('   - Set PRIVATE_KEY for blockchain features (optional)');
    console.log('   - Update MONGO_URI if using remote MongoDB');
    
    console.log('\n2. Start MongoDB (if using local instance):');
    console.log('   - macOS: brew services start mongodb-community');
    console.log('   - Linux: sudo systemctl start mongod');
    console.log('   - Windows: net start MongoDB');
    
    console.log('\n3. Deploy smart contract (optional):');
    console.log('   npm run deploy-contract');
    
    console.log('\n4. Start the development server:');
    console.log('   npm run dev');
    
    console.log('\n5. Test the API:');
    console.log('   curl http://localhost:3001/health');

    console.log('\n📚 Documentation:');
    console.log('=================');
    console.log('- API Documentation: /backend/README.md');
    console.log('- Health Check: http://localhost:3001/health');
    console.log('- Frontend Integration: Update FRONTEND_URL in .env');

    console.log('\n🎉 Setup completed successfully!');
    console.log('The backend is ready to run. Execute "npm run dev" to start.');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  setup();
}

module.exports = { setup };
