import * as yaml from 'yaml';
import { readFileSync } from 'fs';
import { join } from 'path';

declare global {
  var configServiceInstance: ConfigService | undefined;
}

class ConfigService {
  private config: Record<string, unknown> = {};
  private initializationPromise: Promise<void>;

  constructor() {
    console.log('[ConfigService] Inicializando...');
    this.initializationPromise = this.initialize();
  }
  
  private async initialize(): Promise<void> {
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
      this.loadFromYmlFile();
    } else {
      await this.loadFromConfigServer();
    }
  }

  private loadFromYmlFile() {
    try {
      const configPath = join(process.cwd(), '.env.yml');
      console.log(`[ConfigService] Carregando configurações de: ${configPath}`);
      const yamlFile = readFileSync(configPath, 'utf8');
      const parsedConfig = yaml.parse(yamlFile);
      if (typeof parsedConfig === 'object' && parsedConfig !== null) {
        this.config = parsedConfig as Record<string, unknown>;
      } else {
        throw new Error('Arquivo .env.yml não é um objeto válido.');
      }
      console.log('✔ Configurações locais (.env.yml) carregadas com sucesso.');
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ Falha ao carregar configurações do .env.yml:', error.message);
      } else {
        console.error('❌ Falha ao carregar configurações do .env.yml:', error);
      }
      throw new Error('Não foi possível carregar configurações do arquivo .env.yml');
    }
  }

  private async loadFromConfigServer() {
    const configServerUrl = process.env.CONFIG_SERVER_URL;
    if (!configServerUrl) {
      console.warn('⚠️ CONFIG_SERVER_URL não definida. As configurações serão buscadas diretamente das variáveis de ambiente do sistema.');
      return; // Não lança erro, permite fallback para process.env no método get
    }

    console.log(`[ConfigService] Carregando configurações do Config Server: ${configServerUrl}`);
    try {
      // Importação dinâmica para 'sync-request'
      const { default: request } = await import('sync-request');
      const response = request('GET', configServerUrl);
      const parsedConfig = yaml.parse(response.getBody('utf8'));
       if (typeof parsedConfig === 'object' && parsedConfig !== null) {
        this.config = parsedConfig as Record<string, unknown>;
      } else {
        throw new Error('Resposta do Config Server não é um objeto válido.');
      }
      console.log('✔ Configurações carregadas do Config Server com sucesso.');
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ Falha ao carregar configurações do Config Server:', error.message);
      } else {
        console.error('❌ Falha ao carregar configurações do Config Server:', error);
      }
      throw new Error('Não foi possível carregar configurações do Config Server');
    }
  }
  
  private async ensureInitialized(): Promise<void> {
    await this.initializationPromise;
  }

  public async get<T>(key: string, defaultValue?: T): Promise<T> {
    await this.ensureInitialized();
    
    // Tenta buscar da configuração carregada (yml ou config server)
    const keys = key.split('.');
    let result: unknown = this.config;

    for (const k of keys) {
      if (typeof result === 'object' && result !== null && k in result) {
        result = (result as Record<string, unknown>)[k];
      } else {
        result = undefined; // Não encontrado na configuração carregada
        break;
      }
    }

    // Se não encontrado na configuração carregada, tenta buscar do process.env
    if (result === undefined) {
      const envVarName = key.toUpperCase().replace(/\./g, '_');
      const envValue = process.env[envVarName];
      if (envValue !== undefined) {
        return envValue as T;
      }
    }

    // Retorna o valor encontrado ou o defaultValue
    return (result !== undefined ? result : defaultValue) as T;
  }
}

// --- Lógica de Instanciação HMR-Safe ---
if (!global.configServiceInstance) {
  global.configServiceInstance = new ConfigService();
}

export const configService = global.configServiceInstance;
