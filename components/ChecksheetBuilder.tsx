'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, GripVertical, Sparkles } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Checkpoint {
  id: string
  title: string
  description: string
  fieldType: string
  section: string
  isRequired: boolean
  config: any
}

interface ChecksheetBuilderProps {
  initialData?: {
    title: string
    description: string
    category: string
    checkpoints: Checkpoint[]
  }
  onSave: (data: any) => void
}

function SortableCheckpoint({ checkpoint, onUpdate, onDelete }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: checkpoint.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const fieldTypes = [
    'CHECKBOX',
    'NUMBER',
    'TEXT',
    'TEXTAREA',
    'PHOTO',
    'FILE',
    'DROPDOWN',
    'MULTISELECT',
    'GPS',
    'SIGNATURE',
    'DATE',
    'TIME',
    'DATETIME',
    'RATING',
  ]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg p-4 bg-white mb-3"
    >
      <div className="flex items-start gap-3">
        <button
          className="mt-2 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-gray-400" />
        </button>

        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`title-${checkpoint.id}`}>Checkpoint Title*</Label>
              <Input
                id={`title-${checkpoint.id}`}
                value={checkpoint.title}
                onChange={(e) => onUpdate(checkpoint.id, { title: e.target.value })}
                placeholder="e.g., Check temperature"
              />
            </div>
            <div>
              <Label htmlFor={`section-${checkpoint.id}`}>Section</Label>
              <Input
                id={`section-${checkpoint.id}`}
                value={checkpoint.section}
                onChange={(e) => onUpdate(checkpoint.id, { section: e.target.value })}
                placeholder="e.g., Safety Checks"
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`description-${checkpoint.id}`}>Description</Label>
            <Input
              id={`description-${checkpoint.id}`}
              value={checkpoint.description}
              onChange={(e) => onUpdate(checkpoint.id, { description: e.target.value })}
              placeholder="Additional details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`fieldType-${checkpoint.id}`}>Field Type*</Label>
              <select
                id={`fieldType-${checkpoint.id}`}
                value={checkpoint.fieldType}
                onChange={(e) => onUpdate(checkpoint.id, { fieldType: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {fieldTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checkpoint.isRequired}
                  onChange={(e) => onUpdate(checkpoint.id, { isRequired: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium">Required</span>
              </label>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(checkpoint.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function ChecksheetBuilder({ initialData, onSave }: ChecksheetBuilderProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [category, setCategory] = useState(initialData?.category || '')
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>(
    initialData?.checkpoints || []
  )
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setCheckpoints((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const addCheckpoint = () => {
    const newCheckpoint: Checkpoint = {
      id: `checkpoint-${Date.now()}`,
      title: '',
      description: '',
      fieldType: 'CHECKBOX',
      section: '',
      isRequired: false,
      config: {},
    }
    setCheckpoints([...checkpoints, newCheckpoint])
  }

  const updateCheckpoint = (id: string, updates: Partial<Checkpoint>) => {
    setCheckpoints(
      checkpoints.map((cp) => (cp.id === id ? { ...cp, ...updates } : cp))
    )
  }

  const deleteCheckpoint = (id: string) => {
    setCheckpoints(checkpoints.filter((cp) => cp.id !== id))
  }

  const handleAIGenerate = async () => {
    if (!aiPrompt) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, category }),
      })

      const data = await response.json()

      if (response.ok) {
        setTitle(data.title)
        setDescription(data.description)
        setCategory(data.category)
        setCheckpoints(
          data.checkpoints.map((cp: any, index: number) => ({
            ...cp,
            id: `checkpoint-${Date.now()}-${index}`,
          }))
        )
        alert('Checksheet generated successfully!')
      } else {
        // Show user-friendly error message
        alert(data.error || 'Failed to generate checksheet. You can create it manually below.')
      }
    } catch (error) {
      console.error('AI generation failed:', error)
      alert('AI service temporarily unavailable. Please create checksheet manually.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = () => {
    onSave({
      title,
      description,
      category,
      checkpoints: checkpoints.map((cp, index) => ({
        title: cp.title,
        description: cp.description,
        fieldType: cp.fieldType,
        section: cp.section,
        isRequired: cp.isRequired,
        config: cp.config,
        order: index,
      })),
    })
  }

  const categories = [
    'Manufacturing',
    'Construction',
    'Healthcare',
    'IT',
    'Safety',
    'Quality Control',
    'Maintenance',
    'Audit',
    'Other',
  ]

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Checksheet Generator</CardTitle>
          <CardDescription>
            Describe what checksheet you need, and AI will generate it for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ai-prompt">What kind of checksheet do you need?</Label>
            <Input
              id="ai-prompt"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g., Safety inspection for warehouse operations"
              className="mt-1"
            />
          </div>
          <Button onClick={handleAIGenerate} disabled={isGenerating || !aiPrompt}>
            <Sparkles className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate with AI'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checksheet Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title*</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Checksheet title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat.toLowerCase()}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Checkpoints</CardTitle>
              <CardDescription>
                Add and organize your checksheet items
              </CardDescription>
            </div>
            <Button onClick={addCheckpoint}>
              <Plus className="mr-2 h-4 w-4" />
              Add Checkpoint
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={checkpoints.map((cp) => cp.id)}
              strategy={verticalListSortingStrategy}
            >
              {checkpoints.map((checkpoint) => (
                <SortableCheckpoint
                  key={checkpoint.id}
                  checkpoint={checkpoint}
                  onUpdate={updateCheckpoint}
                  onDelete={deleteCheckpoint}
                />
              ))}
            </SortableContext>
          </DndContext>

          {checkpoints.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No checkpoints yet. Add one or use AI to generate.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSave} disabled={!title || checkpoints.length === 0}>
          Save Checksheet
        </Button>
      </div>
    </div>
  )
}
