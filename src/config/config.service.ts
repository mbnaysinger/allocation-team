import * as yaml from 'yaml';
import { readFileSync } from 'fs';
import { join } from 'path';

// Aumenta o namespace global do Node.js para incluir nossa instância de serviço.
declare global {
  var configServiceInstance: ConfigService | undefined;
}

class ConfigService {
  private config: Record<string, any> = {};

  constructor() {
    console.log('[ConfigService] Inicializando...');
    // Usaremos NODE_ENV para decidir a estratégia de carregamento.
    // 'development' usará o arquivo local. 'production' (ou qualquer outro) usará o Config Server.
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
      this.loadFromYmlFile();
    } else {
      this.loadFromConfigServer();
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
    const configServerUrl = process.env.CONFIG_SERVER_URL;
    if (!configServerUrl) {
      console.error('❌ ERRO CRÍTICO: NODE_ENV não é "development" e CONFIG_SERVER_URL não está definida.');
      throw new Error('CONFIG_SERVER_URL não definida para este ambiente.');
    }

    console.log(`[ConfigService] Carregando configurações do Config Server: ${configServerUrl}`);
    try {
      // Usamos require aqui, dentro do método, para garantir que ele só seja
      // executado no lado do servidor e quando necessário.
      const request = require('sync-request');
      const response = request('GET', configServerUrl);
      this.config = yaml.parse(response.getBody('utf8'));
      console.log('✔ Configurações carregadas do Config Server com sucesso.');
    } catch (error: any) {
      console.error('❌ Falha ao carregar configurações do Config Server:', error.message);
      throw new Error('Não foi possível carregar configurações do Config Server');
    }
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
if (!global.configServiceInstance) {
  global.configServiceInstance = new ConfigService();
}

export const configService = global.configServiceInstance;
