# Debug Flutter Image Upload Issue

## Current Problem

Your Flutter app is showing:
```
Uploading image: blob:http://localhost:62706/8d1380ae-6e9b-40f1-898f-d03353668c7b
Image upload error: Unsupported operation: _Namespace
Image uploaded successfully: https://via.placeholder.com/300x200?text=Image+Upload+Failed
```

## Debugging Steps

### Step 1: Check Server Logs

When you try to upload an image, check your server console. You should see:

```
🚀 ===== NEW ARRESTED RECORD REQUEST =====
📋 Request Method: POST
📋 Request URL: /api/v1/arrested/
📋 Content-Type: application/json
📋 Body: { ... }
📋 File: No file uploaded
📝 Processed requestData: { ... }
⚠️ Blob URL detected - cannot be saved: blob:http://localhost:62706/...
💡 This is a Flutter web limitation. Image upload failed.
🔍 Debug - finalImageUrl: null
🔍 Debug - Complete arrestData: { ... }
```

**If you DON'T see these logs**, the request is not reaching the server.

### Step 2: Check Network Tab

1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Try to upload an image
4. Look for the POST request to `/api/v1/arrested/`
5. Check the request payload

### Step 3: Test Backend Directly

Run the test script:
```bash
node test_blob_url_handling.js
```

This will test if the backend is properly handling blob URLs.

### Step 4: Check Flutter Code

The issue is likely in your Flutter code. Look for:

1. **Error Handling**: The app catches the error and sets a placeholder URL
2. **Request Format**: The app might not be sending the request correctly
3. **File Reading**: The `File.readAsBytes()` method fails on web

### Step 5: Fix Flutter Code

Replace your image upload code with this:

```dart
import 'dart:html' as html;
import 'dart:convert';
import 'package:flutter/foundation.dart';

Future<void> uploadImage() async {
  try {
    if (kIsWeb) {
      // For web platform - convert to base64
      final reader = html.FileReader();
      final completer = Completer<String>();
      
      reader.onLoad.listen((event) {
        final result = reader.result as String;
        final base64String = result.split(',')[1]; // Remove data:image/...;base64, prefix
        completer.complete(base64String);
      });
      
      reader.readAsDataUrl(selectedFile);
      final base64Image = await completer.future;
      
      // Upload base64 image
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
    } else {
      // For mobile platforms - use multipart
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/api/v1/arrested/'),
      );
      
      final multipartFile = await http.MultipartFile.fromPath(
        'image',
        selectedFile.path,
      );
      request.files.add(multipartFile);
      
      // Add other fields
      request.fields['fullname'] = fullnameController.text;
      request.fields['crime_type'] = crimeTypeController.text;
      // ... other fields
      
      final response = await request.send();
      
      if (response.statusCode == 201) {
        final responseData = await response.stream.bytesToString();
        final data = jsonDecode(responseData);
        setState(() {
          imageUrl = data['data']['image_url'];
        });
      }
    }
  } catch (e) {
    print('Image upload error: $e');
    // DON'T set placeholder URL - let it be null
    setState(() {
      imageUrl = null;
    });
  }
}
```

### Step 6: Alternative - Use FormData for Web

```dart
Future<void> uploadImageWithFormData() async {
  try {
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$baseUrl/api/v1/arrested/'),
    );
    
    if (kIsWeb) {
      // For web, read file as bytes
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

## Expected Results

After fixing the Flutter code:

1. **Server logs should show**: Blob URL detected and ignored
2. **Database should store**: `null` instead of placeholder URL
3. **Flutter app should show**: No image or proper error message
4. **No more placeholder URLs** in the database

## Quick Test

1. Run `node test_blob_url_handling.js`
2. Check server console for logs
3. Verify database stores `null` for image_url
4. Update Flutter code with the solutions above
