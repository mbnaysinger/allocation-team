import * as yaml from 'yaml';
import { readFileSync } from 'fs';
import { join } from 'path';

// Aumenta o namespace global do Node.js para incluir nossa instância de serviço.
// Esta é a forma mais segura e robusta de fazer isso em TypeScript.
declare global {
  var configServiceInstance: ConfigService | undefined;
}

class ConfigService {
  private config: Record<string, any> = {};

  // O construtor permanece privado para garantir que seja um singleton.
  constructor() {
    console.log('[ConfigService] Inicializando...');
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

// --- Lógica de Instanciação HMR-Safe ---

// Se a instância ainda não existir no objeto global, crie uma nova e armazene-a lá.
if (!global.configServiceInstance) {
  global.configServiceInstance = new ConfigService();
}

// Exporta a instância única, seja ela nova ou do cache global.
export const configService = global.configServiceInstance;
