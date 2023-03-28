<script  lang="ts" setup>
import { ref, defineEmits, defineProps,toRef,watch } from 'vue';
import {ITaskForCreateOrUpdate, TaskRepository} from '@/repositories/TaskRepository';

const taskProp = defineProps<{ taskId: string | null }>();
const taskId = toRef(taskProp, 'taskId');
const taskRepo = new TaskRepository();
const emit = defineEmits(['close', 'save']);
const titleRules = [
    (value: string) => !!value || 'Task title is required',
    (value: string) => (value && value.length <= 10) || 'Task title must be less than 10 characters',
    (value: string) => value && /\S/.test(value) || 'Task title must not be empty or contain only spaces',
];

const DescriptionRules=[
    (value: string) => !!value || 'Task Description is required',
    (value: string) => (value && value.length <= 1000) || 'Task Description must be less than 1000 characters',
    (value: string) => value && /\S/.test(value) || 'Task Description must not be empty or contain only spaces',
];
let isFormValid=ref(false);
let title='New Task';
let buttonName='Create';
let isOpen =ref(true);
let snackbar=ref(false);
let NotificationText=ref('');
let isLoading=ref(false);
let isEdit = !!taskId.value;

let task = ref<ITaskForCreateOrUpdate>({
    title: '',
    description: '',
});

async function getTaskForEditing():Promise<void>{
    try{
        isLoading.value=true;
        let returnedTask = await taskRepo.getTaskById(taskId.value as string);
        if(returnedTask){
            task.value=returnedTask;
        }
    }
    catch(err){
        console.log(err);
    }
    finally{
        isLoading.value=false;
    }
}

if(isEdit){
    title ='Edit Task';
    buttonName ='Save';
    getTaskForEditing();
}

async function onSave(){

    try {
        if (!isFormValid.value) {
            throw new Error('The Form is not valid');
        }
        if (isEdit) {
            if (!taskId.value) {
                throw new Error('Task ID is missing');
            }
            await taskRepo.updateTask(taskId.value, task.value);
            NotificationText.value='Updated successfully';
            snackbar.value=true;
        }else {
            await  taskRepo.addTask(task.value);
            NotificationText.value='Created successfully';
            snackbar.value=true;
        }
        emit('save');
        isOpen.value = false;
    }
    catch (err) {
        NotificationText.value=(err as Error).message;
        snackbar.value=true;
    }


}

watch(isOpen, (openState: boolean): void => {
    if (!openState) {
        NotificationText.value='';
        emit('close');
    }
});

</script>
  <template>

<v-row justify="center">
      <v-dialog
        v-model="isOpen"
        fullscreen
        :scrim="false"
        transition="dialog-bottom-transition"
        @before-close.prevent="!isFormValid"
      >
        <v-card>
          <v-toolbar
            dark
            color="primary"
          >
            <v-btn
              icon
              dark
              @click="isOpen = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
          </v-toolbar>



      <v-card>
        <v-card-title>{{ title }}</v-card-title>
        <v-card-text>
          <v-form
          v-model="isFormValid"
          >
            <v-text-field
              v-model.trim="task.title"
              label="Title"
              autofocus
              clearable
              clear-icon="mdi-close-circle"
              required
              :rules="titleRules"
            ></v-text-field>
            <v-textarea
              v-model.trim="task.description"
              label="Description"
              required
              clearable
              auto-grow
              :rules="DescriptionRules"
              clear-icon="mdi-close-circle"
            ></v-textarea>
            <v-card-actions>
              <v-btn class="mb-2" color="primary" @click="onSave">{{ buttonName }}</v-btn>
            </v-card-actions>
          </v-form>
          <v-snackbar
      v-model="snackbar"
      :timeout="2000"
    >
      {{ NotificationText }}
    </v-snackbar>
        </v-card-text>
      </v-card>
      <v-layout  align-center justify-center column fill-height v-if="isLoading">
                 <v-flex row align-center>
                   <v-progress-circular indeterminate :size="50" color="primary" ></v-progress-circular>
                </v-flex>
             </v-layout>
        </v-card>
      </v-dialog>
    </v-row>

    </template>
