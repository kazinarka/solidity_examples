declare global {
    namespace NodeJS {
        interface ProcessEnv {
            ALCHEMY_PROVIDER: string;
        }
    }
}
export {}