// custom.d.ts
declare module "my-globals" {
    interface Window {
      OnGoogleLibraryLoad: () => void;
    }
  }
  