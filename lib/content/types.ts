export type AccentKey = 'plasma' | 'ember' | 'aurora' | 'gold';

export type AppCategory =
  | 'Web App'
  | 'Mobile — iOS'
  | 'Mobile — Android'
  | 'Mobile — Cross-platform'
  | 'Desktop'
  | 'CLI Tool'
  | 'Library / SDK'
  | 'Chrome Extension';

export interface Feature {
  icon:        string;
  title:       string;
  description: string;
}

export interface Screenshot {
  src:    string;
  alt:    string;
  width:  number;
  height: number;
}

export interface AppEntry {
  slug:            string;
  name:            string;
  tagline:         string;
  description:     string;
  icon:            string;
  accentKey:       AccentKey;
  category:        AppCategory;
  year:            number;
  features:        Feature[];
  screenshots:     Screenshot[];
  videoUrl:        string | null;
  liveUrl:         string;
  coverScreenshot: number;
}

export interface ContactFormInput {
  name:    string;
  email:   string;
  message: string;
}

export interface ContactSubmission extends ContactFormInput {
  id:         string;
  created_at: string;
}

export interface ContactApiSuccess {
  ok: true;
  id: string;
}

export interface ContactApiError {
  ok:      false;
  error:   'VALIDATION_ERROR' | 'METHOD_NOT_ALLOWED' | 'INTERNAL_ERROR';
  fields?: Partial<Record<keyof ContactFormInput, string>>;
}

export type ContactApiResponse = ContactApiSuccess | ContactApiError;
