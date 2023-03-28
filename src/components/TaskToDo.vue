<script lang="ts" setup>
import { defineProps, toRef } from 'vue';
import {ITask} from '@/repositories/TaskRepository';
const taskProp = defineProps<{ task: ITask }>();
const task = toRef(taskProp, 'task');
</script>
<template>
        <v-list-item-content class="ma-2">
                            <v-list-item-title>{{ task.title }}</v-list-item-title>
                            <v-list-item-subtitle class="mt-2">{{ task.date }}</v-list-item-subtitle>
                </v-list-item-content>

</template>