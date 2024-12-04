<template>
  <div>
    <p v-for="(str, index) in dataFromApi" :key="index">
      {{ str }}
    </p>
  </div>
</template>

<script lang="ts" setup>
const dataFromApi = ref<string[]>([]);

onMounted(async () => {
  const { data } = await useApiRest<{ data: string[] }>('/endpoint');

  dataFromApi.value = data || [];
})
</script>
