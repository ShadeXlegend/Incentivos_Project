import { otherTasks, todayTasks, upcomingTasks } from "@src/pages/apps/tasks/List/data";
import { useState } from "react";
export default function useTaskList() {
  const [todayTask] = useState([...todayTasks]);
  const [upcomingTask] = useState([...upcomingTasks]);
  const [otherTask] = useState([...otherTasks]);
  const [selectedTask, setSelectedTask] = useState(todayTasks[0]);

  /**
   * Selects the task
   * @param {*} taks
   */
  const selectTask = task => {
    setSelectedTask(task);
  };
  return {
    todayTask,
    upcomingTask,
    otherTask,
    selectedTask,
    selectTask
  };
}