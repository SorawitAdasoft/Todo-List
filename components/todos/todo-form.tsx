import * as React from 'react';
import { X, Plus } from 'lucide-react';
import { CreateTodoDto, UpdateTodoDto, Todo, Priority } from '@/lib/db/types';
import { toDateInputValue, fromDateInputValue } from '@/lib/date';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectOption } from '@/components/ui/select';
import { TagBadge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export interface TodoFormProps {
  todo?: Todo;
  onSubmit: (data: CreateTodoDto | UpdateTodoDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

const priorityOptions: SelectOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
];

const TodoForm: React.FC<TodoFormProps> = ({
  todo,
  onSubmit,
  onCancel,
  isLoading = false,
  className
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = React.useState({
    title: todo?.title || '',
    notes: todo?.notes || '',
    dueDate: todo?.dueDate ? toDateInputValue(todo.dueDate) : '',
    priority: todo?.priority || 'normal' as Priority,
    tags: todo?.tags || [],
  });
  const [newTag, setNewTag] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const isEditing = Boolean(todo);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.dueDate) {
      const selectedDate = new Date(formData.dueDate);
      if (isNaN(selectedDate.getTime())) {
        newErrors.dueDate = 'Invalid date format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isLoading) {
      return;
    }

    const submitData = {
      title: formData.title.trim(),
      notes: formData.notes.trim() || undefined,
      dueDate: formData.dueDate ? fromDateInputValue(formData.dueDate) : undefined,
      priority: formData.priority,
      tags: formData.tags,
    };

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Failed to submit todo:', error);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Title */}
      <div className=\"space-y-2\">
        <Label htmlFor=\"title\" required>
          {t('todo.title')}
        </Label>
        <Input
          id=\"title\"
          value={formData.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          placeholder=\"Enter todo title...\"
          disabled={isLoading}
          className={errors.title ? 'border-destructive' : ''}
          autoFocus
        />
        {errors.title && (
          <p className=\"text-sm text-destructive\">{errors.title}</p>
        )}
      </div>

      {/* Notes */}
      <div className=\"space-y-2\">
        <Label htmlFor=\"notes\">
          {t('todo.notes')}
        </Label>
        <Textarea
          id=\"notes\"
          value={formData.notes}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          placeholder=\"Add notes or description...\"
          disabled={isLoading}
          rows={3}
        />
      </div>

      {/* Due Date and Priority */}
      <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
        {/* Due Date */}
        <div className=\"space-y-2\">
          <Label htmlFor=\"dueDate\">
            {t('todo.dueDate')}
          </Label>
          <Input
            id=\"dueDate\"
            type=\"date\"
            value={formData.dueDate}
            onChange={(e) => handleFieldChange('dueDate', e.target.value)}
            disabled={isLoading}
            className={errors.dueDate ? 'border-destructive' : ''}
          />
          {errors.dueDate && (
            <p className=\"text-sm text-destructive\">{errors.dueDate}</p>
          )}
        </div>

        {/* Priority */}
        <div className=\"space-y-2\">
          <Label htmlFor=\"priority\">
            {t('todo.priority')}
          </Label>
          <Select
            id=\"priority\"
            options={priorityOptions.map(option => ({
              ...option,
              label: t(`priority.${option.value}`)
            }))}
            value={formData.priority}
            onChange={(value) => handleFieldChange('priority', value as Priority)}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Tags */}
      <div className=\"space-y-2\">
        <Label htmlFor=\"tags\">
          {t('todo.tags')}
        </Label>
        
        {/* Existing tags */}
        {formData.tags.length > 0 && (
          <div className=\"flex flex-wrap gap-2 p-3 border rounded-md bg-muted/50\">
            {formData.tags.map((tag) => (
              <TagBadge
                key={tag}
                tag={tag}
                removable
                onRemove={() => handleRemoveTag(tag)}
              />
            ))}
          </div>
        )}
        
        {/* Add new tag */}
        <div className=\"flex space-x-2\">
          <Input
            id=\"tags\"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder=\"Add tag...\"
            disabled={isLoading}
          />
          <Button
            type=\"button\"
            variant=\"outline\"
            size=\"icon\"
            onClick={handleAddTag}
            disabled={!newTag.trim() || isLoading}
          >
            <Plus className=\"h-4 w-4\" />
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className=\"flex justify-end space-x-3 pt-4 border-t\">
        <Button
          type=\"button\"
          variant=\"outline\"
          onClick={onCancel}
          disabled={isLoading}
        >
          {t('common.cancel')}
        </Button>
        <Button
          type=\"submit\"
          disabled={isLoading || !formData.title.trim()}
        >
          {isLoading ? (
            <>
              <div className=\"w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin\" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              {isEditing ? t('common.save') : t('common.add')}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

TodoForm.displayName = 'TodoForm';

export { TodoForm };"