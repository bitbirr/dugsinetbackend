import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Users, 
  FileText, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  X,
  AlertCircle
} from 'lucide-react';
import { 
  configService, 
  DocumentType, 
  BloodGroup, 
  Nationality, 
  GuardianRelationship 
} from '../../lib/configService';
import { db } from '../../lib/supabase';

const StudentOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Configuration data from database
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [bloodGroups, setBloodGroups] = useState<BloodGroup[]>([]);
  const [nationalities, setNationalities] = useState<Nationality[]>([]);
  const [guardianRelationships, setGuardianRelationships] = useState<GuardianRelationship[]>([]);
  const [configLoading, setConfigLoading] = useState(true);

  const [formData, setFormData] = useState({
    // Personal Information
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    nationality: '',
    blood_group: '',
    address: '',
    emergency_contact: '',
    previous_school: '',
    medical_conditions: '',
    
    // Guardians
    guardians: [
      {
        full_name: '',
        relationship: '',
        phone: '',
        email: '',
        occupation: '',
        address: '',
        is_primary: true
      }
    ],
    
    // Documents
    documents: [] as File[],
    document_types: [] as string[]
  });

  const steps = [
    { id: 1, title: 'Personal Info', icon: User },
    { id: 2, title: 'Guardian Info', icon: Users },
    { id: 3, title: 'Documents', icon: FileText },
    { id: 4, title: 'Review', icon: CheckCircle }
  ];

  // Load configuration data on component mount
  useEffect(() => {
    const loadConfigData = async () => {
      try {
        setConfigLoading(true);
        setError('');

        const [docTypes, bloodGroupsData, nationalitiesData, relationshipsData] = await Promise.all([
          configService.getDocumentTypes(),
          configService.getBloodGroups(),
          configService.getNationalities(),
          configService.getGuardianRelationships()
        ]);

        setDocumentTypes(docTypes);
        setBloodGroups(bloodGroupsData);
        setNationalities(nationalitiesData);
        setGuardianRelationships(relationshipsData);
      } catch (err) {
        console.error('Error loading configuration data:', err);
        setError('Failed to load configuration data. Please refresh the page.');
      } finally {
        setConfigLoading(false);
      }
    };

    loadConfigData();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleGuardianChange = (index: number, field: string, value: string | boolean) => {
    const updatedGuardians = [...formData.guardians];
    updatedGuardians[index] = { ...updatedGuardians[index], [field]: value };
    setFormData(prev => ({ ...prev, guardians: updatedGuardians }));
  };

  const addGuardian = () => {
    setFormData(prev => ({
      ...prev,
      guardians: [
        ...prev.guardians,
        {
          full_name: '',
          relationship: '',
          phone: '',
          email: '',
          occupation: '',
          address: '',
          is_primary: false
        }
      ]
    }));
  };

  const removeGuardian = (index: number) => {
    if (formData.guardians.length > 1) {
      const updatedGuardians = formData.guardians.filter((_, i) => i !== index);
      // Ensure at least one guardian is primary
      if (!updatedGuardians.some(g => g.is_primary) && updatedGuardians.length > 0) {
        updatedGuardians[0].is_primary = true;
      }
      setFormData(prev => ({ ...prev, guardians: updatedGuardians }));
    }
  };

  const handleFileUpload = (files: FileList | null, documentType: string) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, and PDF files are allowed');
      return;
    }

    // Check if document type already exists
    const existingIndex = formData.document_types.indexOf(documentType);
    
    if (existingIndex >= 0) {
      // Replace existing document
      const updatedDocuments = [...formData.documents];
      updatedDocuments[existingIndex] = file;
      setFormData(prev => ({ ...prev, documents: updatedDocuments }));
    } else {
      // Add new document
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, file],
        document_types: [...prev.document_types, documentType]
      }));
    }

    setError('');
  };

  const removeDocument = (index: number) => {
    const updatedDocuments = formData.documents.filter((_, i) => i !== index);
    const updatedDocumentTypes = formData.document_types.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      documents: updatedDocuments,
      document_types: updatedDocumentTypes
    }));
  };

  const generateGRNumber = async (): Promise<string> => {
    try {
      return await configService.generateGRNumber();
    } catch (error) {
      console.error('Error generating GR number:', error);
      // Fallback to timestamp-based GR number
      const timestamp = Date.now().toString();
      return `GR${timestamp.slice(-8)}`;
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.first_name.trim()) {
          setError('First name is required');
          return false;
        }
        if (!formData.last_name.trim()) {
          setError('Last name is required');
          return false;
        }
        if (!formData.date_of_birth) {
          setError('Date of birth is required');
          return false;
        }
        if (!formData.gender) {
          setError('Gender is required');
          return false;
        }
        if (!formData.nationality) {
          setError('Nationality is required');
          return false;
        }
        if (!formData.address.trim()) {
          setError('Address is required');
          return false;
        }
        if (!formData.emergency_contact.trim()) {
          setError('Emergency contact is required');
          return false;
        }
        break;
      
      case 2:
        if (formData.guardians.length === 0) {
          setError('At least one guardian is required');
          return false;
        }
        
        for (let i = 0; i < formData.guardians.length; i++) {
          const guardian = formData.guardians[i];
          if (!guardian.full_name.trim()) {
            setError(`Guardian ${i + 1}: Full name is required`);
            return false;
          }
          if (!guardian.relationship) {
            setError(`Guardian ${i + 1}: Relationship is required`);
            return false;
          }
          if (!guardian.phone.trim()) {
            setError(`Guardian ${i + 1}: Phone number is required`);
            return false;
          }
        }
        
        if (!formData.guardians.some(g => g.is_primary)) {
          setError('At least one guardian must be marked as primary');
          return false;
        }
        break;
      
      case 3:
        const requiredDocTypes = documentTypes.filter(dt => dt.is_required);
        const missingRequired = requiredDocTypes.filter(dt => 
          !formData.document_types.includes(dt.value)
        );
        
        if (missingRequired.length > 0) {
          setError(`Required documents missing: ${missingRequired.map(dt => dt.label).join(', ')}`);
          return false;
        }
        break;
    }
    
    setError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const submitApplication = async () => {
    if (!validateStep(4)) return;

    try {
      setLoading(true);
      setError('');

      // Generate GR number
      const grNumber = await generateGRNumber();

      // Create student record
      const studentData = {
        gr_number: grNumber,
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        nationality: formData.nationality,
        blood_group: formData.blood_group || null,
        address: formData.address,
        emergency_contact: formData.emergency_contact,
        previous_school: formData.previous_school || null,
        medical_conditions: formData.medical_conditions || null,
        enrollment_status: 'pending',
        created_at: new Date().toISOString()
      };

      const { data: student, error: studentError } = await db.createStudent(studentData);
      
      if (studentError) throw studentError;

      // Create guardian records
      for (const guardianData of formData.guardians) {
        // Determine guardian_type based on relationship
        let guardianType: 'father' | 'mother' | 'guardian' | 'emergency_contact' = 'guardian';
        
        const relationship = guardianData.relationship.toLowerCase();
        if (relationship === 'father') {
          guardianType = 'father';
        } else if (relationship === 'mother') {
          guardianType = 'mother';
        } else if (relationship === 'emergency contact') {
          guardianType = 'emergency_contact';
        } else {
          guardianType = 'guardian';
        }

        const { error: guardianError } = await db.createStudentGuardian({
          student_id: student[0].id,
          guardian_type: guardianType,
          full_name: guardianData.full_name,
          relationship: guardianData.relationship,
          phone: guardianData.phone,
          email: guardianData.email || null,
          occupation: guardianData.occupation || null,
          address: guardianData.address || null,
          is_primary: guardianData.is_primary
        });
        
        if (guardianError) throw guardianError;
      }

      // Upload documents
      for (let i = 0; i < formData.documents.length; i++) {
        const file = formData.documents[i];
        const documentType = formData.document_types[i];
        
        // Create document record
        const { error: docError } = await db.createStudentDocument({
          student_id: student[0].id,
          document_type: documentType,
          document_name: file.name,
          file_url: `placeholder_url_${file.name}`, // Placeholder URL since file upload isn't implemented yet
          file_size: file.size
        });
        
        if (docError) throw docError;
      }

      setSuccess(`Application submitted successfully! Your GR Number is: ${grNumber}`);
      
      // Reset form after successful submission
      setTimeout(() => {
        navigate('/students');
      }, 3000);

    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while configuration data is being fetched
  if (configLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading configuration data...</p>
          </div>
        </div>
      </div>
    );
  }

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => handleInputChange('first_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter first name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => handleInputChange('last_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter last name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nationality <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.nationality}
            onChange={(e) => handleInputChange('nationality', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Select nationality</option>
            {nationalities.map((nationality) => (
              <option key={nationality.id} value={nationality.value}>
                {nationality.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blood Group
          </label>
          <select
            value={formData.blood_group}
            onChange={(e) => handleInputChange('blood_group', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Select blood group</option>
            {bloodGroups.map((bloodGroup) => (
              <option key={bloodGroup.id} value={bloodGroup.value}>
                {bloodGroup.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            rows={3}
            placeholder="Enter full address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Emergency Contact <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.emergency_contact}
            onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter emergency contact number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Previous School
          </label>
          <input
            type="text"
            value={formData.previous_school}
            onChange={(e) => handleInputChange('previous_school', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter previous school name"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medical Conditions
          </label>
          <textarea
            value={formData.medical_conditions}
            onChange={(e) => handleInputChange('medical_conditions', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            rows={3}
            placeholder="Enter any medical conditions or allergies"
          />
        </div>
      </div>
    </div>
  );

  const renderGuardianInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Guardian Information</h3>
        <button
          type="button"
          onClick={addGuardian}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Add Guardian
        </button>
      </div>

      {formData.guardians.map((guardian, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-800">Guardian {index + 1}</h4>
            {formData.guardians.length > 1 && (
              <button
                type="button"
                onClick={() => removeGuardian(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={guardian.full_name}
                onChange={(e) => handleGuardianChange(index, 'full_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship <span className="text-red-500">*</span>
              </label>
              <select
                value={guardian.relationship}
                onChange={(e) => handleGuardianChange(index, 'relationship', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select relationship</option>
                {guardianRelationships.map((relationship) => (
                  <option key={relationship.id} value={relationship.value}>
                    {relationship.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={guardian.phone}
                onChange={(e) => handleGuardianChange(index, 'phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={guardian.email}
                onChange={(e) => handleGuardianChange(index, 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Occupation
              </label>
              <input
                type="text"
                value={guardian.occupation}
                onChange={(e) => handleGuardianChange(index, 'occupation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter occupation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={guardian.address}
                onChange={(e) => handleGuardianChange(index, 'address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows={2}
                placeholder="Enter address"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={guardian.is_primary}
                  onChange={(e) => {
                    // Ensure only one primary guardian
                    if (e.target.checked) {
                      const updatedGuardians = formData.guardians.map((g, i) => ({
                        ...g,
                        is_primary: i === index
                      }));
                      setFormData(prev => ({ ...prev, guardians: updatedGuardians }));
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Primary Guardian</span>
              </label>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Upload</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentTypes.map((docType) => (
          <div key={docType.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-800">
                {docType.label}
                {docType.is_required && <span className="text-red-500 ml-1">*</span>}
              </h4>
              {formData.document_types.includes(docType.id) && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
            
            {docType.description && (
              <p className="text-sm text-gray-600 mb-3">{docType.description}</p>
            )}
            
            <div className="space-y-2">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => handleFileUpload(e.target.files, docType.value)}
                className="hidden"
                id={`file-${docType.id}`}
              />
              <label
                htmlFor={`file-${docType.id}`}
                className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50"
              >
                <Upload className="w-5 h-5 mr-2 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {formData.document_types.includes(docType.value) ? 'Replace File' : 'Upload File'}
                </span>
              </label>
              <p className="text-xs text-gray-500">
                Supported formats: JPG, PNG, PDF (Max 5MB)
              </p>
            </div>
          </div>
        ))}
      </div>

      {formData.documents.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-800 mb-3">Uploaded Documents</h4>
          <div className="space-y-2">
            {formData.documents.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({documentTypes.find(dt => dt.value === formData.document_types[index])?.label})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Application</h3>
      
      {/* Personal Information Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Personal Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium">Name:</span> {formData.first_name} {formData.last_name}</div>
          <div><span className="font-medium">Date of Birth:</span> {formData.date_of_birth}</div>
          <div><span className="font-medium">Gender:</span> {formData.gender}</div>
          <div><span className="font-medium">Nationality:</span> {formData.nationality}</div>
          {formData.blood_group && <div><span className="font-medium">Blood Group:</span> {formData.blood_group}</div>}
          <div><span className="font-medium">Emergency Contact:</span> {formData.emergency_contact}</div>
        </div>
        <div className="mt-3">
          <div><span className="font-medium">Address:</span> {formData.address}</div>
        </div>
        {formData.previous_school && (
          <div className="mt-3">
            <div><span className="font-medium">Previous School:</span> {formData.previous_school}</div>
          </div>
        )}
        {formData.medical_conditions && (
          <div className="mt-3">
            <div><span className="font-medium">Medical Conditions:</span> {formData.medical_conditions}</div>
          </div>
        )}
      </div>

      {/* Guardians Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Guardian Information
        </h4>
        {formData.guardians.map((guardian, index) => (
          <div key={index} className="mb-4 last:mb-0">
            <div className="font-medium text-gray-700 mb-2">
              Guardian {index + 1} {guardian.is_primary && '(Primary)'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 ml-4">
              <div>Name: {guardian.full_name}</div>
              <div>Relationship: {guardian.relationship}</div>
              <div>Phone: {guardian.phone}</div>
              {guardian.email && <div>Email: {guardian.email}</div>}
              {guardian.occupation && <div>Occupation: {guardian.occupation}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Documents Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Uploaded Documents
        </h4>
        <div className="space-y-2">
          {formData.documents.map((file, index) => (
            <div key={index} className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              <span>{documentTypes.find(dt => dt.value === formData.document_types[index])?.label}</span>
              <span className="ml-2 text-gray-400">({file.name})</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <CheckCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Application Ready for Submission</p>
            <p>Please review all information carefully. Once submitted, the application will be sent for admin review. You will receive a confirmation with your application reference number.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/students')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Students
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Student Onboarding</h1>
        <p className="text-gray-600 mt-2">Complete the student admission process</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'bg-green-600 border-green-600 text-white' 
                  : 'border-gray-300 text-gray-400'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <div className="ml-3">
                <div className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-green-600' : 'text-gray-400'
                }`}>
                  Step {step.id}
                </div>
                <div className={`text-xs ${
                  currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}

        {currentStep === 1 && renderPersonalInfo()}
        {currentStep === 2 && renderGuardianInfo()}
        {currentStep === 3 && renderDocuments()}
        {currentStep === 4 && renderReview()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center px-6 py-2 rounded-lg ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submitApplication}
              disabled={loading}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
              <CheckCircle className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentOnboarding;