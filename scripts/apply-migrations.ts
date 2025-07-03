import { supabase } from '../services/supabaseClient';
import fs from 'fs';
import path from 'path';

async function applyMigrations() {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  
  try {
    const files = fs.readdirSync(migrationsDir).sort();
    
    for (const file of files) {
      if (file.endsWith('.sql')) {
        console.log(`Applying migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        
        const { error } = await supabase.rpc('exec_sql', { sql });
        
        if (error) {
          console.error(`Error applying migration ${file}:`, error);
        } else {
          console.log(`✅ Migration ${file} applied successfully`);
        }
      }
    }
    
    console.log('All migrations completed!');
  } catch (error) {
    console.error('Error applying migrations:', error);
  }
}

applyMigrations();