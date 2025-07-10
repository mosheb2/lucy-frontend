import React from 'react';
import StudioPanel from '../StudioPanel';
import ActionButton from '../ActionButton';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';

export default function TaskList({ tasks, onNewTask }) {
  return (
    <StudioPanel className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Up Next</h3>
        <ActionButton onClick={onNewTask} size="sm" variant="secondary">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </ActionButton>
      </div>
      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center p-2 rounded-lg hover:bg-slate-50">
            <Checkbox id={`task-${task.id}`} className="mr-3" />
            <label htmlFor={`task-${task.id}`} className="flex-1 text-slate-800 font-medium cursor-pointer">
              {task.title}
            </label>
            <div className="text-xs text-slate-400">{task.dueDate}</div>
          </div>
        ))}
      </div>
    </StudioPanel>
  );
}