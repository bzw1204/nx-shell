import type { App, Component } from 'vue'
import IconButton from './icon-button/index.vue'
import SparklesText from './inspira/SparklesText.vue'
import TextGenerateEffect from './inspira/TextGenerateEffect.vue'
import TextHoverEffect from './inspira/TextHoverEffect.vue'
import NaiveProviderContent from './naive-provider-content'
import Settings from './settings/index.vue'
import SmileLoading from './smile-loading/index.vue'
import NxTerminal from './terminal/index.vue'
import ThemeToggle from './theme-toggle/index.vue'

export { IconButton, NaiveProviderContent, NxTerminal, Settings, SmileLoading, SparklesText, TextGenerateEffect, TextHoverEffect, ThemeToggle }

type ComponentWithName = Component & { name: string }
const components = [
  IconButton,
  NaiveProviderContent,
  SparklesText,
  SmileLoading,
  TextGenerateEffect,
  TextHoverEffect,
  ThemeToggle,
  Settings,
  NxTerminal
] as ComponentWithName[]

export type ComponentName =
  | 'IconButton'
  | 'NaiveProviderContent'
  | 'SmileLoading'
  | 'SparklesText'
  | 'TextGenerateEffect'
  | 'TextHoverEffect'
  | 'ThemeToggle'
  | 'Settings'
  | 'NxTerminal'
export default function install<T extends ComponentName = never>(app: App, names?: T[] | null) {
  if (names && names.length > 0) {
    // 按需安装组件
    names.forEach((name) => {
      const component = components.find(c => c.name === name)
      if (component) {
        app.component(component.name, component)
      }
    })
  } else {
    // 安装所有组件
    components.forEach((component) => {
      app.component(component.name, component)
    })
  }
}
