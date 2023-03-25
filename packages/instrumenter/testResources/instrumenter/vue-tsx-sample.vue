<template>
  <div class="test">
    <h1>Hello</h1>
  </div>
</template>
<script lang="tsx">
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator'
@Component({
  name: 'example-tsx-component',
})
export default class AuditDrawerInfo extends Vue {
  public renderFunction = (h, context) => {
    return (
      <button>button</button>
    )
  }
}
</script>
<style lang="scss">
</style>