export const authStatusTranslations = {
  no: {
    greeting: 'Hei',
    logout: 'Logg ut',
    loginRegister: 'Logg inn/Registrer',
  },
  sv: {
    greeting: 'Hej',
    logout: 'Logga ut',
    loginRegister: 'Logga in/Registrera',
  },
} as const;

export type AuthStatusTranslations = typeof authStatusTranslations;
