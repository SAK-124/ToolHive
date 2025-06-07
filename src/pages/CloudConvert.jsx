import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  TextField,
  Button,
  Select,
  MenuItem,
  Grid,
} from '@mui/material'

/*************************************************************
 * CloudConvertService – handles all CloudConvert interactions
 *************************************************************/
class CloudConvertService {
  constructor(apiKey) {
    this.apiKey = apiKey
    this.baseUrl = 'https://api.cloudconvert.com/v2'
  }

  async fetchAllFormats() {
    const response = await fetch(`${this.baseUrl}/convert/formats`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    })
    const data = await response.json()
    if (data.errors) {
      throw new Error(data.errors.map((err) => err.detail).join(', '))
    }
    if (!data.data) {
      throw new Error("No 'data.data' found. Check your API key or usage limits.")
    }
    return data.data
  }

  async createJob(importOperation, fileUrlOrNull, outputFormat, fileExtOrNull) {
    const tasks = {
      'import-file': {},
      'convert-file': {
        operation: 'convert',
        input: 'import-file',
        output_format: outputFormat,
      },
      'export-file': {
        operation: 'export/url',
        input: 'convert-file',
      },
    }

    if (importOperation === 'upload') {
      tasks['import-file'] = { operation: 'import/upload' }
    } else if (importOperation === 'url') {
      tasks['import-file'] = {
        operation: 'import/url',
        url: fileUrlOrNull,
      }
      if (fileExtOrNull) {
        tasks['convert-file'].input_format = fileExtOrNull
      }
    }

    const response = await fetch(`${this.baseUrl}/jobs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tasks }),
    })
    const data = await response.json()
    if (data.errors) {
      throw new Error(data.errors.map((err) => err.detail).join(', '))
    }
    if (!data.data || !Array.isArray(data.data.tasks)) {
      throw new Error('No valid job data returned. Check your API key or job request.')
    }
    return data.data
  }

  async uploadFileToImportTask(formUrl, file, formParams = {}) {
    const formData = new FormData()
    for (const [paramKey, paramValue] of Object.entries(formParams)) {
      formData.append(paramKey, paramValue)
    }
    formData.append('file', file)

    const response = await fetch(formUrl, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) {
      throw new Error(`File upload failed with status ${response.status}`)
    }
    return true
  }

  async pollJobStatus(jobId, intervalMs = 2000) {
    while (true) {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      })
      const data = await response.json()
      if (data.errors) {
        throw new Error(data.errors.map((err) => err.detail).join(', '))
      }
      if (!data.data) {
        throw new Error('No job data found in poll. Check your API usage.')
      }

      const status = data.data.status
      if (status === 'finished' || status === 'error') {
        return data.data
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }
  }
}

/******************************************************************
 * CloudConvert Page (Pastel background + MUI Nav + "Glass" card)
 ******************************************************************/
function CloudConvert() {
  // Use your dev API key here
  const API_KEY =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiYzQ1YjhhYjU3Mjg1YTk1ZDJkNmIxMzRlOWIwMzVjYjFiODQ5NTQ0YzQ5MGUxMTc5OTI0YzNjNWIzZDgzMzlmM2RiMDBkNWYyZDVmOTA3N2MiLCJpYXQiOjE3MzY4OTMyODYuMjIyMDA2LCJuYmYiOjE3MzY4OTMyODYuMjIyMDA3LCJleHAiOjQ4OTI1NjY4ODYuMjE3MTcyLCJzdWIiOiI3MDc1MDQ2OSIsInNjb3BlcyI6WyJ1c2VyLnJlYWQiLCJ1c2VyLndyaXRlIiwidGFzay5yZWFkIiwidGFzay53cml0ZSIsIndlYmhvb2sucmVhZCIsIndlYmhvb2sud3JpdGUiLCJwcmVzZXQucmVhZCIsInByZXNldC53cml0ZSJdfQ.TVn8oyGMZlz3aL6nFaCvkbnCMplTHfHk6Fot7bru0hlvset5ZZ9xfBOkBtA7W4swKkD3grxrKXRRoUm7S8F1ukJhVpt-y9amUi5lcFYTsvZzNrg3iPc_p5AQWg3Yrl-8LodtnwPEWC-hivU6d5XErfKWOmPYm_esdWX_EvAL4m7HDtHZI4fMrz7LIb_m8ZP3kWxV6iMoE9OY_o2kOjNrzheqqx_hSXEJkGLzeglLBK1ys1DCmu-puvth3J0tdwZNX2nSHPCYvF5guc-jiIiGumBT_ohi7jxQQuMa6xTqtl18LNW2E_cR_EKOqI9lRx5UI2YRcyda4n2TMGm6cFqBPur4hq0JVS6IEICwZjwdJlVizLJm4oC7jrt1oVKmplyTwGWIjsOuldEOaS83wNYjjpt5Sw3mp4i8Jx76KtRbKhvwhtmcoYwnq3MYH0HXdBwNGE_AFG-7T73rZ3spvOOqlKqAreq206Fw_j81G4uGiNCobzs90pUVLInUC63HYk4fFBwZewSv-SNOdIXWPJc66XiVEsUVFlSv5rchiqnjavWR4iR_SKXuL9St-F_aO9lzKidK6DnI1gEPV7NENmabsPVMnrip5LbtcpyklVJ4OGJGkRtKF_2hPnceik6Rd3p--THI38GhL8CoxuwRhTpNOZj54QU1GRv9TYd02LGMAok'

  const cloudConvert = new CloudConvertService(API_KEY)

  // React State
  const [allFormatPairs, setAllFormatPairs] = useState([])
  const [formatLookup, setFormatLookup] = useState({})
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState('')
  const [outputFormat, setOutputFormat] = useState('')
  const [status, setStatus] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')

  useEffect(() => {
    async function fetchFormats() {
      try {
        setStatus('Loading CloudConvert formats...')
        const data = await cloudConvert.fetchAllFormats()
        setAllFormatPairs(data)
        setStatus('')

        // Build lookup: { "mp4": Set(["avi", "mov", ...]) }
        const lookup = {}
        data.forEach((pair) => {
          const inFmt = pair.input_format.toLowerCase()
          const outFmt = pair.output_format.toLowerCase()
          if (!lookup[inFmt]) lookup[inFmt] = new Set()
          lookup[inFmt].add(outFmt)
        })
        setFormatLookup(lookup)
      } catch (err) {
        setStatus(`Error fetching formats: ${err.message}`)
      }
    }
    fetchFormats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Helper
  const getExtension = (nameOrUrl) => {
    const parts = nameOrUrl.split('.')
    return parts.length > 1 ? parts.pop().toLowerCase() : ''
  }

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null)
    setFileUrl('')
    setOutputFormat('')
  }

  const handleFileUrlChange = (e) => {
    setFileUrl(e.target.value.trim())
    setFile(null)
    setOutputFormat('')
  }

  const getPossibleOutputs = (inputExt) => {
    if (!inputExt || !formatLookup[inputExt]) return []
    return [...formatLookup[inputExt]].sort()
  }

  const handleOutputFormatSelect = (e) => {
    setOutputFormat(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Converting...')
    setDownloadUrl('')

    if (!file && !fileUrl) {
      setStatus('Please choose a file or enter a URL.')
      return
    }

    let importOp = ''
    let inputExt = ''
    if (file) {
      importOp = 'upload'
      inputExt = getExtension(file.name)
    } else {
      importOp = 'url'
      inputExt = getExtension(fileUrl)
    }

    if (!outputFormat) {
      setStatus('Please select an output format.')
      return
    }

    try {
      // 1) Create job
      const jobData = await cloudConvert.createJob(importOp, fileUrl, outputFormat, inputExt)
      const jobId = jobData.id

      // 2) If upload needed
      if (importOp === 'upload') {
        const importTask = jobData.tasks.find((t) => t.name === 'import-file')
        if (!importTask || !importTask.result?.form?.url) {
          throw new Error('Could not find import-file task or upload form URL.')
        }
        const uploadUrl = importTask.result.form.url
        const s3Params = importTask.result.form.parameters || {}
        await cloudConvert.uploadFileToImportTask(uploadUrl, file, s3Params)
      }

      // 3) Poll status
      const finalJob = await cloudConvert.pollJobStatus(jobId)
      if (finalJob.status === 'error') {
        setStatus('Conversion failed. Please try again.')
        return
      }

      // 4) Get download link
      const exportTask = finalJob.tasks.find((t) => t.name === 'export-file')
      if (!exportTask || !exportTask.result?.files?.length) {
        setStatus('No export URL found. Conversion may have failed.')
        return
      }
      const dlUrl = exportTask.result.files[0].url

      setDownloadUrl(dlUrl)
      setStatus('Conversion successful!')
    } catch (err) {
      setStatus(`Error: ${err.message}`)
    }
  }

  // Dynamic input extension
  let inputExt = ''
  if (file) {
    inputExt = getExtension(file.name)
  } else if (fileUrl) {
    inputExt = getExtension(fileUrl)
  }
  const possibleOutputs = getPossibleOutputs(inputExt)

  return (
    <Box
      sx={{
        minHeight: '100vh',
        // Same pastel gradient
        background: 'linear-gradient(to right, #fbc2eb 0%, #a6c1ee 100%)',
      }}
    >
      {/* TOP NAV (MUI AppBar) */}
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ backgroundColor: '#333', boxShadow: 'none' }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              ToolHive
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link to="/" style={{ textDecoration: 'none', color: '#fff' }}>
                Home
              </Link>
              <Link to="/tools" style={{ textDecoration: 'none', color: '#fff' }}>
                Tools
              </Link>
              <Link to="/tools/cloudconvert" style={{ textDecoration: 'none', color: '#fff' }}>
                CloudConvert
              </Link>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>

      {/* HERO */}
      <Box sx={{ textAlign: 'center', color: '#333', mt: 5 }}>
        <Typography variant="h3" gutterBottom>
          CloudConvert Tool
        </Typography>
        <Typography variant="subtitle1">
          Convert files using the CloudConvert API
        </Typography>
      </Box>

      {/* Main container for the form */}
      <Container sx={{ mt: 5, pb: 10 }}>
        <Box
          sx={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: 3,
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Status */}
          <Typography variant="body1" sx={{ mb: 2, color: '#333' }}>
            <strong>Status:</strong> {status}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#333', mb: 1 }}>
                Choose a File:
              </Typography>
              <input 
                type="file"
                onChange={handleFileChange}
                style={{ 
                  marginLeft: '8px',
                  backgroundColor: 'transparent',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#333'
                }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ color: '#333', mb: 1 }}>
                Or File URL:
              </Typography>
              <TextField
                fullWidth
                placeholder="https://example.com/video.mp4"
                value={fileUrl}
                onChange={handleFileUrlChange}
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    }
                  }
                }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ color: '#333', mb: 1 }}>
                Convert To:
              </Typography>
              <Select
                fullWidth
                value={outputFormat}
                onChange={handleOutputFormatSelect}
                displayEmpty
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '& .MuiSelect-select': {
                    color: '#333'
                  }
                }}
              >
                <MenuItem value="">
                  <em>-- Select Format --</em>
                </MenuItem>
                {possibleOutputs.map((fmt) => (
                  <MenuItem key={fmt} value={fmt}>
                    {fmt.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Button
              variant="contained"
              type="submit"
              sx={{ 
                alignSelf: 'flex-start',
                backgroundColor: 'rgba(51, 51, 51, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(51, 51, 51, 0.9)',
                }
              }}
            >
              Convert
            </Button>
          </Box>

          {/* Download link if successful */}
          {downloadUrl && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ color: '#333' }}>
                <a href={downloadUrl} target="_blank" rel="noreferrer" download>
                  Download Your Converted File
                </a>
              </Typography>
            </Box>
          )}
        </Box>
      </Container>

      {/* FOOTER */}
      <Box
        component="footer"
        sx={{
          textAlign: 'center',
          py: 2,
          color: '#333',
          mt: 'auto',
          borderTop: '1px solid rgba(0, 0, 0, 0.2)',
        }}
      >
        <Typography variant="body2">
          &copy; 2025 ToolHive. All rights reserved.
        </Typography>
      </Box>

      {/* Header */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            component={Link}
            to="/"
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Home
          </Button>
          <Button
            variant="outlined"
            size="small"
            component={Link}
            to="/tools"
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            All Tools
          </Button>
          {isAdminUser && (
            <Button
              variant="outlined"
              size="small"
              component={Link}
              to="/admin"
              sx={{
                color: '#4AFF4A',
                borderColor: 'rgba(74,255,74,0.3)',
                animation: 'glow 2s infinite',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  borderColor: 'rgba(74,255,74,0.6)',
                  background: 'rgba(74,255,74,0.1)',
                  transform: 'translateY(-1px)',
                },
                '@keyframes glow': {
                  '0%': {
                    boxShadow: '0 0 0 0 rgba(74,255,74,0.4)',
                  },
                  '70%': {
                    boxShadow: '0 0 0 10px rgba(74,255,74,0)',
                  },
                  '100%': {
                    boxShadow: '0 0 0 0 rgba(74,255,74,0)',
                  },
                },
              }}
            >
              Admin Panel
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {userEmail ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.875rem'
                  }}
                >
                  {userEmail}
                </Typography>
                {isAdminUser && (
                  <Box
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: '4px',
                      background: 'rgba(0,255,0,0.1)',
                      border: '1px solid rgba(0,255,0,0.3)',
                      color: '#4AFF4A',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textShadow: '0 0 10px rgba(0,255,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    ADMIN
                  </Box>
                )}
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => getAuth().signOut()}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.6)',
                    background: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              size="small"
              component={Link}
              to="/login"
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.6)',
                  background: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Sign In
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default CloudConvert