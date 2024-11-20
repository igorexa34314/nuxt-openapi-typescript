<template>
	<div>Fully typed address</div>
	<div>{{ address }}</div>
</template>

<script lang="ts" setup>
import type { Schema } from 'openapi-schema-generated';

const address: Schema<'Address'> = {
	city: 'New York',
	street: 'Mountain View',
	zip: '10001',
};
</script>
