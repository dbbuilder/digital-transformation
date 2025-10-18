#!/usr/bin/env node

/**
 * Supabase Schema Deployment Script
 *
 * This script deploys the database schema to Supabase using the Management API.
 * It reads the schema.sql file and executes it using the service role key.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load secrets
const secretsPath = path.join(__dirname, '../app/app.secrets.json');
const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));

const SUPABASE_PROJECT_REF = secrets.supabase.projectId;
const SUPABASE_SERVICE_ROLE_KEY = secrets.supabase.serviceRoleKey;

// Database connection details - Direct connection (port 5432)
const DB_HOST = `db.${SUPABASE_PROJECT_REF}.supabase.co`;
const DB_PORT = 5432; // Direct database port
const DB_NAME = 'postgres';

console.log('🚀 Supabase Schema Deployment');
console.log('================================');
console.log(`Project: ${SUPABASE_PROJECT_REF}`);
console.log(`Host: ${DB_HOST}`);
console.log('');

// Read the schema file
const schemaPath = path.join(__dirname, '../supabase/schema.sql');
console.log(`📄 Reading schema from: ${schemaPath}`);

if (!fs.existsSync(schemaPath)) {
  console.error('❌ Error: schema.sql file not found at:', schemaPath);
  process.exit(1);
}

const schemaSql = fs.readFileSync(schemaPath, 'utf8');
const sqlStatements = schemaSql
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

console.log(`📊 Found ${sqlStatements.length} SQL statements to execute`);
console.log('');

// We'll use the pg library to connect directly to the database
console.log('⚠️  Note: This script requires direct database access.');
console.log('Please run the following commands manually:');
console.log('');
console.log('1. Install the pg library:');
console.log('   npm install pg');
console.log('');
console.log('2. Set your database password (from Supabase dashboard):');
console.log('   export SUPABASE_DB_PASSWORD="your-database-password"');
console.log('');
console.log('3. Run this script again');
console.log('');

// Check if pg is available
try {
  const { Client } = require('pg');

  const dbPassword = process.env.SUPABASE_DB_PASSWORD;

  if (!dbPassword) {
    console.log('❌ SUPABASE_DB_PASSWORD environment variable not set');
    console.log('');
    console.log('Get your database password from:');
    console.log(`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/settings/database`);
    console.log('');
    console.log('Then run:');
    console.log('export SUPABASE_DB_PASSWORD="your-password"');
    console.log('node scripts/deploy-schema.js');
    process.exit(1);
  }

  // Force IPv4 to avoid WSL IPv6 issues
  const dns = require('dns');
  dns.setDefaultResultOrder('ipv4first');

  const client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: 'postgres',
    password: dbPassword,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000
  });

  console.log('🔌 Connecting to database...');

  client.connect((err) => {
    if (err) {
      console.error('❌ Connection failed:', err.message);
      console.log('');
      console.log('Please check:');
      console.log('1. Database password is correct');
      console.log('2. Network connection is stable');
      console.log('3. Supabase project is active');
      process.exit(1);
    }

    console.log('✅ Connected to database');
    console.log('');
    console.log('🏗️  Executing schema...');
    console.log('');

    // Execute the entire schema as one transaction
    client.query(schemaSql, (err, result) => {
      if (err) {
        console.error('❌ Schema execution failed:', err.message);
        console.error('');
        console.error('Error details:');
        console.error(err);
        client.end();
        process.exit(1);
      }

      console.log('✅ Schema deployed successfully!');
      console.log('');
      console.log('📋 Summary:');
      console.log('  - Profiles table created');
      console.log('  - Projects table created (multi-tenant root)');
      console.log('  - Project members table created (access control)');
      console.log('  - Teams table created');
      console.log('  - Stakeholders table created');
      console.log('  - Assessments table created');
      console.log('  - Assessment responses table created');
      console.log('  - SOW section approvals table created');
      console.log('  - SOW approval workflows table created');
      console.log('  - Sync metadata table created');
      console.log('  - Row-Level Security (RLS) policies enabled');
      console.log('  - Version tracking triggers created');
      console.log('  - Indexes created');
      console.log('');
      console.log('🎉 Database is ready for multi-user collaboration!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Create your first user in Supabase dashboard');
      console.log('2. Create a test project');
      console.log('3. Add users to the project via project_members table');
      console.log('');

      client.end();
    });
  });

} catch (requireError) {
  console.log('Installing pg library...');
  const { execSync } = require('child_process');

  try {
    execSync('npm install pg', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('');
    console.log('✅ pg library installed');
    console.log('');
    console.log('Now set your database password and run again:');
    console.log('export SUPABASE_DB_PASSWORD="your-password"');
    console.log('node scripts/deploy-schema.js');
  } catch (installError) {
    console.error('❌ Failed to install pg library');
    console.error('Please install manually: npm install pg');
    process.exit(1);
  }
}
