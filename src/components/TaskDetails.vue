<script  lang="ts" setup>
import { ref, defineEmits, defineProps,toRef,watch } from 'vue';
import {ITask, TaskRepository} from '@/repositories/TaskRepository';

const title='Task Details';
const taskRepo = new TaskRepository();
const taskProps = defineProps<{ taskId: string|null}>();
const taskId = toRef(taskProps, 'taskId');

let emit = defineEmits(['close']);
let isOpen =ref(true);
let isLoading=ref(false);
let task = ref<ITask>({
    id: '',
    title: '',
    description: '',
    date: '',
    index:0,
});

async function getTaskDetails():Promise<void>{
    if(! taskId.value){
        throw new Error('task id is missing');
    }
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

void getTaskDetails();

watch(isOpen, (openState: boolean): void => {
    if (!openState) {
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
      >
        <v-card>
            <v-toolbar
            dark
            color="primary"
          >
            <v-btn
              icon
              dark
              @click="isOpen= false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
            </v-toolbar>
            <v-card>
              <v-card-title>{{ title }}</v-card-title>
              <v-card-text>
                <v-text-field
                  v-model.trim="task.title"
                  label="Title"
                  readonly
                  clear-icon="mdi-close-circle"
                 ></v-text-field>
                 <v-textarea
                   v-model.trim="task.description"
                   label="Description"
                   readonly
                   auto-grow
                   clear-icon="mdi-close-circle"
                 ></v-textarea>
              </v-card-text>
              <v-layout  align-center justify-center column fill-height v-if="isLoading">
                 <v-flex row align-center>
                   <v-progress-circular indeterminate :size="50" color="primary"></v-progress-circular>
                </v-flex>
             </v-layout>
            </v-card>
        </v-card>
      </v-dialog>
    </v-row>
    </template>
