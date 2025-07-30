import * as yaml from 'yaml';
import { readFileSync } from 'fs';
import { join } from 'path';

// 1. Declarar um tipo global para armazenar nossa instância
declare global {
  var configServiceInstance: ConfigService;
}

class ConfigService {
  // A instância local é apenas para referência dentro da classe
  private static instance: ConfigService;
  private config: Record<string, any> = {};

  private constructor() {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      this.loadFromConfigServer();
    } else {
      this.loadFromYmlFile();
    }
  }

  private loadFromYmlFile() {
    try {
      const configPath = join(process.cwd(), '.env.yml');
      console.log(`[ConfigService] Carregando configurações de: ${configPath}`);
      const yamlFile = readFileSync(configPath, 'utf8');
      this.config = yaml.parse(yamlFile);
      console.log('✔ Configurações locais (.env.yml) carregadas com sucesso.');
    } catch (error: any) {
      console.error('❌ Falha ao carregar configurações do .env.yml:', error.message);
      throw new Error('Não foi possível carregar configurações do arquivo .env.yml');
    }
  }

  private loadFromConfigServer() {
    console.log('[ConfigService] Carregando configurações das variáveis de ambiente para produção.');
    
    this.config = {
      database: {
        mongodb: {
          uri: process.env.DATABASE_MONGODB_URI,
          db_name: process.env.DATABASE_MONGODB_DB_NAME,
        },
        firebase: {
          api_key: process.env.DATABASE_FIREBASE_API_KEY,
        }
      }
    };

    if (!this.config.database?.mongodb?.uri) {
      console.warn('⚠️  A variável de ambiente DATABASE_MONGODB_URI não está definida para produção.');
    }
     console.log('✔ Configurações de produção carregadas com sucesso.');
  }

  // 2. Modificar o getInstance para usar o cache global
  public static getInstance(): ConfigService {
    // Se a instância já existe no cache global, retorne-a
    if (global.configServiceInstance) {
      return global.configServiceInstance;
    }
    
    // Se não, crie uma nova, armazene no global e retorne
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    global.configServiceInstance = ConfigService.instance;
    return ConfigService.instance;
  }
  
  public get<T = any>(key: string, defaultValue?: T): T {
    const keys = key.split('.');
    let result: any = this.config;

    for (const k of keys) {
      result = result ? result[k] : undefined;
      if (result === undefined) {
        return defaultValue as T;
      }
    }

    return result as T;
  }
}

export const configService = ConfigService.getInstance();