@echo off
REM Run this from Windows Command Prompt or PowerShell
REM Sets environment variable and runs Node.js deployment

SET SUPABASE_DB_PASSWORD=Gv51076!
node scripts\deploy-schema.js

pause
