# i18n Implementation Plan for GetImages Web Application

## Overview

This plan outlines the implementation of internationalization (i18n) for Korean and English languages using react-i18next, following the Next.js 15 App Router architecture and the guide from locize.com.

## Current Analysis

### Components Requiring Translation
Based on codebase analysis, the following components contain user-facing text:

1. **SearchPanel** (`src/components/search-panel.tsx`)
   - Keywords input label and instructions
   - Badge labels (Personal, Env Key, duplicates)
   - Button text (Search Images, Examples, Copy URLs)
   - Placeholder text and tooltips

2. **SettingsDialog** (`src/components/settings-dialog.tsx`)
   - Dialog titles and descriptions
   - API Key section text
   - Search options labels and values
   - Button text (Save, Clear, Reset)
   - Error and success messages

3. **ImageResultsDisplay** (`src/components/image-results-display.tsx`)
   - Image display headers
   - Selection indicators
   - Loading states

4. **SearchHistory** (`src/components/search-history.tsx`)
   - History display text
   - Action buttons

5. **Layout and Page** (`src/app/layout.tsx`, `src/app/page.tsx`)
   - Page metadata (title, description)
   - HTML lang attribute

## Implementation Strategy

### Phase 1: Core i18n Setup

#### 1.1 Dependencies Installation
```bash
pnpm add react-i18next i18next i18next-resources-to-backend
```

#### 1.2 Directory Structure
```
src/
├── i18n/
│   ├── index.ts                 # i18n configuration
│   ├── settings.ts              # i18n settings
│   └── locales/
│       ├── en/
│       │   ├── common.json      # Common UI text
│       │   ├── search.json      # Search-related text  
│       │   ├── settings.json    # Settings dialog text
│       │   └── metadata.json    # Page metadata
│       └── ko/
│           ├── common.json
│           ├── search.json
│           ├── settings.json
│           └── metadata.json
```

#### 1.3 i18n Configuration
- Client-side configuration with manual language selection and preference persistence
- Namespace separation for better organization
- Fallback to English for missing translations
- Cookie-based language persistence

#### 1.4 Next.js 15 App Router Integration
- Client-side language preference persistence
- Server-side rendering support
- Middleware for language routing (optional)
- Client component initialization

### Phase 2: Translation Files Creation

#### 2.1 English Translations (Baseline)
Extract all user-facing strings from components into JSON files:

**common.json**: Shared UI elements
- Button actions (Save, Cancel, Clear, Reset)
- Loading states (Loading..., Saving...)
- Status messages (Success, Error)

**search.json**: Search functionality
- Search form labels and placeholders
- Image results display text
- Search history text
- Badge and tooltip text

**settings.json**: Settings dialog
- Section headings (API Key, Search Options)
- Form labels and descriptions
- Option values and selections
- Help text and warnings

**metadata.json**: Page metadata
- Page titles and descriptions
- SEO-related text

#### 2.2 Korean Translations
Professional Korean translations maintaining:
- Technical accuracy for API-related terms
- Natural Korean UI conventions
- Consistency with existing Korean placeholders (삼계탕, etc.)

### Phase 3: Component Integration

#### 3.1 Hook Integration Pattern
```typescript
import { useTranslation } from 'react-i18next';

export function ComponentName() {
  const { t } = useTranslation('namespace');
  // Replace hardcoded strings with t('key')
}
```

#### 3.2 Component Updates Priority
1. **SearchPanel** - Core search functionality
2. **SettingsDialog** - Settings and configuration  
3. **ImageResultsDisplay** - Results display
4. **SearchHistory** - History functionality
5. **Layout** - Page structure and metadata

#### 3.3 Dynamic Content Handling
- Pluralization for count displays
- Date/time formatting
- Number formatting
- Error message interpolation

### Phase 4: Language Switching

#### 4.1 Language Switcher Component
Create `src/components/language-switcher.tsx`:
- Dropdown or toggle component
- Current language indicator
- Smooth language transitions
- Cookie persistence

#### 4.2 Integration Points
- Add to settings dialog
- Optional: Add to main toolbar
- Consider user preference storage

### Phase 5: Advanced Features

#### 5.1 Language-Aware Features
- **Search Examples**: Maintain Korean food examples for Korean locale
- **Error Messages**: Context-aware error translations
- **Date Formatting**: Locale-appropriate date displays

#### 5.2 SEO and Metadata
- Dynamic page titles based on language
- Language-appropriate meta descriptions
- HTML lang attribute updates
- Structured data localization

### Phase 6: Testing and Validation

#### 6.1 Translation Validation
- Complete translation coverage checking
- Missing key detection
- Pluralization rule testing

#### 6.2 Component Testing Updates
- Update existing Jest tests for i18n
- Mock translation functions in tests
- Test language switching functionality
- Verify fallback behavior

#### 6.3 Integration Testing
- Full user workflow testing in both languages
- API error message translations
- Form validation message translations

## Technical Considerations

### Next.js 15 App Router Specifics
- Client-side i18n initialization in root layout
- Dynamic imports for translation resources
- Hydration considerations for SSR
- Performance optimization with namespace splitting

### Performance Optimization
- Lazy loading of translation files
- Bundle size impact minimization
- Caching strategies for translation resources
- Tree-shaking of unused translations

### Accessibility (a11y)
- Screen reader compatibility
- Language announcement
- RTL support considerations (future Korean vertical text)
- Keyboard navigation preservation

### Browser Compatibility
- Language preference persistence
- LocalStorage vs Cookie preferences
- Mobile browser considerations

## Migration Strategy

### Development Approach
1. **Incremental Migration**: Update components one by one
2. **Feature Flags**: Optional temporary feature flagging
3. **Backward Compatibility**: Maintain existing functionality during transition
4. **Testing at Each Step**: Validate each component update

### Rollout Plan
1. **Phase 1**: Core setup and first component (SearchPanel)
2. **Phase 2**: Settings dialog and language switcher
3. **Phase 3**: Remaining components and full integration
4. **Phase 4**: Advanced features and optimization

## Maintenance Plan

### Translation Management
- Centralized translation key management
- Process for adding new translations
- Review process for translation accuracy
- Tools for translation validation

### Developer Guidelines
- i18n coding standards
- Translation key naming conventions
- Component update patterns
- Testing requirements for i18n features

## Success Metrics

### Functional Requirements
- [ ] Complete UI translation for Korean and English
- [ ] Seamless language switching
- [ ] No broken functionality in either language
- [ ] Proper fallback behavior

### Quality Requirements
- [ ] Translation accuracy and naturalness
- [ ] Performance impact < 10% bundle size increase
- [ ] No accessibility regressions
- [ ] Maintained test coverage > 85%

### User Experience Requirements  
- [ ] Intuitive language switching
- [ ] Consistent translation quality
- [ ] Proper Korean typography and spacing
- [ ] Maintained responsive design

## Risk Mitigation

### Technical Risks
- **Bundle Size**: Monitor and optimize translation loading
- **Performance**: Benchmark before/after implementation  
- **Compatibility**: Test across supported browsers
- **SSR Issues**: Validate server-side rendering behavior

### Content Risks
- **Translation Quality**: Professional review of Korean translations
- **Cultural Appropriateness**: Review Korean UI conventions
- **Technical Accuracy**: Validate API-related terminology

### Implementation Risks
- **Breaking Changes**: Incremental rollout with thorough testing
- **Component Coupling**: Maintain loose coupling during updates
- **Test Coverage**: Ensure test updates accompany component changes

## Timeline Estimate

- **Phase 1 (Setup)**: 1-2 days
- **Phase 2 (Translations)**: 2-3 days  
- **Phase 3 (Components)**: 3-4 days
- **Phase 4 (Language Switcher)**: 1 day
- **Phase 5 (Advanced Features)**: 1-2 days
- **Phase 6 (Testing)**: 2-3 days

**Total Estimated Time**: 10-15 days

## Implementation Notes

### Korean Language Considerations
- Maintain existing Korean food examples (삼계탕, 김치찌개, etc.)
- Follow Korean UI text conventions
- Consider Korean typography requirements
- Validate Korean search functionality

### English Language Baseline
- Use existing English text as baseline
- Ensure consistency with current UI patterns
- Maintain technical accuracy
- Preserve existing user experience

This plan provides a comprehensive approach to implementing i18n while maintaining the application's current functionality and user experience quality.