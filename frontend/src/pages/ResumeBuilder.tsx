import React, { useState, useCallback } from 'react';
// Adjust the import path as necessary
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import Textarea from '../components/ui/Textarea';
import { ChevronLeft, ChevronRight, Download, Edit2, Plus, Trash2 } from 'lucide-react';

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    summary: string;
  };
  education: { school: string; degree: string; year: string }[];
  experience: { company: string; position: string; duration: string; description: string }[];
  skills: string[];
}

const ResumeBuilder = () => {
  const [step, setStep] = useState(1);
  const [isPreview, setIsPreview] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      summary: ''
    },
    education: [{ school: '', degree: '', year: '' }],
    experience: [{ company: '', position: '', duration: '', description: '' }],
    skills: ['']
  });

  // Memoized handlers to prevent unnecessary re-renders
  const handlePersonalInfoChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.preventDefault(); // Prevent default behavior
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [name]: value
      }
    }));
  }, []);

  const handleEducationChange = useCallback((index: number, field: string, value: string) => {
    setResumeData(prev => {
      const newEducation = [...prev.education];
      newEducation[index] = { ...newEducation[index], [field]: value };
      return { ...prev, education: newEducation };
    });
  }, []);

  const handleExperienceChange = useCallback((index: number, field: string, value: string) => {
    setResumeData(prev => {
      const newExperience = [...prev.experience];
      newExperience[index] = { ...newExperience[index], [field]: value };
      return { ...prev, experience: newExperience };
    });
  }, []);

  const handleSkillChange = useCallback((index: number, value: string) => {
    setResumeData(prev => {
      const newSkills = [...prev.skills];
      newSkills[index] = value;
      return { ...prev, skills: newSkills };
    });
  }, []);




  const removeEducation = useCallback((index: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  }, []);

  const removeExperience = useCallback((index: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  }, []);

  const removeSkill = useCallback((index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  }, []);

  const downloadResume = useCallback(() => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(resumeData, null, 2)], {
      type: 'application/json',
    });
    element.href = URL.createObjectURL(file);
    element.download = 'resume.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [resumeData]);

  // Memoized form components
  const PersonalInfoForm = React.memo(() => (
    <FormSection title="Personal Information">
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6">
        <Input
          placeholder="Full Name"
          name="name"
          value={resumeData.personalInfo.name}
          onChange={handlePersonalInfoChange}
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
        />
        <Input
          placeholder="Email"
          name="email"
          type="email"
          value={resumeData.personalInfo.email}
          onChange={handlePersonalInfoChange}
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
        />
        <Input
          placeholder="Phone"
          name="phone"
          value={resumeData.personalInfo.phone}
          onChange={handlePersonalInfoChange}
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
        />
        <Textarea
          placeholder="Professional Summary"
          name="summary"
          value={resumeData.personalInfo.summary}
          onChange={handlePersonalInfoChange}
        />
      </form>
    </FormSection>
  ));


  // Rest of your component code remains the same...
  
  const FormSection = React.memo(({ children, title }: { children: React.ReactNode; title: string }) => (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
        {title}
      </h2>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  ));

  const EducationForm = () => (
    <FormSection title="Education">
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {resumeData.education.map((edu, index) => (
          <div 
            key={index} 
            className="p-6 rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm
              transition-all duration-300 hover:border-gray-600"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Entry {index + 1}</h3>
                {index > 0 && (
                  <Button
                    type="button" // Explicitly set button type
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      const newEducation = resumeData.education.filter((_, i) => i !== index);
                      setResumeData({ ...resumeData, education: newEducation });
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
              <div className="grid gap-4">
                <Input
                  placeholder="School/University"
                  value={edu.school}
                  onChange={(e) => {
                    e.preventDefault();
                    const newEducation = [...resumeData.education];
                    newEducation[index].school = e.target.value;
                    setResumeData({ ...resumeData, education: newEducation });
                  }}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400"
                />
                {/* Similar changes for other inputs */}
              </div>
            </div>
          </div>
        ))}
        <Button 
          type="button" // Explicitly set button type
          onClick={(e) => {
            e.preventDefault();
            addEducation();
          }} 
          className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90"
        >
          <Plus size={16} className="mr-2" /> Add Education
        </Button>
      </form>
    </FormSection>
  );

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        { company: '', position: '', duration: '', description: '' }
      ]
    });
  };

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        { school: '', degree: '', year: '' }
      ]
    });
  };

  const addSkill = () => {
    setResumeData({
      ...resumeData,
      skills: [
        ...resumeData.skills,
        ''
      ]
    });
  };

  const ExperienceForm = () => (
    <FormSection title="Experience">
      <div className="space-y-6">
        {resumeData.experience.map((exp, index) => (
          <div 
            key={index} 
            className="p-6 rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm
              transition-all duration-300 hover:border-gray-600"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Entry {index + 1}</h3>
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newExperience = resumeData.experience.filter((_, i) => i !== index);
                      setResumeData({ ...resumeData, experience: newExperience });
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
              <div className="grid gap-4">
                <Input
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) => {
                    const newExperience = [...resumeData.experience];
                    newExperience[index].company = e.target.value;
                    setResumeData({ ...resumeData, experience: newExperience });
                  }}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400"
                />
                <Input
                  placeholder="Position"
                  value={exp.position}
                  onChange={(e) => {
                    const newExperience = [...resumeData.experience];
                    newExperience[index].position = e.target.value;
                    setResumeData({ ...resumeData, experience: newExperience });
                  }}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400"
                />
                <Input
                  placeholder="Duration"
                  value={exp.duration}
                  onChange={(e) => {
                    const newExperience = [...resumeData.experience];
                    newExperience[index].duration = e.target.value;
                    setResumeData({ ...resumeData, experience: newExperience });
                  }}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400"
                />
                <Textarea
                  placeholder="Description"
                  value={exp.description}
                  onChange={(e) => {
                    const newExperience = [...resumeData.experience];
                    newExperience[index].description = e.target.value;
                    setResumeData({ ...resumeData, experience: newExperience });
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        <Button 
          onClick={addExperience} 
          className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90"
        >
          <Plus size={16} className="mr-2" /> Add Experience
        </Button>
      </div>
    </FormSection>
  );

  const SkillsForm = () => (
    <FormSection title="Skills">
      {resumeData.skills.map((skill, index) => (
        <div key={index} className="flex items-center space-x-4 mb-4">
          <Input
            placeholder={`Skill ${index + 1}`}
            value={skill}
            onChange={(e) => {
              const newSkills = [...resumeData.skills];
              newSkills[index] = e.target.value;
              setResumeData({ ...resumeData, skills: newSkills });
            }}
            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 flex-1"
          />
          {index > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newSkills = resumeData.skills.filter((_, i) => i !== index);
                setResumeData({ ...resumeData, skills: newSkills });
              }}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      ))}
      <Button 
        onClick={addSkill} 
        className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90"
      >
        <Plus size={16} className="mr-2" /> Add Skill
      </Button>
    </FormSection>
  );
  
  

  const ResumePreview = () => (
    <div className="space-y-6 p-8 bg-white text-gray-900 rounded-lg shadow-xl">
      <div className="text-center border-b pb-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
          {resumeData.personalInfo.name}
        </h1>
        <p className="text-gray-600 mt-2">{resumeData.personalInfo.email} | {resumeData.personalInfo.phone}</p>
      </div>

      <div>
        <h2 className="text-xl font-bold border-b border-gray-200 pb-2 mb-3">Summary</h2>
        <p className="text-gray-700 leading-relaxed">{resumeData.personalInfo.summary}</p>
      </div>

      <div>
        <h2 className="text-xl font-bold border-b border-gray-200 pb-2 mb-3">Education</h2>
        <div className="space-y-4">
          {resumeData.education.map((edu, index) => (
            <div key={index} className="group">
              <h3 className="font-semibold text-lg text-gray-800">{edu.school}</h3>
              <p className="text-gray-600">{edu.degree}</p>
              <p className="text-gray-500 text-sm">{edu.year}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold border-b border-gray-200 pb-2 mb-3">Experience</h2>
        <div className="space-y-6">
          {resumeData.experience.map((exp, index) => (
            <div key={index} className="group">
              <h3 className="font-semibold text-lg text-gray-800">{exp.company}</h3>
              <p className="text-gray-600 font-medium">{exp.position}</p>
              <p className="text-gray-500 text-sm mb-2">{exp.duration}</p>
              <p className="text-gray-700 leading-relaxed">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold border-b border-gray-200 pb-2 mb-3">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {resumeData.skills.map((skill, index) => (
            <span 
              key={index} 
              className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-black"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep = () => {
    if (isPreview) {
        return (
          <div className="space-y-6 ">
            <div className="flex justify-between items-center">
              <Button
                onClick={() => setIsPreview(false)}
                variant="outline"
                className="text-black border-gray-700 hover:bg-gray-800"
              >
                <Edit2 size={16} className="mr-2" /> Edit
              </Button>
              <Button
                onClick={() => {
                    downloadResume();
                    console.log('Download resume');
                }}
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90"
              >
                <Download size={16} className="mr-2" /> Download PDF
              </Button>
            </div>
            <ResumePreview />
          </div>
        );
      }
  
      switch (step) {
        case 1:
          return <PersonalInfoForm />;
        case 2:
          return <EducationForm />;
        case 3:
          return <ExperienceForm />;
        case 4:
          return <SkillsForm />;
        default:
          return null;
      }
    };
  
    return (
        <Card className="w-full max-w-screen-2xl mx-auto p-6 bg-pink-200 text-black">
          <form onSubmit={(e) => e.preventDefault()}>
            {renderStep()}
            
            {!isPreview && (
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setStep(step - 1);
                  }}
                  disabled={step === 1}
                  variant="outline"
                  className="text-black border-gray-700 hover:bg-gray-800"
                >
                  <ChevronLeft size={16} className="mr-2" /> Previous
                </Button>
                {step < 4 ? (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setStep(step + 1);
                    }}
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90"
                  >
                    Next <ChevronRight size={16} className="ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsPreview(true);
                    }}
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90"
                  >
                    Preview <ChevronRight size={16} className="ml-2" />
                  </Button>
                )}
              </div>
            )}
          </form>
        </Card>
      );
    };
    
    export default ResumeBuilder;