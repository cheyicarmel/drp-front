import { useState } from 'react'
import api from '@/lib/api'

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false)

  const uploadImage = async (file: File): Promise<string> => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data.url
    } finally {
      setIsUploading(false)
    }
  }

  return { uploadImage, isUploading }
}