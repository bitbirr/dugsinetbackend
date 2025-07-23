import { db } from './supabase';

export interface DocumentType {
  id: string;
  value: string;
  label: string;
  description?: string;
  is_required: boolean;
  is_active: boolean;
  display_order: number;
}

export interface BloodGroup {
  id: string;
  value: string;
  label: string;
  is_active: boolean;
  display_order: number;
}

export interface Nationality {
  id: string;
  value: string;
  label: string;
  country_code?: string;
  is_active: boolean;
  display_order: number;
}

export interface GuardianRelationship {
  id: string;
  value: string;
  label: string;
  guardian_type: 'father' | 'mother' | 'guardian' | 'emergency_contact';
  is_active: boolean;
  display_order: number;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  data_type: 'string' | 'number' | 'boolean' | 'json';
  is_public: boolean;
}

class ConfigService {
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  private getFromCache(key: string): any {
    if (this.isCacheValid(key)) {
      return this.cache.get(key);
    }
    return null;
  }

  async getDocumentTypes(): Promise<DocumentType[]> {
    const cacheKey = 'document_types';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await db.getDocumentTypes();
      if (error) throw error;
      
      this.setCache(cacheKey, data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching document types:', error);
      // Return fallback data
      return [
        { id: '1', value: 'birth_certificate', label: 'Birth Certificate', is_required: true, is_active: true, display_order: 1 },
        { id: '2', value: 'passport_photo', label: 'Passport Photo', is_required: true, is_active: true, display_order: 2 },
        { id: '3', value: 'previous_school_records', label: 'Previous School Records', is_required: false, is_active: true, display_order: 3 },
        { id: '4', value: 'medical_records', label: 'Medical Records', is_required: false, is_active: true, display_order: 4 },
        { id: '5', value: 'other', label: 'Other Documents', is_required: false, is_active: true, display_order: 5 }
      ];
    }
  }

  async getBloodGroups(): Promise<BloodGroup[]> {
    const cacheKey = 'blood_groups';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await db.getBloodGroups();
      if (error) throw error;
      
      this.setCache(cacheKey, data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching blood groups:', error);
      // Return fallback data
      return [
        { id: '1', value: 'A+', label: 'A+', is_active: true, display_order: 1 },
        { id: '2', value: 'A-', label: 'A-', is_active: true, display_order: 2 },
        { id: '3', value: 'B+', label: 'B+', is_active: true, display_order: 3 },
        { id: '4', value: 'B-', label: 'B-', is_active: true, display_order: 4 },
        { id: '5', value: 'AB+', label: 'AB+', is_active: true, display_order: 5 },
        { id: '6', value: 'AB-', label: 'AB-', is_active: true, display_order: 6 },
        { id: '7', value: 'O+', label: 'O+', is_active: true, display_order: 7 },
        { id: '8', value: 'O-', label: 'O-', is_active: true, display_order: 8 }
      ];
    }
  }

  async getNationalities(): Promise<Nationality[]> {
    const cacheKey = 'nationalities';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await db.getNationalities();
      if (error) throw error;
      
      this.setCache(cacheKey, data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching nationalities:', error);
      // Return fallback data
      return [
        { id: '1', value: 'Somali', label: 'Somali', country_code: 'SO', is_active: true, display_order: 1 },
        { id: '2', value: 'Ethiopian', label: 'Ethiopian', country_code: 'ET', is_active: true, display_order: 2 },
        { id: '3', value: 'Kenyan', label: 'Kenyan', country_code: 'KE', is_active: true, display_order: 3 },
        { id: '4', value: 'American', label: 'American', country_code: 'US', is_active: true, display_order: 4 },
        { id: '5', value: 'Other', label: 'Other', is_active: true, display_order: 99 }
      ];
    }
  }

  async getGuardianRelationships(): Promise<GuardianRelationship[]> {
    const cacheKey = 'guardian_relationships';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await db.getGuardianRelationships();
      if (error) throw error;
      
      this.setCache(cacheKey, data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching guardian relationships:', error);
      // Return fallback data
      return [
        { id: '1', value: 'Father', label: 'Father', guardian_type: 'father', is_active: true, display_order: 1 },
        { id: '2', value: 'Mother', label: 'Mother', guardian_type: 'mother', is_active: true, display_order: 2 },
        { id: '3', value: 'Guardian', label: 'Legal Guardian', guardian_type: 'guardian', is_active: true, display_order: 3 },
        { id: '4', value: 'Emergency Contact', label: 'Emergency Contact', guardian_type: 'emergency_contact', is_active: true, display_order: 4 }
      ];
    }
  }

  async getSystemSetting(key: string): Promise<string | null> {
    const cacheKey = `setting_${key}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await db.getSystemSetting(key);
      if (error) throw error;
      
      const value = data?.value || null;
      this.setCache(cacheKey, value);
      return value;
    } catch (error) {
      console.error(`Error fetching system setting ${key}:`, error);
      return null;
    }
  }

  async generateGRNumber(): Promise<string> {
    try {
      const prefix = await this.getSystemSetting('gr_number_prefix') || 'GR';
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `${prefix}${year}${random}`;
    } catch (error) {
      console.error('Error generating GR number:', error);
      // Fallback to default format
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `GR${year}${random}`;
    }
  }

  async getFileUploadConfig(): Promise<{
    maxSizeMB: number;
    allowedTypes: string[];
  }> {
    try {
      const maxSizeMB = parseInt(await this.getSystemSetting('max_file_size_mb') || '5');
      const allowedTypesStr = await this.getSystemSetting('allowed_file_types') || '["image/jpeg", "image/png", "image/jpg", "application/pdf"]';
      const allowedTypes = JSON.parse(allowedTypesStr);
      
      return { maxSizeMB, allowedTypes };
    } catch (error) {
      console.error('Error fetching file upload config:', error);
      // Return fallback configuration
      return {
        maxSizeMB: 5,
        allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      };
    }
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  clearCacheKey(key: string): void {
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
  }
}

export const configService = new ConfigService();