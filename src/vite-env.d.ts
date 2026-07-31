/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AYC_ENVIRONMENT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
