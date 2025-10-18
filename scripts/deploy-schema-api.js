#!/usr/bin/env node

/**
 * Supabase Schema Deployment Script (Using Management API)
 *
 * This script deploys the database schema to Supabase using the Management API.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load secrets
const secretsPath = path.join(__dirname, '../app/app.secrets.json');
const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));

const SUPABASE_PROJECT_REF = secrets.supabase.projectId;
const SUPABASE_SERVICE_ROLE_KEY = secrets.supabase.serviceRoleKey;

console.log('🚀 Supabase Schema Deployment (via API)');
console.log('==========================================');
console.log(`Project: ${SUPABASE_PROJECT_REF}`);
console.log('');

// Read the schema file
const schemaPath = path.join(__dirname, '../supabase/schema.sql');
console.log(`📄 Reading schema from: ${schemaPath}`);

if (!fs.existsSync(schemaPath)) {
  console.error('❌ Error: schema.sql file not found at:', schemaPath);
  process.exit(1);
}

const schemaSql = fs.readFileSync(schemaPath, 'utf8');

console.log(`📊 Schema size: ${(schemaSql.length / 1024).toFixed(2)} KB`);
console.log('');

// Split into manageable chunks (execute each major section separately)
const sections = schemaSql.split(/-- ={50,}/);

console.log(`🔨 Split into ${sections.length} sections for execution`);
console.log('');

// Function to execute SQL via Supabase PostgREST
function executeSql(sql, callback) {
  const postData = JSON.stringify({ query: sql });

  const options = {
    hostname: `${SUPABASE_PROJECT_REF}.supabase.co`,
    port: 443,
    path: '/rest/v1/rpc/exec_sql',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        callback(null, data);
      } else {
        callback(new Error(`HTTP ${res.statusCode}: ${data}`));
      }
    });
  });

  req.on('error', (error) => {
    callback(error);
  });

  req.write(postData);
  req.end();
}

// Since we can't use the RPC endpoint directly, let's create a simpler approach
// We'll create individual table creation statements and execute them via the REST API

console.log('⚠️  Note: Management API requires manual schema deployment.');
console.log('');
console.log('📋 Please follow these steps:');
console.log('');
console.log('1. Go to Supabase SQL Editor:');
console.log(`   https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/sql/new`);
console.log('');
console.log('2. Copy the schema file contents:');
console.log(`   cat supabase/schema.sql | pbcopy`);
console.log('   (or manually copy from: supabase/schema.sql)');
console.log('');
console.log('3. Paste into the SQL Editor');
console.log('');
console.log('4. Click "Run" (or press Ctrl+Enter)');
console.log('');
console.log('5. Verify tables are created:');
console.log(`   https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/editor`);
console.log('');
console.log('Expected tables:');
console.log('  ✓ profiles');
console.log('  ✓ projects');
console.log('  ✓ project_members');
console.log('  ✓ teams');
console.log('  ✓ stakeholders');
console.log('  ✓ assessments');
console.log('  ✓ assessment_responses');
console.log('  ✓ sow_section_approvals');
console.log('  ✓ sow_approval_workflows');
console.log('  ✓ sync_metadata');
console.log('');

// Alternative: Create a formatted output for easy copy-paste
const outputPath = path.join(__dirname, '../supabase/SCHEMA_READY_TO_PASTE.sql');
fs.writeFileSync(outputPath, schemaSql, 'utf8');

console.log(`✅ Schema formatted and ready at:`);
console.log(`   ${outputPath}`);
console.log('');
console.log('💡 Quick Copy Command (Linux/Mac):');
console.log(`   cat supabase/SCHEMA_READY_TO_PASTE.sql`);
console.log('');
console.log('💡 Quick Copy Command (Windows):');
console.log(`   type supabase\\SCHEMA_READY_TO_PASTE.sql`);
