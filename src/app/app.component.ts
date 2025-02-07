import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

// Interface for Task structure
interface Task {
  name: string;
  duration: number; // in minutes
  isComplete: boolean;
  isActive: boolean;
  timeRemaining: number; // in seconds
  timerId: number; // for storing interval ID, 0 means no active timer
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  // Form inputs
  newTaskName: string = "";
  newTaskDuration: number = 1;

  // Task list
  tasks: Task[] = [];

  /**
   * Handles the form submission for creating a new task
   * Thought process:
   * 1. Validate input - ensure we have a non-empty task name and positive duration
   * 2. Create new task object with initial values
   * 3. Add task to array and reset form for next entry
   */
  onSubmit(): void {
    if (this.newTaskName.trim() && this.newTaskDuration > 0) {
      this.tasks.push({
        name: this.newTaskName,
        duration: this.newTaskDuration,
        isComplete: false,
        isActive: false,
        timeRemaining: this.newTaskDuration * 60, // convert to seconds
        timerId: 0,
      });

      // Reset form
      this.newTaskName = "";
      this.newTaskDuration = 1;
    }
  }

  /**
   * Toggles the timer state for a task between running and paused
   * Thought process:
   * 1. Check if task is already complete - if so, do nothing
   * 2. If timer is running (isActive):
   *    - Clear the interval to stop the countdown
   *    - Reset timer ID and active state
   * 3. If timer is stopped:
   *    - Start interval that decrements timeRemaining every second
   *    - When time runs out, mark task as complete
   * @param task The task to toggle timer for
   */
  toggleTimer(task: Task): void {
    if (task.isComplete) return;

    if (task.isActive) {
      // Pause timer
      if (task.timerId) {
        window.clearInterval(task.timerId);
        task.timerId = 0;
      }
      task.isActive = false;
    } else {
      // Start timer
      task.isActive = true;
      task.timerId = window.setInterval(() => {
        if (task.timeRemaining > 0) {
          task.timeRemaining--;
        } else {
          this.completeTask(task);
        }
      }, 1000);
    }
  }

  /**
   * Marks a task as complete and cleans up its timer
   * Thought process:
   * 1. If timer is running, stop it by clearing interval
   * 2. Update task state: complete=true, active=false, no time remaining
   * @param task The task to complete
   */
  completeTask(task: Task): void {
    if (task.timerId) {
      window.clearInterval(task.timerId);
      task.timerId = 0;
    }
    task.isComplete = true;
    task.isActive = false;
  }

  /**
   * Removes a task from the list and cleans up its timer
   * Thought process:
   * 1. Get task reference from index
   * 2. If timer is running, clean it up first
   * 3. Remove task from array using splice
   * @param index The array index of task to delete
   */
  deleteTask(index: number): void {
    const task = this.tasks[index];
    if (task.timerId) {
      window.clearInterval(task.timerId);
    }
    this.tasks.splice(index, 1);
  }

  /**
   * Converts seconds into mm:ss format with leading zeros
   * Thought process:
   * 1. Calculate minutes by dividing seconds by 60 (floor to remove remainder)
   * 2. Calculate remaining seconds using modulo
   * 3. Convert both to strings with leading zeros
   * 4. Return formatted string
   * @param seconds Total number of seconds to format
   * @returns Formatted time string in mm:ss format
   */
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    // Convert minutes and seconds to strings with leading zeros
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

    // Return time in mm:ss format
    return `${formattedMinutes}:${formattedSeconds}`;
  }

  /**
   * Calculates total time spent across all tasks
   * Thought process:
   * 1. Initialize total seconds counter
   * 2. For each task:
   *    - Convert original duration to seconds
   *    - Subtract remaining time to get time spent
   *    - Add to total
   * 3. Convert total seconds to hours, minutes, seconds
   * 4. Format with leading zeros in hh:mm:ss format
   * @returns Formatted string of total time spent
   */
  getTotalTimeSpent(): string {
    // Calculate total seconds spent across all tasks
    let totalSeconds = 0;

    // Loop through each task
    for (const task of this.tasks) {
      // Convert task duration from minutes to seconds
      const taskSeconds = task.duration * 60;

      // Add the time spent on this task (total time minus remaining time)
      const timeSpentOnTask = taskSeconds - task.timeRemaining;
      totalSeconds += timeSpentOnTask;
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Convert each time unit to 2-digit strings (e.g. "01" instead of "1")
    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");

    // Return time in hh:mm:ss format
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
}
