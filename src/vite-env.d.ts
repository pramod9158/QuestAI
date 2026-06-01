/// <reference types="vite/client" />
/// <reference types="@types/react" />
/// <reference types="@types/react-dom" />

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}
