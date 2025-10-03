<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function upload(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|file|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048', // 2MB max
            ]);

            $file = $request->file('file');
            
            if (!$file || !$file->isValid()) {
                return response()->json([
                    'success' => false,
                    'message' => 'File tidak valid atau corrupted'
                ], 400);
            }
            
            // Generate unique filename
            $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            
            // Ensure uploads directory exists
            if (!Storage::disk('public')->exists('uploads')) {
                Storage::disk('public')->makeDirectory('uploads');
            }
            
            // Store file in public/uploads directory
            $path = $file->storeAs('uploads', $filename, 'public');
            
            if (!$path) {
                throw new \Exception('Gagal menyimpan file ke storage');
            }
            
            // Return the URL
            $url = Storage::url($path);
            
            return response()->json([
                'success' => true,
                'url' => $url,
                'filename' => $filename,
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType()
            ]);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal: ' . implode(', ', $e->validator->errors()->all())
            ], 422);
        } catch (\Exception $e) {
            Log::error('File upload error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Upload gagal: ' . $e->getMessage()
            ], 500);
        }
    }
}
