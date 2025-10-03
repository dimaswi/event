import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image } from 'lucide-react';

interface FileUploadProps {
    label: string;
    value?: string;
    onChange: (url: string) => void;
    accept?: string;
    placeholder?: string;
}

export function FileUpload({ label, value, onChange, accept = "image/*", placeholder }: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(value || null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('File terlalu besar. Maksimal 2MB.');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('File harus berupa gambar.');
            return;
        }

        setUploading(true);
        
        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', file);

            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                throw new Error('CSRF token tidak ditemukan');
            }

            // Upload file to server
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const fileUrl = data.url;
                setPreview(fileUrl);
                onChange(fileUrl);
            } else {
                throw new Error(data.message || 'Upload gagal');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert(`Error uploading file: ${error instanceof Error ? error.message : 'Silakan coba lagi.'}`);
        } finally {
            setUploading(false);
        }
    };

    const handleUrlChange = (url: string) => {
        setPreview(url);
        onChange(url);
    };

    const clearFile = () => {
        setPreview(null);
        onChange('');
    };

    return (
        <div className="space-y-3">
            <Label>{label}</Label>
            
            {/* Preview */}
            {preview && (
                <div className="relative inline-block">
                    <img 
                        src={preview} 
                        alt="Preview" 
                        className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                        onError={() => setPreview(null)}
                    />
                    <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={clearFile}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            )}

            {/* File Upload */}
            <div className="relative">
                <Input
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                />
                <Button 
                    variant="outline" 
                    disabled={uploading}
                    className="flex items-center gap-2 w-full"
                >
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Uploading...' : (preview ? 'Ganti File' : 'Upload File')}
                </Button>
            </div>
        </div>
    );
}
