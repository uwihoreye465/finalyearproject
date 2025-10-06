# Flutter Web Image Upload Solution

## Problem Identified

Your Flutter web app is encountering the error:
```
Image upload error: Unsupported operation: _Namespace
```

This happens because Flutter web creates blob URLs (`blob:http://localhost:62706/...`) which cannot be directly uploaded to a server as files.

## Root Cause

1. **Flutter Web Limitation**: Blob URLs are browser-specific and cannot be read as files by the server
2. **File Reading Error**: The `File.readAsBytes()` method doesn't work the same way on web as on mobile
3. **Fallback to Placeholder**: When upload fails, the app falls back to placeholder URL

## Solutions

### Solution 1: Convert Blob to Base64 (Recommended)

Update your Flutter web image upload code:

```dart
// For Flutter Web
import 'dart:html' as html;
import 'dart:convert';

Future<String> convertFileToBase64(File file) async {
  if (kIsWeb) {
    // For web platform
    final reader = html.FileReader();
    final completer = Completer<String>();
    
    reader.onLoad.listen((event) {
      final result = reader.result as String;
      final base64String = result.split(',')[1]; // Remove data:image/...;base64, prefix
      completer.complete(base64String);
    });
    
    reader.readAsDataUrl(file);
    return completer.future;
  } else {
    // For mobile platforms
    final bytes = await file.readAsBytes();
    return base64Encode(bytes);
  }
}

// Usage in your upload function
Future<void> uploadImage() async {
  try {
    final base64Image = await convertFileToBase64(selectedFile);
    
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/arrested/upload-image'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'image': base64Image,
        'filename': selectedFile.name,
      }),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      setState(() {
        imageUrl = data['imageUrl'];
      });
    }
  } catch (e) {
    print('Image upload error: $e');
    // Don't set placeholder URL, let it be null
  }
}
```

### Solution 2: Use FormData with Proper File Handling

```dart
Future<void> uploadImageWithFormData() async {
  try {
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$baseUrl/api/v1/arrested/'),
    );
    
    if (kIsWeb) {
      // For web, use the file directly
      final bytes = await selectedFile.readAsBytes();
      final multipartFile = http.MultipartFile.fromBytes(
        'image',
        bytes,
        filename: selectedFile.name,
      );
      request.files.add(multipartFile);
    } else {
      // For mobile
      final multipartFile = await http.MultipartFile.fromPath(
        'image',
        selectedFile.path,
      );
      request.files.add(multipartFile);
    }
    
    // Add other fields
    request.fields['fullname'] = fullnameController.text;
    request.fields['crime_type'] = crimeTypeController.text;
    // ... other fields
    
    final response = await request.send();
    
    if (response.statusCode == 201) {
      // Success
      final responseData = await response.stream.bytesToString();
      final data = jsonDecode(responseData);
      print('Upload successful: ${data['data']['image_url']}');
    }
  } catch (e) {
    print('Upload error: $e');
    // Don't set placeholder URL
  }
}
```

### Solution 3: Backend API Endpoint for Base64 Images

The backend already has this endpoint: `POST /api/v1/arrested/upload-image`

Use this endpoint to upload base64 images:

```dart
Future<String?> uploadBase64Image(String base64Image, String filename) async {
  try {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/arrested/upload-image'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'image': base64Image,
        'filename': filename,
      }),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['imageUrl'];
    }
  } catch (e) {
    print('Base64 upload error: $e');
  }
  return null;
}
```

## Backend Changes Made

1. **Blob URL Detection**: The backend now detects blob URLs and ignores them
2. **Better Logging**: Added comprehensive logging to track image upload issues
3. **Null Handling**: Properly handles null values instead of placeholder URLs

## Testing

1. **Test with real file upload** (multipart/form-data)
2. **Test with base64 upload** (JSON with base64 string)
3. **Test without image** (should save as null)

## Expected Console Output

When you upload an image, you should see:
```
🚀 ===== NEW ARRESTED RECORD REQUEST =====
📋 File: { fieldname: 'image', originalname: 'test.jpg', ... }
📸 Image uploaded successfully: /uploads/arrested/images/...
```

When blob URL is detected:
```
⚠️ Blob URL detected - cannot be saved: blob:http://localhost:62706/...
💡 This is a Flutter web limitation. Image upload failed.
```

## Next Steps

1. Update your Flutter web code to use one of the solutions above
2. Test the image upload functionality
3. Verify that images are properly saved to the server
4. Check that the database stores actual file paths, not placeholder URLs
