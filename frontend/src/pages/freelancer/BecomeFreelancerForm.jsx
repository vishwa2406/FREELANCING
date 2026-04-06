import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { freelancerAPI } from '../../services/api';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import { motion } from 'framer-motion';

export default function BecomeFreelancerForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: user?.name || '',
    email: user?.email || '',
    user_id: user?._id || '',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    location: user?.location || '',
    primary_skills: '',
    experience_level: '',
    years_of_experience: '',
    portfolio_links: '',
    preferred_project_types: '',
    rate: '',
    availability: '',
    timezone: '',
    screening_expertise: '',
    screening_deadlines: '',
    screening_past_project: ''
  });

  const set = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
  };

  const handleSubmit = async () => {
    // client‑side validation
    if (form.bio.length < 50) {
      toast('Bio must be at least 50 characters.', 'error');
      return;
    }
    const skillsArr = form.skills.split(',').map((s) => s.trim()).filter(Boolean);
    if (skillsArr.length > 5) {
      toast('You can specify at most 5 skills.', 'error');
      return;
    }
    if (!form.portfolio_links) {
      toast('Portfolio link is required.', 'error');
      return;
    }
    try {
      const payload = {
        bio: form.bio,
        skills: skillsArr,
        portfolio: form.portfolio_links,
        experienceLevel: form.experience_level,
        yearsOfExperience: Number(form.years_of_experience),
        primarySkills: form.primary_skills.split(',').map((s) => s.trim()).filter(Boolean),
        rate: form.rate,
        availability: Number(form.availability),
        timezone: form.timezone,
        screeningAnswers: {
          expertise: form.screening_expertise,
          deadlines: form.screening_deadlines,
          pastProject: form.screening_past_project
        }
      };
      const { data } = await freelancerAPI.requestJoin(payload);
      if (data.success) {
        toast('Freelancer request submitted successfully!', 'success');
        navigate('/freelancer');
      } else {
        toast(data.message || 'Submission failed.', 'error');
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Submission error', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-surface-50">Become a Freelancer</h1>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-dark rounded-2xl p-6 space-y-4">
        {/* Locked fields */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Email" value={form.email} disabled={true} />
          <Input label="User ID" value={form.user_id} disabled={true} />
        </div>
        {/* Editable pre‑filled fields */}
        <Input label="Full Name" value={form.full_name} onChange={set('full_name')} placeholder="Your full name" />
        <Textarea label="Bio / About" value={form.bio} onChange={set('bio')} placeholder="Tell us about yourself..." />
        <Input label="Skills (comma‑separated)" value={form.skills} onChange={set('skills')} placeholder="React, Node.js, UI Design" />
        <Input label="Location" value={form.location} onChange={set('location')} placeholder="Country" />
        {/* Additional required fields */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Primary Skills (max 5)" value={form.primary_skills} onChange={set('primary_skills')} placeholder="React, Node.js" />
          <div className="space-y-1">
            <label className="text-sm font-medium text-surface-400">Experience Level</label>
            <select className="w-full p-2 bg-surface-900 text-surface-50 rounded-lg border border-surface-700 outline-none focus:border-brand-500" value={form.experience_level} onChange={set('experience_level')}>
              <option value="">Select Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Years of Experience" type="number" value={form.years_of_experience} onChange={set('years_of_experience')} placeholder="e.g., 3" />
          <div className="space-y-1">
            <label className="text-sm font-medium text-surface-400">Timezone</label>
            <select className="w-full p-2 bg-surface-900 text-surface-50 rounded-lg border border-surface-700 outline-none focus:border-brand-500" value={form.timezone} onChange={set('timezone')}>
              <option value="">Select Timezone</option>
              {['UTC', 'Asia/Kolkata', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'].map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>
        <Input label="Portfolio Links (comma‑separated)" value={form.portfolio_links} onChange={set('portfolio_links')} placeholder="https://myportfolio.com" />
        <div className="grid sm:grid-cols-3 gap-4">
          <Input label="Preferred Project Types" value={form.preferred_project_types} onChange={set('preferred_project_types')} placeholder="Web dev, Mobile" />
          <Input label="Hourly / Fixed Rate" value={form.rate} onChange={set('rate')} placeholder="$30‑$50/hr" />
          <Input label="Availability (hrs/wk)" type="number" value={form.availability} onChange={set('availability')} placeholder="20" />
        </div>
        {/* Screening questions */}
        <Textarea label="Describe your expertise in your main skill" value={form.screening_expertise} onChange={set('screening_expertise')} placeholder="..." />
        <Textarea label="How do you handle deadlines?" value={form.screening_deadlines} onChange={set('screening_deadlines')} placeholder="..." />
        <Textarea label="Describe a past project you are proud of" value={form.screening_past_project} onChange={set('screening_past_project')} placeholder="..." />
        <Button onClick={handleSubmit} size="lg">Submit Request</Button>
      </motion.div>
    </div>
  );
}
