'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { Button } from '@/components/ui/button'
import { Copy, Loader2 } from 'lucide-react'

interface CloneTemplateButtonProps {
  templateId: string
  label?: string
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export default function CloneTemplateButton({ 
  templateId, 
  label = 'Use Template', 
  size = 'sm',
  className = ''
}: CloneTemplateButtonProps) {
  const router = useRouter()
  const [isCloning, setIsCloning] = useState(false)

  const handleClone = async () => {
    setIsCloning(true)
    try {
      const res = await fetch(`/api/templates/${templateId}/clone`, {
        method: 'POST'
      })

      if (res.ok) {
        const checksheet = await res.json()
        await Swal.fire({
          icon: 'success',
          title: 'Template Cloned!',
          text: 'Template has been cloned to your checksheets.',
          timer: 2000,
          showConfirmButton: false
        })
        router.push(`/checksheets/create?id=${checksheet.id}`)
      } else {
        const error = await res.json()
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: error.error || 'Failed to clone template',
        })
      }
    } catch (error) {
      console.error('Error cloning template:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to clone template',
      })
    } finally {
      setIsCloning(false)
    }
  }

  return (
    <Button 
      onClick={handleClone}
      disabled={isCloning}
      className={`bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 ${className}`}
      size={size}
    >
      {isCloning ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cloning...
        </>
      ) : (
        <>
          <Copy className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  )
}
