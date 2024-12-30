/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useState } from 'react'
import { getDatabase, ref, set } from 'firebase/database'
import { Button } from '@/components/ui/button'
import { app } from '@/firebase/firebase'
// import { useState } from 'react'

const page = () => {
  const [startName, setStartName] = useState('')
  const [endName, setEndName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Firebase Realtime Database reference
  const db = getDatabase(app)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setImageUrl(url)

    // Set image preview if URL is valid
    if (url) {
      setImagePreview(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!startName || !endName || !description || !imageUrl) {
      alert('Please fill all the fields')
      return
    }

    // Prepare the data to be saved in the database
    const newHomeData = {
      startName,
      endName,
      description,
      imageUrl,
    }

    try {
      // Reference to 'home' collection in Realtime Database
      const homeRef = ref(db, 'home/' + Date.now()) // Use a timestamp as the unique ID
      await set(homeRef, newHomeData)

      // Clear form after submission
      setStartName('')
      setEndName('')
      setDescription('')
      setImageUrl('')
      setImagePreview(null)

      alert('Data submitted successfully!')
    } catch (error) {
      console.error('Error submitting data: ', error)
      alert('Error submitting data')
    }
  }

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold text-center mb-5">Create Home Collection</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Start Name */}
        <div>
          <label htmlFor="startName" className="block text-sm font-semibold">Start Name</label>
          <input
            type="text"
            id="startName"
            value={startName}
            onChange={(e) => setStartName(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
            required
          />
        </div>

        {/* End Name */}
        <div>
          <label htmlFor="endName" className="block text-sm font-semibold">End Name</label>
          <input
            type="text"
            id="endName"
            value={endName}
            onChange={(e) => setEndName(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
            required
          />
        </div>

        {/* Image URL */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-semibold">Image URL</label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={handleImageChange}
            className="border border-gray-300 p-2 rounded w-full"
            required
          />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div>
            <p className="text-sm text-gray-500">Image Preview:</p>
            <img src={imagePreview} alt="Image Preview" className="mt-2 max-w-full h-auto" />
          </div>
        )}

        {/* Submit Button */}
        <Button type="submit" className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Submit
        </Button>
      </form>
    </div>
  )
}

export default page
