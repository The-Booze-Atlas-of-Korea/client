<template>
	<div>
		<InputText v-model="text"/>
		<Button label="Save"/>
		{{text}}
	</div>
</template>

<script setup>
import { Button, InputText } from 'primevue';
import { ref } from 'vue';

let text = ref("");
</script>

<style lang="css" scoped>
</style>