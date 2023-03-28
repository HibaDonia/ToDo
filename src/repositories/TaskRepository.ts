import {v4 as uuid} from 'uuid';

export interface ITask {
    id: string;
    title: string;
    description: string;
    date: string;
    index:number;
  }

export interface ITaskForCreateOrUpdate {
    title: string;
    description: string;
  }

export interface ITasks {
    tasks: ITask[];
  }

export class TaskRepository{

      private tasks: ITask[] = [];

      constructor() {

          const tasks = localStorage.getItem('tasks');
          if (tasks) {
              this.tasks = JSON.parse(tasks);
          }


      }

      // Get Tasks ordered by date and time
      public async getTasks(): Promise<ITask[]> {

          return this.tasks.sort((a, b) => {
              const date1: Date = new Date(a.date);
              const date2: Date = new Date(b.date);
              return date1.getTime() - date2.getTime();
          });
      }

      // Get one Task by id
      public async getTaskById(uid_task: string): Promise<ITask|null> {
          const index = this.tasks.findIndex((t) => t.id === uid_task);
          if (index !== -1) {
              return this.tasks[index];
          }else{
              return null;
          }
      }

      // create new task
      public async addTask(task: ITaskForCreateOrUpdate): Promise<void> {
          const newTask: ITask = {
              id:uuid(),
              date:new Date().toLocaleString('de-DE', { month: '2-digit', day: '2-digit', year: 'numeric',
                  hour:'2-digit',minute:'2-digit' }),
              title:task.title,
              description:task.description,
              index:0,
          };
          this.tasks.push(newTask);
          localStorage.setItem('tasks', JSON.stringify(this.tasks));
      }


      // update existing task
      public async updateTask(uid_task: string, task: ITaskForCreateOrUpdate): Promise<void> {
          const index = this.tasks.findIndex((t) => t.id === uid_task);
          if (index !== -1) {
              const updatedTask:ITask={
                  id:uid_task,
                  date:new Date().toLocaleString('de-DE', { month: '2-digit', day: '2-digit', year: 'numeric',
                      hour:'2-digit',minute:'2-digit' }),
                  title:task.title,
                  description:task.description,
                  index:this.tasks[index].index,
              };
              this.tasks[index] = updatedTask;
              localStorage.setItem('tasks', JSON.stringify(this.tasks));
          }
      }

      public async removeTask(uid_task: string): Promise<void> {
          this.tasks = this.tasks.filter((t) => t.id !== uid_task);
          localStorage.setItem('tasks', JSON.stringify(this.tasks));
      }

      // update task Description
      public async updateTaskDescription(uid_task: string, newDescription: string): Promise<void> {
          const index = this.tasks.findIndex((t) => t.id === uid_task);
          if (index !== -1) {
              this.tasks[index].description = newDescription;
              localStorage.setItem('tasks', JSON.stringify(this.tasks));
          }
      }

      // update task Index when changing the sort by dragging the item to a new place
      public async updateTaskIndex(uid_task: string, task_index: number): Promise<void> {
          const index = this.tasks.findIndex((t) => t.id === uid_task);
          if (index !== -1) {
              this.tasks[index].index = task_index;
              localStorage.setItem('tasks', JSON.stringify(this.tasks));
          }

      }



}