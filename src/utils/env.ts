// src/utils/env.ts
import 'dotenv/config'; // Keep this at the top if it's the first file loaded that needs .env

interface EnvConfig {
  DATABASE_URI_SHAD1: string;
  DATABASE_URI_SHAD2: string;
  DATABASE_URI_SHAD3: string;
  DATABASE_URI_SHAD4: string;
  PORT: string;
  // Add other environment variables here as needed
}

function validateEnv(env: NodeJS.ProcessEnv): EnvConfig {
  const errors: string[] = [];

  // Initialize with known empty strings or fallback values
  // This helps TypeScript understand the shape of validatedEnv from the start
  const validatedEnv: EnvConfig = {
    DATABASE_URI_SHAD1: '',
    DATABASE_URI_SHAD2: '',
    DATABASE_URI_SHAD3: '',
    DATABASE_URI_SHAD4: '',
    PORT: '',
  };

  const requiredEnvKeys: (keyof EnvConfig)[] = [
    'DATABASE_URI_SHAD1',
    'DATABASE_URI_SHAD2',
    'DATABASE_URI_SHAD3',
    'DATABASE_URI_SHAD4',
    'PORT',
  ];

  for (const key of requiredEnvKeys) {
    const value = env[key]; // TypeScript correctly infers string | undefined here

    if (typeof value === 'string' && value.length > 0) {
      validatedEnv[key] = value; // Direct, type-safe assignment
    } else {
      errors.push(`Environment variable ${key} is not set or is empty.`);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Missing or invalid environment variables:\n${errors.join('\n')}`,
    );
  }

  return validatedEnv; // No need for 'as EnvConfig' here, as it's already typed
}

export const env = validateEnv(process.env);
