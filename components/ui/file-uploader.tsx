"use client"

import { useState } from "react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Paperclip, X, FileText, Loader2, UploadCloud } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface FileUploaderProps {
    value?: string[]
    onChange: (urls: string[]) => void
    disabled?: boolean
    maxFiles?: number
}

export function FileUploader({ value = [], onChange, disabled = false, maxFiles = 5 }: FileUploaderProps) {
    const [uploading, setUploading] = useState(false)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        if (value.length + files.length > maxFiles) {
            toast.error(`Máximo ${maxFiles} archivos permitidos`)
            e.target.value = ""
            return
        }

        setUploading(true)
        const newUrls: string[] = []

        try {
            // Processing sequentially to avoid overwhelming server or chaotic state
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const formData = new FormData()
                formData.append("file", file)

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData
                })

                if (!res.ok) {
                    const err = await res.json()
                    throw new Error(err.error || "Error al subir")
                }

                const data = await res.json()
                newUrls.push(data.url)
            }

            onChange([...value, ...newUrls])
            toast.success("Archivos adjuntados correctamente")
        } catch (error: any) {
            console.error("Upload error:", error)
            toast.error(error.message || "Error al subir archivo")
        } finally {
            setUploading(false)
            e.target.value = "" // Always reset
        }
    }

    const removeFile = (urlToRemove: string) => {
        onChange(value.filter(url => url !== urlToRemove))
    }

    const isImage = (url: string) => {
        const ext = url.split('.').pop()?.toLowerCase() || ""
        return ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
    }

    const isLimitReached = value.length >= maxFiles
    const isDisabled = disabled || uploading || isLimitReached

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative inline-block">
                    <input
                        type="file"
                        id="file-upload-input"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                        accept="image/*,.pdf"
                        multiple
                        onChange={handleFileSelect}
                        disabled={isDisabled}
                    />
                    <label
                        htmlFor="file-upload-input"
                        className={cn(
                            buttonVariants({ variant: "outline" }),
                            "relative gap-2 border-dashed border-2 font-medium text-slate-600 transition-all h-auto py-3 pr-12",
                            "hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600",
                            isDisabled && "pointer-events-none opacity-50 bg-slate-50"
                        )}
                    >
                        {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                        ) : (
                            <UploadCloud className="h-4 w-4" />
                        )}

                        <span className="flex flex-col items-start leading-tight">
                            <span className="text-xs font-bold uppercase tracking-wide">
                                {uploading ? "Subiendo Archivos..." : "Adjuntar Evidencia"}
                            </span>
                            {!uploading && (
                                <span className="text-[9px] text-slate-400 font-normal normal-case">
                                    Clic para seleccionar (PDF, JPG, PNG)
                                </span>
                            )}
                        </span>
                    </label>
                </div>

                <div className="text-xs text-slate-400 font-medium">
                    {value.length} de {maxFiles} archivos
                </div>
            </div>

            {value.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {value.map((url, idx) => (
                        <div key={idx} className="group relative rounded-xl border border-slate-200 bg-slate-50 p-2 flex items-center gap-3 overflow-hidden shadow-sm hover:shadow-md transition-all">
                            <div className="h-10 w-10 shrink-0 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-slate-100">
                                {isImage(url) ? (
                                    <div className="relative h-full w-full">
                                        <Image
                                            src={url}
                                            alt="Adjunto"
                                            fill
                                            className="object-cover"
                                            sizes="40px"
                                        />
                                    </div>
                                ) : (
                                    <FileText className="h-5 w-5 text-red-500" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-semibold text-slate-700 truncate block hover:underline"
                                >
                                    {url.split('/').pop()}
                                </a>
                                <span className="text-[10px] text-slate-400 font-medium uppercase">
                                    {isImage(url) ? "Imagen" : "Documento"}
                                </span>
                            </div>

                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => removeFile(url)}
                                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/80 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
