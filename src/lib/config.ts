// Configuração para alternar entre Firebase e MongoDB
export const CONFIG = {
  // Defina como 'firebase' ou 'mongodb'
  DATABASE: process.env.NEXT_PUBLIC_DATABASE || 'mongodb',
  
  // Configurações do MongoDB
  MONGODB: {
    URI: process.env.MONGODB_URI,
    DB: process.env.MONGODB_DB,
  },
  
  // Configurações do Firebase (mantidas para compatibilidade)
  FIREBASE: {
    API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  }
};

// Função para verificar qual banco está sendo usado
export const isUsingMongoDB = () => CONFIG.DATABASE === 'mongodb';
export const isUsingFirebase = () => CONFIG.DATABASE === 'firebase';

// Função para obter o nome do banco atual
export const getCurrentDatabase = () => {
  return isUsingMongoDB() ? 'MongoDB' : 'Firebase';
};

// Função para verificar se as configurações estão corretas
export const validateConfig = () => {
  const errors: string[] = [];
  
  if (isUsingMongoDB()) {
    if (!CONFIG.MONGODB.URI) {
      errors.push('MONGODB_URI não configurada');
    }
  } else if (isUsingFirebase()) {
    if (!CONFIG.FIREBASE.API_KEY) {
      errors.push('FIREBASE_API_KEY não configurada');
    }
    if (!CONFIG.FIREBASE.PROJECT_ID) {
      errors.push('FIREBASE_PROJECT_ID não configurada');
    }
  } else {
    errors.push('DATABASE deve ser "mongodb" ou "firebase"');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 