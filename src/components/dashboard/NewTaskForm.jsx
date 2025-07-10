import React, { useState } from "react";
import { PlusCircle, Calendar, Flag } from "lucide-react";
import GlassCard from "../GlassCard";
import GlassInput from "../GlassInput";
import GlassButton from "../GlassButton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function NewTaskForm({ onSubmit }) {
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriorityChange = (value) => {
    setNewTask((prev) => ({ ...prev, priority: value }));
  };

  const handleDateChange = (date) => {
    setNewTask((prev) => ({ ...prev, due_date: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.title) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...newTask,
        status: "pending",
      });
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        due_date: null,
      });
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassCard className="p-5">
      <h3 className="text-lg font-semibold text-white mb-4">Add New Task</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <GlassInput
          name="title"
          value={newTask.title}
          onChange={handleChange}
          placeholder="Task title"
          required
        />
        
        <Textarea
          name="description"
          value={newTask.description}
          onChange={handleChange}
          placeholder="Description (optional)"
          className="h-20 resize-none backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/30"
        />
        
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[120px]">
            <Select value={newTask.priority} onValueChange={handlePriorityChange}>
              <SelectTrigger className="backdrop-blur-md bg-white/10 border border-white/20 text-white focus:ring-white/30">
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  <SelectValue placeholder="Priority" />
                </div>
              </SelectTrigger>
              <SelectContent className="backdrop-blur-md bg-white/10 border border-white/20">
                <SelectItem value="low" className="text-emerald-400">Low</SelectItem>
                <SelectItem value="medium" className="text-amber-400">Medium</SelectItem>
                <SelectItem value="high" className="text-rose-400">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 min-w-[120px]">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md backdrop-blur-md bg-white/10 border border-white/20 text-white",
                    "hover:bg-white/20 transition-colors",
                    !newTask.due_date && "text-white/60"
                  )}
                >
                  <Calendar className="w-4 h-4" />
                  {newTask.due_date ? format(newTask.due_date, "PPP") : "Due date"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-0 backdrop-blur-md bg-white/10 border border-white/20" align="start">
                <CalendarComponent
                  mode="single"
                  selected={newTask.due_date}
                  onSelect={handleDateChange}
                  initialFocus
                  className="rounded-md border-0"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <GlassButton 
          type="submit" 
          variant="success" 
          className="w-full"
          disabled={isSubmitting}
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          {isSubmitting ? "Adding..." : "Add Task"}
        </GlassButton>
      </form>
    </GlassCard>
  );
}