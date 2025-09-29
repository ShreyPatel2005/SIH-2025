import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import {
  LayoutDashboard,
  DatabaseZap,
  Search,
  Upload,
  FileText,
  Settings,
  ArrowLeft,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

// API service configuration
const API_BASE_URL = 'http://localhost:5000/api/v1'

// Real API service
const apiService = {
  search: async (system, query) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/terminology/search`, {
        params: { system, query, limit: 20 }
      })
      return response.data
    } catch (error) {
      console.error('Search API error:', error)
      // Fallback to empty results
      return { results: [] }
    }
  },

  getMapping: async (code) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/mapping/${code}`)
      return response.data
    } catch (error) {
      console.error('Mapping API error:', error)
      // Fallback to empty mapping
      return {
        source: { term: "Unknown Term", code: code, system: "NAMASTE" },
        mapped: []
      }
    }
  },

  submitEMR: async (emrData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/emr/submit`, emrData)
      return response.data
    } catch (error) {
      console.error('EMR submit error:', error)
      throw error
    }
  },
  
  getRecentBundles: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emr/recent-bundles`)
      return response.data
    } catch (error) {
      console.error('Get recent bundles error:', error)
      return { recentBundles: [], count: 0 }
    }
  },
  
  getRecentBundleById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/emr/recent-bundles/${id}`)
      return response.data
    } catch (error) {
      console.error('Get recent bundle by ID error:', error)
      throw error
    }
  },

  uploadNAMASTE: async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await axios.post(`${API_BASE_URL}/upload/namaste`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('NAMASTE upload error:', error)
      throw error
    }
  },

  configureICD11: async (endpoint) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/upload/icd11-config`, {
        endpoint
      })
      return response.data
    } catch (error) {
      console.error('ICD-11 config error:', error)
      throw error
    }
  },

  uploadMappings: async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await axios.post(`${API_BASE_URL}/upload/mappings`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Mappings upload error:', error)
      throw error
    }
  },

  getSystems: async () => {
    try {
      // Try the systems endpoint first
      const response = await axios.get(`${API_BASE_URL}/terminology/systems`)
      return response.data
    } catch (error) {
      console.error('Get systems error:', error)
      
      // Fallback: Get systems from stats endpoint
      try {
        const statsResponse = await axios.get(`${API_BASE_URL}/terminology/stats/systems`)
        const systems = statsResponse.data.stats.map(stat => stat._id)
        return { systems: systems.sort() }
      } catch (statsError) {
        console.error('Stats fallback error:', statsError)
        
        // Final fallback: Use known systems
        return { systems: ['NAMASTE', 'ICD-11 Biomedicine', 'WHO Ayurveda'] }
      }
    }
  }
}

// Reusable UI Components
const Card = ({ children, className = "", ...props }) => (
  <div className={`bg-card text-card-foreground border rounded-lg shadow-sm ${className}`} {...props}>
    {children}
  </div>
)

const Button = ({ children, variant = "default", size = "default", className = "", ...props }) => {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  }
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10"
  }
  
  return (
    <button 
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

const Input = ({ className = "", type = "text", ...props }) => (
  <input
    type={type}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
)

const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
)

const Label = ({ className = "", ...props }) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props} />
)

// Main App Component
function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [availableSystems, setAvailableSystems] = useState([])
  const [selectedSystem, setSelectedSystem] = useState('')
  const [selectedTerm, setSelectedTerm] = useState(null)
  const [mapping, setMapping] = useState(null)
  const [fhirJson, setFhirJson] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [namasteFile, setNamasteFile] = useState(null)
  const [mappingFile, setMappingFile] = useState(null)
  const [icd11Endpoint, setIcd11Endpoint] = useState('')
  const [emrData, setEmrData] = useState({
    patientId: '',
    clinicianId: '',
    notes: '',
    bundleFile: null
  })
  
  // State for recent FHIR bundles
  const [recentBundles, setRecentBundles] = useState([])
  const [selectedBundle, setSelectedBundle] = useState(null)
  const [loadingBundles, setLoadingBundles] = useState(false)
  
  const searchTimeoutRef = useRef(null)

  // Load available systems from database
  const loadSystems = async () => {
    try {
      console.log('Loading available systems...')
      const response = await apiService.getSystems()
      console.log('Systems response:', response)
      setAvailableSystems(response.systems)
      // Set first system as default if available
      if (response.systems.length > 0) {
        setSelectedSystem(response.systems[0])
        console.log('Selected default system:', response.systems[0])
      } else {
        console.log('No systems available')
      }
    } catch (error) {
      console.error('Failed to load systems:', error)
    }
  }

  // Load systems on component mount and when activeView changes to search
  useEffect(() => {
    loadSystems()
  }, [])

  // Refresh systems when switching to search view
  useEffect(() => {
    if (activeView === 'search') {
      loadSystems()
    }
  }, [activeView])

  // Search functionality with debouncing
  const handleSearch = async (query) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    if (!query.trim() || !selectedSystem) {
      setSearchResults([])
      return
    }
    
    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await apiService.search(selectedSystem, query)
        setSearchResults(response.results)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)
  }

  // Handle term selection and get mapping
  const handleTermSelect = async (term) => {
    // Check if mappings exist for this term (only for terms that have mappings)
    setSelectedTerm(term)
    setIsLoading(true)
    try {
      const response = await apiService.getMapping(term.code)
      setMapping(response)
      setActiveView('mapping')
    } catch (error) {
      console.error('Mapping error:', error)
      // Still show mapping view even if no mappings found
      setMapping({
        source: { term: term.term, code: term.code, system: term.system },
        mapped: []
      })
      setActiveView('mapping')
    } finally {
      setIsLoading(false)
    }
  }

  // Generate FHIR JSON
  const generateFhirJson = () => {
    if (!mapping) return
    
    // Generate system URLs dynamically
    const getSystemUrl = (system) => {
      const systemUrls = {
        'NAMASTE': 'http://namaste.gov.in',
        'ICD-11 TM2': 'http://id.who.int/icd/entity/148929940',
        'ICD-11 BIOMEDICINE': 'http://id.who.int/icd/entity/12345',
        'WHO AYURVEDA': 'http://who.int/ayurveda'
      }
      // If system is not in our predefined map, generate a URL based on the system name
      return systemUrls[system] || `http://terminology.system/${system.toLowerCase().replace(/\s+/g, '-')}`
    }

    // Create FHIR Condition resource
    const fhirCondition = {
      resourceType: "Condition",
      id: `condition-${Date.now()}`,
      meta: {
        profile: ["http://hl7.org/fhir/StructureDefinition/Condition"]
      },
      subject: { reference: "Patient/example" },
      encounter: { reference: "Encounter/example" },
      recordedDate: new Date().toISOString(),
      code: {
        coding: [
          {
            system: getSystemUrl(mapping.source.system),
            code: mapping.source.code,
            display: mapping.source.term,
            userSelected: true
          },
          ...mapping.mapped.map(item => ({
            system: getSystemUrl(item.system),
            code: item.code,
            display: item.term,
            userSelected: false
          }))
        ],
        text: mapping.source.term
      },
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/condition-category",
              code: "problem-list-item",
              display: "Problem List Item"
            }
          ]
        }
      ],
      clinicalStatus: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
            code: "active",
            display: "Active"
          }
        ]
      }
    }
    
    setFhirJson(JSON.stringify(fhirCondition, null, 2))
  }

  // Copy JSON to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fhirJson)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Fetch recent FHIR bundles
  const fetchRecentBundles = async () => {
    setLoadingBundles(true)
    try {
      const data = await apiService.getRecentBundles()
      setRecentBundles(data.recentBundles || [])
    } catch (error) {
      console.error('Error fetching recent bundles:', error)
    } finally {
      setLoadingBundles(false)
    }
  }
  
  // Load a specific bundle by ID
  const loadBundleById = async (id) => {
    try {
      const data = await apiService.getRecentBundleById(id)
      // Pre-fill the form with the bundle metadata
      setEmrData({
        patientId: data.metadata.patientId,
        clinicianId: data.metadata.clinicianId,
        notes: '',
        bundleFile: null,
        preloadedBundle: data.bundle
      })
      setSelectedBundle(data)
    } catch (error) {
      alert(`Error loading bundle: ${error.message}`)
    }
  }
  
  // Handle EMR data submission
  const handleEmrSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      let fhirBundle = emrData.preloadedBundle
      
      // If using file upload instead of preloaded bundle
      if (emrData.bundleFile) {
        // Read the FHIR bundle file
        const reader = new FileReader()
        
        reader.onload = async (event) => {
          try {
            fhirBundle = JSON.parse(event.target.result)
            await submitBundle(fhirBundle)
          } catch (error) {
            alert(`Error parsing FHIR bundle: ${error.message}`)
            setIsLoading(false)
          }
        }
        
        reader.readAsText(emrData.bundleFile)
        return // Early return as reader.onload is async
      } else if (fhirBundle) {
        // Using preloaded bundle
        await submitBundle(fhirBundle)
      } else {
        // No bundle provided
        alert('Please provide a FHIR bundle file or select a preloaded bundle')
        setIsLoading(false)
      }
    } catch (error) {
      alert(`Error submitting EMR data: ${error.response?.data?.error || error.message}`)
      setIsLoading(false)
    }
  }
  
  // Submit the bundle to the API
  const submitBundle = async (fhirBundle) => {
    try {
      const result = await apiService.submitEMR({
        patientId: emrData.patientId,
        clinicianId: emrData.clinicianId,
        encounterNotes: emrData.notes,
        fhirBundle
      })
      
      alert(`EMR data submitted successfully! Status: ${result.status}`)
      
      // Reset form
      setEmrData({
        patientId: '',
        clinicianId: '',
        notes: '',
        bundleFile: null,
        preloadedBundle: null
      })
      
      setSelectedBundle(null)
      
      // Refresh the recent bundles list
      fetchRecentBundles()
    } catch (error) {
      alert(`Error submitting EMR data: ${error.response?.data?.error || error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ingest', label: 'Ingest Coding Systems', icon: DatabaseZap },
    { id: 'search', label: 'Search & Map Codes', icon: Search },
    { id: 'upload', label: 'Upload EMR Bundle', icon: Upload }
  ]

  // Dashboard cards
  const dashboardCards = [
    {
      id: 'ingest',
      title: 'Ingest Coding Systems',
      description: 'Load and sync medical terminology from various coding systems.',
      icon: DatabaseZap
    },
    {
      id: 'search',
      title: 'Search/Lookup of Codes',
      description: 'Find and explore terms from available coding systems.',
      icon: Search
    },
    {
      id: 'mapping',
      title: 'Mapping View',
      description: 'Visualize the relationships between different coding systems.',
      icon: FileText
    },
    {
      id: 'upload',
      title: 'Upload EMR Data',
      description: 'Submit a pre-formatted FHIR bundle to the system.',
      icon: Upload
    }
  ]

  // Render Sidebar
  const renderSidebar = () => (
    <div className="w-64 bg-card border-r min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-card-foreground">
          Ministry of Ayush
        </h1>
        <p className="text-sm text-muted-foreground">
          Terminology Portal
        </p>
      </div>
      
      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                activeView === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )

  // Render Dashboard
  const renderDashboard = () => (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Ayush Terminology Management System
        </h1>
        <p className="text-muted-foreground">
          Welcome to the comprehensive medical terminology management platform
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dashboardCards.map((card) => {
          const Icon = card.icon
          return (
            <Card
              key={card.id}
              className="p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setActiveView(card.id)}
            >
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                  <p className="text-muted-foreground text-sm">{card.description}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )

  // Render Ingest View
  const renderIngest = () => (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Ingest Coding Systems</h1>
        <p className="text-muted-foreground">Load and synchronize medical coding systems</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terminology Upload */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Upload Terminology CSV File</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a CSV file containing medical terminology data (NAMASTE, ICD-11, etc.)
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="namaste-file">Select CSV File</Label>
              <Input
                id="namaste-file"
                type="file"
                accept=".csv"
                onChange={(e) => setNamasteFile(e.target.files[0])}
                className="mt-1"
              />
            </div>
            
            <Button 
              className="w-full"
              disabled={!namasteFile || isLoading}
              onClick={async () => {
                if (namasteFile) {
                  setIsLoading(true)
                  try {
                    const result = await apiService.uploadNAMASTE(namasteFile)
                    alert(`NAMASTE file uploaded successfully! Inserted: ${result.summary.inserted} records`)
                    setNamasteFile(null)
                    // Refresh available systems after upload
                    await loadSystems()
                  } catch (error) {
                    alert(`Error uploading file: ${error.response?.data?.error || error.message}`)
                  } finally {
                    setIsLoading(false)
                  }
                }
              }}
            >
              <DatabaseZap className="h-4 w-4 mr-2" />
              Upload & Process
            </Button>
          </div>
        </Card>

        {/* Mapping Upload */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Upload Mappings CSV File</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload cross-system mappings between different coding systems
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="mapping-file">Select Mappings CSV File</Label>
              <Input
                id="mapping-file"
                type="file"
                accept=".csv"
                onChange={(e) => setMappingFile(e.target.files[0])}
                className="mt-1"
              />
            </div>
            
            <Button 
              className="w-full"
              disabled={!mappingFile || isLoading}
              onClick={async () => {
                if (mappingFile) {
                  setIsLoading(true)
                  try {
                    const result = await apiService.uploadMappings(mappingFile)
                    alert(`Mappings file uploaded successfully! Inserted: ${result.summary.inserted} mappings`)
                    setMappingFile(null)
                  } catch (error) {
                    alert(`Error uploading mappings file: ${error.response?.data?.error || error.message}`)
                  } finally {
                    setIsLoading(false)
                  }
                }
              }}
            >
              <DatabaseZap className="h-4 w-4 mr-2" />
              Upload Mappings
            </Button>
          </div>
        </Card>

        {/* External API Configuration */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Configure External API</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configure external API endpoints for terminology synchronization (ICD-11, WHO, etc.)
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="icd11-endpoint">External API Endpoint URL</Label>
              <Input
                id="icd11-endpoint"
                type="url"
                placeholder="https://api.who.int/icd11/"
                value={icd11Endpoint}
                onChange={(e) => setIcd11Endpoint(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <Button 
              className="w-full"
              disabled={!icd11Endpoint || isLoading}
              onClick={async () => {
                if (icd11Endpoint) {
                  setIsLoading(true)
                  try {
                    const result = await apiService.configureICD11(icd11Endpoint)
                    alert(`External API endpoint configured successfully!`)
                  } catch (error) {
                    alert(`Error configuring endpoint: ${error.response?.data?.error || error.message}`)
                  } finally {
                    setIsLoading(false)
                  }
                }
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Save & Sync
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )

  // Render Search View
  const renderSearch = () => (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Search & Map Codes</h1>
            <p className="text-muted-foreground">Find and explore medical terminology across coding systems</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadSystems}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <DatabaseZap className="h-4 w-4 mr-2" />
                Refresh Systems
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Search Bar */}
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="search-query">Search Query</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-query"
                placeholder="Enter search term..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  handleSearch(e.target.value)
                }}
                className="pl-10"
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
          
          <div>
            <Label>Code System</Label>
            {availableSystems.length > 0 ? (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Available systems: {availableSystems.length}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableSystems.map((system) => (
                    <button
                      key={system}
                      onClick={() => setSelectedSystem(system)}
                      className={`p-2 rounded-md text-sm border transition-colors ${
                        selectedSystem === system
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-input hover:bg-accent'
                      }`}
                    >
                      {system}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-2 p-3 bg-muted rounded-md text-sm text-muted-foreground">
                No coding systems available. Please upload terminology data first.
                <br />
                <span className="text-xs">
                  Available systems: {availableSystems.length} | 
                  Selected system: {selectedSystem || 'None'}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Search Results</h3>
          <div className="space-y-2">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-md hover:bg-accent cursor-pointer transition-colors"
                onClick={() => handleTermSelect(result)}
              >
                <div>
                  <div className="font-medium">{result.term}</div>
                  <div className="text-sm text-muted-foreground">{result.code}</div>
                </div>
                <div className="text-xs bg-secondary px-2 py-1 rounded">
                  {result.system}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )

  // Render Mapping View
  const renderMapping = () => (
    <div className="p-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => {
            setActiveView('search')
            setSelectedTerm(null)
            setMapping(null)
            setFhirJson('')
          }}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>
        
        <h1 className="text-2xl font-bold mb-2">
          Mapping for: {mapping?.source?.term || 'Loading...'}
        </h1>
        <p className="text-muted-foreground">View code mappings and generate FHIR resources</p>
      </div>
      
      {mapping && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Source Term */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Source Term</h3>
            <div className="space-y-3">
              <div>
                <Label>Term Name</Label>
                <div className="mt-1 p-3 bg-secondary rounded-md font-medium">
                  {mapping.source.term}
                </div>
              </div>
              <div>
                <Label>Code</Label>
                <div className="mt-1 p-3 bg-secondary rounded-md font-mono">
                  {mapping.source.code}
                </div>
              </div>
              <div>
                <Label>System</Label>
                <div className="mt-1 p-3 bg-secondary rounded-md">
                  {mapping.source.system}
                </div>
              </div>
            </div>
          </Card>

          {/* Mapped Codes */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Mapped Codes</h3>
            <div className="space-y-3">
              {mapping.mapped.map((item, index) => (
                <div key={index} className="p-3 border rounded-md">
                  <div className="font-medium mb-1">{item.term}</div>
                  <div className="text-sm text-muted-foreground font-mono mb-1">{item.code}</div>
                  <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded inline-block">
                    {item.system}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* FHIR Generation */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Generate FHIR ProblemList JSON</h3>
          <Button onClick={generateFhirJson} disabled={!mapping}>
            Generate FHIR JSON
          </Button>
        </div>
        
        {fhirJson && (
          <div className="space-y-4">
            <div className="relative">
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                <code>{fhirJson}</code>
              </pre>
              <div className="absolute top-2 right-2 flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Create a blob from the JSON string
                    const blob = new Blob([fhirJson], { type: 'application/json' });
                    // Create a URL for the blob
                    const url = URL.createObjectURL(blob);
                    // Create a temporary anchor element
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `fhir-condition-${Date.now()}.json`;
                    // Trigger the download
                    document.body.appendChild(a);
                    a.click();
                    // Clean up
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download
                </Button>
                    
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )

  // Load recent bundles when upload view is activated
  useEffect(() => {
    if (activeView === 'upload') {
      fetchRecentBundles()
    }
  }, [activeView])
  
  // Render Upload View
  const renderUpload = () => (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Upload Patient EMR Data</h1>
        <p className="text-muted-foreground">Submit a pre-formatted FHIR bundle to the system</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* EMR Submission Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {selectedBundle ? 'Using Cached Bundle' : 'New EMR Submission'}
            </h2>
            
            <form onSubmit={handleEmrSubmit} className="space-y-6">
              <div>
                <Label htmlFor="patient-id">Patient ABHA ID</Label>
                <Input
                  id="patient-id"
                  type="text"
                  placeholder="Enter patient ABHA ID"
                  value={emrData.patientId}
                  onChange={(e) => setEmrData({...emrData, patientId: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="clinician-id">Clinician HPR ID</Label>
                <Input
                  id="clinician-id"
                  type="text"
                  placeholder="Enter clinician HPR ID"
                  value={emrData.clinicianId}
                  onChange={(e) => setEmrData({...emrData, clinicianId: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="encounter-notes">Encounter Notes</Label>
                <Textarea
                  id="encounter-notes"
                  placeholder="Enter encounter notes..."
                  value={emrData.notes}
                  onChange={(e) => setEmrData({...emrData, notes: e.target.value})}
                  className="mt-1"
                  rows={4}
                />
              </div>
              
              {!selectedBundle && (
                <div>
                  <Label htmlFor="fhir-bundle">FHIR Bundle Data</Label>
                  <Input
                    id="fhir-bundle"
                    type="file"
                    accept=".json"
                    onChange={(e) => setEmrData({...emrData, bundleFile: e.target.files[0]})}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a JSON file containing FHIR bundle data
                  </p>
                </div>
              )}
              
              {selectedBundle && (
                <div className="bg-muted p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Using cached bundle</h4>
                      <p className="text-xs text-muted-foreground">
                        Bundle ID: {selectedBundle.metadata.id}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Create a blob from the JSON string
                          const blob = new Blob([JSON.stringify(emrData.preloadedBundle, null, 2)], { type: 'application/json' });
                          // Create a URL for the blob
                          const url = URL.createObjectURL(blob);
                          // Create a temporary anchor element
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `fhir-bundle-${emrData.patientId}-${Date.now()}.json`;
                          // Trigger the download
                          document.body.appendChild(a);
                          a.click();
                          // Clean up
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedBundle(null)
                          setEmrData({
                            ...emrData,
                            preloadedBundle: null
                          })
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <Button type="submit" className="w-full" size="lg">
                <Upload className="h-4 w-4 mr-2" />
                Submit EMR Data
              </Button>
            </form>
          </Card>
        </div>
        
        {/* Recent Bundles */}
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent FHIR Bundles</h2>
            
            {loadingBundles ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : recentBundles.length > 0 ? (
              <div className="space-y-3">
                {recentBundles.map((bundle, index) => (
                   <div 
                     key={bundle.id}
                     className="flex items-center justify-between p-3 border rounded-md hover:bg-accent transition-colors"
                   >
                     <div 
                       className="flex-1 cursor-pointer"
                       onClick={() => loadBundleById(bundle.id)}
                     >
                       <div className="font-medium">Patient: {bundle.patientId}</div>
                       <div className="text-xs text-muted-foreground">
                         {new Date(bundle.timestamp).toLocaleString()}
                       </div>
                     </div>
                     <div className="flex space-x-2">
                       <Button 
                         variant="ghost" 
                         size="sm"
                         onClick={(e) => {
                           e.stopPropagation();
                           loadBundleById(bundle.id);
                         }}
                       >
                         Use
                       </Button>
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={async (e) => {
                           e.stopPropagation();
                           try {
                             const data = await apiService.getRecentBundleById(bundle.id);
                             // Create a blob from the JSON string
                             const blob = new Blob([JSON.stringify(data.bundle, null, 2)], { type: 'application/json' });
                             // Create a URL for the blob
                             const url = URL.createObjectURL(blob);
                             // Create a temporary anchor element
                             const a = document.createElement('a');
                             a.href = url;
                             a.download = `fhir-bundle-${bundle.patientId}-${Date.now()}.json`;
                             // Trigger the download
                             document.body.appendChild(a);
                             a.click();
                             // Clean up
                             document.body.removeChild(a);
                             URL.revokeObjectURL(url);
                           } catch (error) {
                             alert(`Error downloading bundle: ${error.message}`);
                           }
                         }}
                       >
                         <FileText className="h-4 w-4" />
                       </Button>
                     </div>
                   </div>
                 ))}
                
                <div className="text-xs text-muted-foreground text-center pt-2">
                  Showing {recentBundles.length} of {recentBundles.length} recent bundles
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No recent bundles available</p>
                <p className="text-xs mt-1">Submit a new EMR to see it here</p>
              </div>
            )}
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={fetchRecentBundles}
                disabled={loadingBundles}
              >
                {loadingBundles ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>Refresh Bundles</>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )

  // Main render
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {renderSidebar()}
        
        <div className="flex-1">
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'ingest' && renderIngest()}
          {activeView === 'search' && renderSearch()}
          {activeView === 'mapping' && renderMapping()}
          {activeView === 'upload' && renderUpload()}
        </div>
      </div>
    </div>
  )
}

export default App