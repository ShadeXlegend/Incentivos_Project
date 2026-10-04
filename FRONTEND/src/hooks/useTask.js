import { useState } from "react";
export default function useTask(task) {
  const [completed, setCompleted] = useState(task.stage === "Done");

  /*
   * mark completd on selected task
   */
  const markCompleted = (e, callback) => {
    setCompleted(e.target.checked);
    if (callback) callback(task);
  };
  return {
    completed,
    markCompleted
  };
}