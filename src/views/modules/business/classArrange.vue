<template>
  <div class="block">
    <el-slider
      v-model="value"
      range
      show-stops
      :step="0.5"
      :marks="marks"
      :min="9"
      :max="12.5">
    </el-slider>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        value: [9, 10],
        marks: {
          9: '9:00',
          9.5: '9:30',
          10: '10:00',
          11: '11:00',
          12: '12:00',
          13: '13:00',
          14: '14:00',
          15: '15:00',
          16: '16:00',
          17: '17:00',
          18: '18:00',
          19: '19:00'
        }
      }
    }
  }
</script>

<style scoped>

</style>
