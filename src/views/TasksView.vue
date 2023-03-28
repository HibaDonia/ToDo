<script lang="ts" setup>
import { ref, watch } from 'vue';
import TaskForm from '../components/TaskForm.vue';
import TaskDetails from '../components/TaskDetails.vue';
import TaskToDo from '../components/TaskToDo.vue';
import { ITask, TaskRepository } from '@/repositories/TaskRepository';
import Sortable from 'sortablejs';
import Hammer from 'hammerjs';

//const swipeThreshold = 50;
const taskRepo = new TaskRepository();

let isPopUpOpened = ref(false);
let isSwipeleft = ref(false);
let isPopUpOpenedForDisplay = ref(false);
let snackbar=ref(false);
let NotificationText=ref('');
let tasksDNDList: HTMLElement | null;
let tasksList: HTMLElement |null;
let tasksNewOrder = ref<string[]>([]);
let swipedItemId = ref<string | null| undefined>(null);
let isLoading=ref(false);
let tasks=ref<ITask[]>([]);
let taskId = ref<string | null>(null);


//get Hammer instance for each task litem
function setupHammerToListElements(): void {
    tasksList = document.getElementById('tasks');
    if(tasksList){
        const hammer = new Hammer(tasksList);
        hammer.on('swipeleft', (event) => {
            isSwipeleft.value=true;
            swipedItemId.value = event.target.closest('.swipe-item')?.getAttribute('data-id');
            /*
            if ((event.distance > swipeThreshold) && swipedItemId.value) {
                // Trigger remove item action for 'hard' swipe
                removeTask(swipedItemId.value);
            }
            */
        });

        hammer.on('swiperight', (event) => {
            isSwipeleft.value=false;
            /*
                swipedItemId.value = event.target.closest('.swipe-item')?.getAttribute('data-id');
                if ((event.distance > swipeThreshold) && swipedItemId.value) {
                    // Trigger edit action for 'hard' swipe
                    openTaskForEdit(swipedItemId.value);
                } else {
                // assign the isswipeLeft to false for simple swipe
                isSwipeleft.value=false;
                }
               */
        });
    }
}

// load tasks from repository
async function loadTasks():Promise<void>{
    try{
        isLoading.value=true;
        tasks.value  = await taskRepo.getTasks();
    }
    catch(err){
        NotificationText.value=(err as Error).message;
        snackbar.value=true;
    }finally{
        isLoading.value=false;
        tasksListDNDOptionsSetup();
        setupHammerToListElements();
    }

}

loadTasks();


// this function is called after closing the form for create/update task
function onClose(): void {
    if (taskId.value) {
        taskId.value = null;
    }
    isPopUpOpened.value = false;

}

function onSave(): void {
    if (taskId.value) {
        taskId.value = null;
    }
    isPopUpOpened.value = false;

    /*
    normally I don't use the below line also it's not a recommended to use it.
    but I had some issues in reloading the tasks when calling this function,
    I think it's related to the definition of the components,
    so just for simulate the expected behaviour I added it.
    */
    window.location.reload();

}

// to watch the open/close state for the taskForm and call the loadTasks function to load the tasks
watch(isPopUpOpened, (openState: boolean): void => {
    if (!openState) {
        void loadTasks();
    }
});


function onCloseTaskDetails(){
    if (taskId.value) {
        taskId.value = null;
    }
    isPopUpOpenedForDisplay.value = false;
}

function openTaskDetails(taskID: string): void {
    taskId.value = taskID;
    isPopUpOpenedForDisplay.value = true;
    if(isSwipeleft.value){
        isSwipeleft.value = false;
    }
}

function openTaskForEdit(taskIDForEdit: string): void{
    taskId.value = taskIDForEdit;
    isPopUpOpened.value = true;
    isSwipeleft.value = false;
}

async function removeTask(uid_task: string): Promise<void>{
    try{
        await taskRepo.removeTask(uid_task);
        NotificationText.value='Deleted successfully';
        snackbar.value=true;
        void loadTasks();
    }catch(err){
        NotificationText.value=(err as Error).message;
        snackbar.value=true;
    }
}

// get instance from the sortable and setup the (element and options)
function tasksListDNDOptionsSetup() {
    tasksDNDList = document.getElementById('tasks');
    if (tasksDNDList) {
        let sortable = new Sortable(tasksDNDList, {
            multiDrag: true,
            sort: true,
            forceFallback: true,
            scroll: true,
            scrollSensitivity: 30,
            scrollSpeed: 10,
            selectedClass: 'selected',
            animation: 150,
            filter: '.ignore-selection',
            onUpdate: function() {
                console.log('sortable.toArray()',sortable.toArray());
                tasksNewOrder.value = sortable.toArray();
                void SaveOrdering();
            },
        });
    }
}

// this function is to update the value of index in the task, to be used later if we want to keep the new ordering for the items
async function SaveOrdering() {
    if (!isLoading.value) {
        try {
            isLoading.value = true;
            for (let task of tasks.value) {
                try {

                    let taskNewIndex=tasksNewOrder.value.indexOf(task.id.toString());
                    await taskRepo.updateTaskIndex(task.id, taskNewIndex);
                } catch (err) {
                    NotificationText.value=(err as Error).message;
                    snackbar.value=true;
                }
            }
        } catch (err) {
            NotificationText.value=(err as Error).message;
            snackbar.value=true;
        } finally {
            isLoading.value = false;
        }
    }
}

</script>
<template>
  <div>
    <div class="row ma-2">
    <div class="col text-h6">ToDo List</div>
    <div class="col-2 text-right">
      <v-btn
        rounded
              icon
              color="primary"
              @click="isPopUpOpened=true"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
    </div>

    </div>
    <v-divider class="mb-2"></v-divider>
    <v-list id="tasks" rounded>
      <div class="row swipe-item" v-for="(task, idx) in tasks"
         :key="idx"
         :data-id="task.id">

        <v-list-item
         class="ma_lg col"
         active-color="primary"
         @click="openTaskDetails(task.id)"
         >
          <TaskToDo :task="task" />

        </v-list-item>
        <div class="col" v-if="(swipedItemId === task.id)&& isSwipeleft">
            <v-btn
              icon
              rounded
              color="primary"
              @click="openTaskForEdit(task.id)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              rounded
              color="primary"
              @click="removeTask(task.id)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
      </div>
    </v-list>

    <v-layout  align-center justify-center column fill-height v-if="isLoading">
            <v-flex row align-center>
                <v-progress-circular indeterminate :size="50" color="primary"></v-progress-circular>
            </v-flex>
    </v-layout>

    <TaskForm v-if="isPopUpOpened" :taskId="taskId" @close="onClose" @save="onSave"/>
    <TaskDetails v-if="isPopUpOpenedForDisplay" :taskId="taskId" @close="onCloseTaskDetails" />

    <v-snackbar
      v-model="snackbar"
      :timeout="2000"
    >
      {{ NotificationText }}
    </v-snackbar>

</div>
</template>

