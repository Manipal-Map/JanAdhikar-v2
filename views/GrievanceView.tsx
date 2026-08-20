'use client';
import { useState } from 'react'
import { ArrowRight, Loader2, ArrowLeft, Upload, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useCaseStore from '@/store/caseStore'
import { grievanceGenerate } from '@/lib/api'

export default function GrievanceView() {
  const router = useRouter()
  const {
    caseId,
    userProblem,
    setFormData,
    setGrievanceResult,
    setStage,
    language
  } = useCaseStore()

  const [localForm, setLocalForm] = useState({})
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)

  const schema = [
    {
      key: 'applicant_name',
      label: 'Full Name',
      placeholder: 'Enter your full name'
    },
    {
      key: 'applicant_address',
      label: 'Residential Address',
      placeholder: 'Enter your address'
    },
    {
      key: 'applicant_city',
      label: 'City / District',
      placeholder: 'e.g. Jaipur'
    },
    {
      key: 'applicant_state',
      label: 'State',
      placeholder: 'e.g. Rajasthan'
    },
    {
      key: 'applicant_contact',
      label: 'Phone Number / Email',
      placeholder: 'Enter contact information'
    }
  ]

  const handleChange = (key, val) => {
    setLocalForm(prev => ({
      ...prev,
      [key]: val
    }))
  }

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      setFormData(localForm)

      const activeCaseId = caseId || `CR-GRV-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      const activeProblem = userProblem || 'Citizen Grievance and Deficiency of Service'

      let filesData = []
      if (files && files.length > 0) {
        filesData = await Promise.all(files.map(file => new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => {
            const res = reader.result ? reader.result.toString() : ''
            const base64Str = res.includes(',') ? res.split(',')[1] : res
            resolve({
              filename: file.name,
              mime_type: file.type || 'application/octet-stream',
              base64: base64Str
            })
          }
          reader.onerror = () => resolve({ filename: file.name, mime_type: file.type || '', base64: '' })
          reader.readAsDataURL(file)
        })))
      }

      const payload = {
        case_id: activeCaseId,
        form_data: localForm,
        user_problem: activeProblem,
        language: language || 'English',
        files: filesData
      }

      const res = await grievanceGenerate(payload)

      setGrievanceResult(res)
      setStage('COMPLETE')
      router.push('/dashboard/grievance/result')
    } catch (err) {
      let errMsg = 'Failed to generate legal notice.'
      if (typeof err?.response?.data?.detail === 'string') {
        errMsg = err.response.data.detail
      } else if (Array.isArray(err?.response?.data?.detail)) {
        errMsg = err.response.data.detail.map(d => d.msg || JSON.stringify(d)).join(', ')
      } else if (err?.message) {
        errMsg = err.message
      }
      alert(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/bg.image.png')"
      }}
    >
      {/* Step Badge */}
      <div className="mb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-court-maroon bg-court-maroon/10 px-3 py-1 rounded-full border border-court-maroon/20">
          STEP 2
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-ashoka-navy mb-2 tracking-tight text-center">
        Complainant Details & Evidence
      </h1>

      <p className="text-slate-500 mb-8 text-center max-w-2xl">
        Provide your contact details and attach any supporting photos, bills,
        or notices to empower the legal notice.
      </p>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white border border-[#b8c2cc] rounded-3xl p-8 shadow-sm space-y-6"
      >
        {schema.map(field => (
          <div
            key={field.key}
            className="space-y-2 text-left"
          >
            <label className="block text-xs font-bold text-ashoka-navy uppercase tracking-wider">
              {field.label}
            </label>

            <input
              type="text"
              required
              value={localForm[field.key] || ''}
              onChange={e =>
                handleChange(field.key, e.target.value)
              }
              placeholder={field.placeholder}
              className="w-full bg-[#FAF8F5] border border-slate-300 rounded-xl px-4 py-3.5 text-ashoka-navy placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-court-maroon/30 focus:border-court-maroon transition-all text-sm font-medium"
            />
          </div>
        ))}

        {/* File Upload */}
        <div className="space-y-2 text-left pt-2">
          <label className="block text-xs font-bold text-ashoka-navy uppercase tracking-wider">
            Upload Proof / Evidence (Optional)
          </label>

          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-court-maroon transition-colors bg-[#FAF8F5]">
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
              id="proof-upload"
            />

            <label
              htmlFor="proof-upload"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <Upload
                size={24}
                className="text-court-maroon"
              />

              <span className="text-sm font-semibold text-ashoka-navy">
                Click to upload photos or PDFs
              </span>

              <span className="text-xs text-slate-400">
                AI Vision will analyze your receipts, bills, or damage photos
              </span>
            </label>

            {files.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {files.map((file, index) => (
                  <span
                    key={`${file.name}-${index}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-xs font-medium text-slate-700 rounded-lg shadow-sm"
                  >
                    <FileText
                      size={13}
                      className="text-court-maroon"
                    />

                    {file.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => { setStage('IDLE'); router.push('/dashboard'); }}
            className="btn-ghost text-sm cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-base py-3 px-8 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Analyzing Evidence & Drafting...
              </>
            ) : (
              <>
                Generate Legal Notice
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
