
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Grip, Paperclip, Link as LinkIcon, MessageCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { InlineTaskEditor } from './InlineTaskEditor';
import { TimelineItem } from '@/types/timeline';

interface TimelineTaskData {
  id: string;
  title: string;
  description: string;
  assignee_name: string | null;
  phase: string;
  start: string | null;
  completed: boolean;
  is_overdue: boolean;
  priority: string;
  x: number;
  y: number;
  width: number;
  height: number;
  attachment_url?: string | null;
  link_url?: string | null;
  comment_count?: number;
  is_sticky?: boolean;
}

interface TimelineTaskProps {
  task: TimelineTaskData;
  isDragged: boolean;
  colors: Record<string, string>;
  phaseColors: Record<string, string>;
  onPointerDown: (e: React.PointerEvent, task: TimelineTaskData) => void;
  onDoubleClick: (task: TimelineTaskData) => void;
  onUpdateTask: (task: TimelineItem, newTitle: string) => void;
}

export const TimelineTask = ({
  task,
  isDragged,
  colors,
  phaseColors,
  onPointerDown,
  onDoubleClick,
  onUpdateTask
}: TimelineTaskProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const getTaskColor = () => {
    if (task.completed) return colors.completed;
    if (task.is_overdue) return '#ef4444';
    return colors[task.priority as keyof typeof colors] || phaseColors[task.phase as keyof typeof phaseColors];
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleSave = (newTitle: string) => {
    onUpdateTask(task as TimelineItem, newTitle);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div
        className="absolute rounded-lg shadow-md transition-all duration-200 z-50 bg-white"
        style={{
          left: task.x,
          top: task.y,
          width: task.width,
          height: 'auto',
        }}
      >
        <InlineTaskEditor task={task as TimelineItem} onSave={handleSave} onCancel={handleCancel} />
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`absolute rounded-lg shadow-md cursor-move transition-all duration-200 ${
            isDragged ? 'z-50 shadow-xl scale-105' : 'hover:shadow-lg hover:scale-102'
          } ${task.completed ? 'opacity-60' : ''}`}
          style={{
            left: task.x,
            top: task.y,
            width: task.width,
            height: task.height,
            backgroundColor: getTaskColor()
          }}
          onPointerDown={(e) => onPointerDown(e, task)}
          onDoubleClick={handleDoubleClick}
        >
          <div className="p-2 h-full flex flex-col justify-between text-white text-xs">
            <div className="flex items-start justify-between">
              <div className="flex-1 mr-1">
                <div className="font-semibold truncate">{task.title}</div>
                {task.assignee_name && (
                  <div className="text-xs opacity-80 truncate">{task.assignee_name}</div>
                )}
              </div>
              <Grip className="h-3 w-3 opacity-60 flex-shrink-0" />
            </div>

            <div className="flex justify-between items-end">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="px-1 py-0 text-xs bg-white/20 text-white border-white/30"
                >
                  {task.phase}
                </Badge>
                {task.attachment_url && <Paperclip className="h-3 w-3" />}
                {task.link_url && <LinkIcon className="h-3 w-3" />}
                {task.comment_count && task.comment_count > 0 && <MessageCircle className="h-3 w-3" />}
              </div>
              {task.start && (
                <div className="text-xs opacity-80">
                  {format(new Date(task.start), 'dd.MM.yyyy', { locale: de })}
                </div>
              )}
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">
        <div className="space-y-1">
          {task.description && <p className="text-xs">{task.description}</p>}
          {task.start && (
            <p className="text-xs">
              Fällig am {format(new Date(task.start), 'dd.MM.yyyy', { locale: de })}
            </p>
          )}
          <p className="text-xs">Priorität: {task.priority}</p>
          {task.attachment_url && <a href={task.attachment_url} target="_blank" rel="noreferrer" className="text-xs text-blue-400">Anhang anzeigen</a>}
          {task.link_url && <a href={task.link_url} target="_blank" rel="noreferrer" className="text-xs text-blue-400">Link öffnen</a>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
