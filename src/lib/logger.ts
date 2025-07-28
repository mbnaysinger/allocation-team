// Logger simplificado para funcionar no cliente e servidor
const isClient = typeof window !== 'undefined';

// Tipos para os dados de log
type LogData = Record<string, unknown>;
type ErrorData = string | Error | unknown;

// Logger para operações transacionais
export const transactionLogger = {
  // Log de início de transação
  startTransaction: (operation: string, data?: LogData) => {
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const logData = {
      type: 'TRANSACTION_START',
      transactionId,
      operation,
      data,
      timestamp: new Date().toISOString(),
    };
    
    if (isClient) {
      console.log('🔵 [TRANSACTION_START]', logData);
    } else {
      console.log('🔵 [TRANSACTION_START]', JSON.stringify(logData, null, 2));
    }
    
    return transactionId;
  },

  // Log de sucesso da transação
  successTransaction: (transactionId: string, operation: string, result?: LogData) => {
    const logData = {
      type: 'TRANSACTION_SUCCESS',
      transactionId,
      operation,
      result,
      timestamp: new Date().toISOString(),
    };
    
    if (isClient) {
      console.log('🟢 [TRANSACTION_SUCCESS]', logData);
    } else {
      console.log('🟢 [TRANSACTION_SUCCESS]', JSON.stringify(logData, null, 2));
    }
  },

  // Log de erro da transação
  errorTransaction: (transactionId: string, operation: string, error: ErrorData) => {
    const logData = {
      type: 'TRANSACTION_ERROR',
      transactionId,
      operation,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    };
    
    if (isClient) {
      console.error('🔴 [TRANSACTION_ERROR]', logData);
    } else {
      console.error('🔴 [TRANSACTION_ERROR]', JSON.stringify(logData, null, 2));
    }
  },

  // Log de operações específicas
  logOperation: (operation: string, data?: LogData) => {
    const logData = {
      type: 'OPERATION',
      operation,
      data,
      timestamp: new Date().toISOString(),
    };
    
    if (isClient) {
      console.log('🟡 [OPERATION]', logData);
    } else {
      console.log('🟡 [OPERATION]', JSON.stringify(logData, null, 2));
    }
  },

  // Log de debug
  debug: (message: string, data?: LogData) => {
    const logData = {
      type: 'DEBUG',
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    
    if (isClient) {
      console.debug('🔍 [DEBUG]', logData);
    } else {
      console.debug('🔍 [DEBUG]', JSON.stringify(logData, null, 2));
    }
  },

  // Log de erro geral
  error: (message: string, error?: ErrorData) => {
    const logData = {
      type: 'ERROR',
      message,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    };
    
    if (isClient) {
      console.error('❌ [ERROR]', logData);
    } else {
      console.error('❌ [ERROR]', JSON.stringify(logData, null, 2));
    }
  },
};

// Logger padrão para compatibilidade
const logger = {
  info: (data: LogData) => {
    if (isClient) {
      console.log('ℹ️ [INFO]', data);
    } else {
      console.log('ℹ️ [INFO]', JSON.stringify(data, null, 2));
    }
  },
  error: (data: LogData) => {
    if (isClient) {
      console.error('❌ [ERROR]', data);
    } else {
      console.error('❌ [ERROR]', JSON.stringify(data, null, 2));
    }
  },
  debug: (data: LogData) => {
    if (isClient) {
      console.debug('🔍 [DEBUG]', data);
    } else {
      console.debug('🔍 [DEBUG]', JSON.stringify(data, null, 2));
    }
  },
};

export default logger; 