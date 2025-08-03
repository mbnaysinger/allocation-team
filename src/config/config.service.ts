class ConfigService {
  /**
   * Busca um valor de configuração das variáveis de ambiente.
   * As chaves são convertidas para o formato de variável de ambiente (maiúsculas e com sublinhados).
   * Ex: 'database.mongodb.uri' se torna 'DATABASE_MONGODB_URI'.
   *
   * @param key A chave da configuração (ex: 'database.mongodb.uri')
   * @param defaultValue Um valor padrão a ser retornado se a variável de ambiente não for encontrada.
   * @returns O valor da configuração ou o valor padrão.
   */
  public get<T>(key: string, defaultValue?: T): T {
    const envVarName = key.toUpperCase().replace(/\./g, '_');
    const envValue = process.env[envVarName];

    if (envValue !== undefined) {
      return envValue as unknown as T;
    }

    if (defaultValue !== undefined) {
      return defaultValue;
    }
    
    throw new Error(`A variável de ambiente para a chave '${key}' (esperada como '${envVarName}') não foi definida e nenhum valor padrão foi fornecido.`);
  }
}

export const configService = new ConfigService();
