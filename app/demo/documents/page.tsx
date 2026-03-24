'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Upload,
  Search,
  Filter,
  File,
  Eye,
  Download,
} from 'lucide-react'

const DOCUMENT_TYPES = ['All', 'Redline', 'Site Plan', 'Grading Plan', 'Plat', 'Response Letter']

const MOCK_DOCUMENTS = [
  {
    id: 1,
    name: 'Lakewood Meadows Site Plan - Revised',
    type: 'Site Plan',
    project: 'Lakewood Meadows Subdivision',
    permit: 'DEV-2024-0847',
    uploadDate: '2024-03-18',
    status: 'Processed',
    fileSize: '2.4 MB',
  },
  {
    id: 2,
    name: 'Grading & Erosion Control Plan',
    type: 'Grading Plan',
    project: 'Lakewood Meadows Subdivision',
    permit: 'DEV-2024-0847',
    uploadDate: '2024-03-15',
    status: 'AI Parsed',
    fileSize: '1.8 MB',
  },
  {
    id: 3,
    name: 'Development Agreement Redline v3',
    type: 'Redline',
    project: 'Brookside Commons Mixed Use',
    permit: 'DEV-2024-0923',
    uploadDate: '2024-03-12',
    status: 'Pending Review',
    fileSize: '0.9 MB',
  },
  {
    id: 4,
    name: 'Final Plat - Recorded',
    type: 'Plat',
    project: 'Lakewood Meadows Subdivision',
    permit: 'DEV-2024-0847',
    uploadDate: '2024-03-10',
    status: 'Processed',
    fileSize: '3.2 MB',
  },
  {
    id: 5,
    name: 'Traffic Impact Analysis - Addendum',
    type: 'Response Letter',
    project: 'Brookside Commons Mixed Use',
    permit: 'DEV-2024-0923',
    uploadDate: '2024-03-08',
    status: 'AI Parsed',
    fileSize: '1.5 MB',
  },
  {
    id: 6,
    name: 'Stormwater Management Plan - Phase 2',
    type: 'Grading Plan',
    project: 'Pinewood Business Park',
    permit: 'DEV-2024-0756',
    uploadDate: '2024-03-05',
    status: 'Pending Review',
    fileSize: '2.1 MB',
  },
  {
    id: 7,
    name: 'Architectural Renderings & Elevations',
    type: 'Site Plan',
    project: 'Brookside Commons Mixed Use',
    permit: 'DEV-2024-0923',
    uploadDate: '2024-02-28',
    status: 'Processed',
    fileSize: '4.7 MB',
  },
  {
    id: 8,
    name: 'Utility Coordination Letter - NCDOT',
    type: 'Response Letter',
    project: 'Pinewood Business Park',
    permit: 'DEV-2024-0756',
    uploadDate: '2024-02-25',
    status: 'AI Parsed',
    fileSize: '0.7 MB',
  },
]

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case 'Processed':
      return { backgroundColor: '#D4E8E0', color: '#0f3c35' }
    case 'AI Parsed':
      return { backgroundColor: '#FFF3CD', color: '#664D03' }
    case 'Pending Review':
      return { backgroundColor: '#F8D7DA', color: '#721C24' }
    default:
      return { backgroundColor: '#E2E3E5', color: '#383D41' }
  }
}

const getTypeIcon = (type: string) => {
  return <File className="w-4 h-4" />
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('All')

  const filteredDocuments = MOCK_DOCUMENTS.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.permit.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = selectedType === 'All' || doc.type === selectedType

    return matchesSearch && matchesType
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1
            className="font-display text-4xl font-bold mb-2"
            style={{ color: '#0f3c35' }}
          >
            Documents
          </h1>
          <p className="text-gray-600">
            View and manage all uploaded project documents.
          </p>
        </motion.div>

        {/* Controls Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          {/* Search and Filter Row */}
          <div className="flex gap-4 flex-col md:flex-row items-start md:items-center">
            {/* Search Bar */}
            <div className="flex-1 w-full relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents, projects, or permits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  borderColor: '#E8E0D0',
                  backgroundColor: '#FFFFFF',
                }}
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  borderColor: '#E8E0D0',
                  backgroundColor: '#FFFFFF',
                }}
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Button */}
            <button
              disabled
              className="px-6 py-2 rounded-lg font-medium flex items-center gap-2 text-white opacity-60 cursor-not-allowed"
              style={{ backgroundColor: '#0f3c35' }}
              title="Upload is disabled in demo mode"
            >
              <Upload className="w-5 h-5" />
              Upload Document
            </button>
          </div>
        </motion.div>

        {/* Documents Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4"
        >
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc) => (
              <motion.div key={doc.id} variants={itemVariants}>
                <Card
                  className="p-4 hover:shadow-md transition-shadow"
                  style={{
                    backgroundColor: '#FDFBF7',
                    borderColor: '#E8E0D0',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left Content */}
                    <div className="flex gap-4 flex-1 min-w-0">
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded flex items-center justify-center"
                        style={{ backgroundColor: '#E8E0D0' }}
                      >
                        {getTypeIcon(doc.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-gray-900 mb-1 truncate">
                          {doc.name}
                        </h3>

                        <div className="flex flex-wrap gap-3 mb-2 text-sm">
                          <span className="text-gray-600">{doc.type}</span>
                          <span className="text-gray-600">•</span>
                          <span className="text-gray-600">{doc.fileSize}</span>
                          <span className="text-gray-600">•</span>
                          <span className="text-gray-500 text-xs">
                            {formatDate(doc.uploadDate)}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              backgroundColor: '#F5F3F0',
                              borderColor: '#D8D0C0',
                              color: '#0f3c35',
                            }}
                          >
                            {doc.project}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs font-mono"
                            style={{
                              backgroundColor: '#F5F3F0',
                              borderColor: '#D8D0C0',
                              color: '#0f3c35',
                            }}
                          >
                            {doc.permit}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Right Content - Status and Actions */}
                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <Badge
                        className="text-xs"
                        style={getStatusBadgeStyle(doc.status)}
                      >
                        {doc.status}
                      </Badge>

                      <div className="flex gap-2">
                        <button
                          className="p-2 rounded hover:bg-gray-200 transition-colors"
                          title="View document"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          className="p-2 rounded hover:bg-gray-200 transition-colors"
                          title="Download document"
                        >
                          <Download className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div variants={itemVariants} className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No documents found</p>
              <p className="text-gray-500 text-sm">
                Try adjusting your search or filter criteria
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Document Count */}
        {filteredDocuments.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-sm text-gray-600"
          >
            Showing {filteredDocuments.length} of {MOCK_DOCUMENTS.length} documents
          </motion.div>
        )}
      </div>
    </div>
  )
}