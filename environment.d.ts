declare global {
    namespace NodeJS {
        interface ProcessEnv {
            ALCHEMY_PROVIDER: string;
            PRIVATE_KEY: string;
        }
    }
}
export {}