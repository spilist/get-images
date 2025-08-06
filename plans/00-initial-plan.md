# Image Search & Preview Application Implementation Plan

## Overview
Build a modern image search application that allows users to search for images using multiple keywords and preview/select results with an easy copy-to-clipboard feature.

## Implementation Strategy

### 1. **API Integration Analysis**
- **Existing API**: `POST /api/scraper` (Python serverless function)
- **Input Format**: `{"keywords": ["keyword1", "keyword2"], "max_results_per_keyword": 3}`  
- **Output Format**: `{success: true, results: {keyword1: {images: [{url, title, source}]}}}`
- **CORS**: Already configured for frontend integration

### 2. **Frontend Architecture** 
- **Framework**: Next.js 15 + TypeScript (existing setup)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React useState/useEffect hooks
- **File Structure**: Replace existing `src/app/page.tsx` with new implementation

### 3. **UI Components & Layout**

#### **Main Layout (3-column responsive design):**
- **Left Panel**: Keyword input form
- **Center Panel**: Image preview grid (grouped by keyword)  
- **Right Panel**: Selected results list with copy functionality

#### **Key Components:**
- **Input Section**: **Multi-line textarea for keywords** (one keyword per line)
- **Search Button**: Triggers API call with loading state
- **Image Grid**: Displays 3 images per keyword with selection
- **Results Panel**: Shows "- [keyword]: [url]" format with copy button
- **Error Handling**: User-friendly error messages

### 4. **Core Features**

#### **Search Functionality:**
- **Textarea input**: One keyword per line (allows commas within keywords)
- **Parsing**: Split by newlines (`\n`) and trim whitespace
- **Validation**: Remove empty lines, limit to max 10 keywords
- Call `/api/scraper` with proper request format
- Handle loading states and errors

#### **Image Selection:**
- Display up to 3 images per keyword as clickable thumbnails
- First image auto-selected by default
- Visual indication of selected image
- Store selections in component state

#### **Copy to Clipboard:**
- Format: `- keyword: image_url` (one per line)
- Use native `navigator.clipboard.writeText()` API
- Success/error feedback to user
- No external dependencies required

### 5. **Technical Implementation Steps**

1. **Create plans directory and save this plan** to `/plans/00-initial-plan.md`
2. **Setup shadcn/ui components** (Textarea, Button, Card, Badge, etc.)
3. **Create main page component** with responsive layout
4. **Implement keyword textarea form** with newline-based parsing and validation
5. **Build API integration** with proper TypeScript types
6. **Create image preview grid** with selection logic  
7. **Implement results panel** with copy functionality
8. **Add loading states** and error handling
9. **Style with Tailwind CSS** for modern appearance

### 6. **User Experience Features**
- **Responsive Design**: Works on desktop/mobile
- **Newline-separated keywords**: User-friendly for complex keywords containing commas
- **Loading Indicators**: During API calls
- **Error Messages**: Clear feedback for failures
- **Visual Feedback**: Selected images, copy success
- **Validation**: Keyword limits and input checks
- **Placeholder text**: Clear instructions on textarea (e.g., "Enter keywords, one per line...")

This plan creates a complete, production-ready image search application with improved keyword input handling that supports complex keywords containing punctuation.