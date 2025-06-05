declare module 'nx-settings'{
  type Theme = 'light' | 'dark' | 'system'
  interface ISettings {
    theme: Theme
  }

}
