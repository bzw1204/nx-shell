import {
  NDialogProvider,
  NGlobalStyle,
  NLoadingBarProvider,
  NMessageProvider,
  NModalProvider,
  NNotificationProvider,
  useDialog,
  useLoadingBar,
  useMessage,
  useModal,
  useNotification
} from 'naive-ui'
import { defineComponent } from 'vue'

const RegisterNaiveTools = defineComponent({
  name: 'RegisterNaiveTools',
  setup() {
    window.$loadingBar = useLoadingBar()
    window.$dialog = useDialog()
    window.$message = useMessage()
    window.$notification = useNotification()
    window.$modal = useModal()
  },
  render: () => null
})

export default defineComponent({
  name: 'NaiveProviderContent',
  props: {
    showGlobalStyle: {
      type: Boolean,
      default: true
    }
  },
  components: { RegisterNaiveTools },
  setup() {
    const showSpin = ref(true)
    window.$spin = {
      start: () => (showSpin.value = true),
      end: () => (showSpin.value = false)
    }
  },
  render() {
    return (
      <NLoadingBarProvider>
        <NDialogProvider>
          <NModalProvider>
            <NNotificationProvider>
              <NMessageProvider>
                {this.$props.showGlobalStyle ? <NGlobalStyle /> : null}
                {this.$slots.default?.()}
              </NMessageProvider>
            </NNotificationProvider>
          </NModalProvider>
        </NDialogProvider>
      </NLoadingBarProvider>
    )
  }
})
