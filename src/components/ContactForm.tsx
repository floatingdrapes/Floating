import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Sparkles, Send, CheckCircle } from 'lucide-react';
import { insertInquiryToSupabase } from '../services/supabaseClient';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    projectType: 'Luxury Curtains & Linens',
    location: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      alert('Please fill out the required Fields (Name, Phone, Email)');
      return;
    }

    setIsSubmitting(true);

    try {
      // Dispatch server-side SMTP email notification to floatingdrips@gmail.com
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'Enquiry Contact Form',
          formData: formData,
          result: `Project Classification: ${formData.projectType}, Location: ${formData.location || 'Not specified'}, Message: ${formData.message || 'None'}`
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const responseData = await res.json();
      console.log('Server dispatched enquiry details:', responseData);

      const newInquiry = {
        id: 'c-' + Date.now(),
        ...formData,
        timestamp: new Date().toISOString()
      };

      // Save to Supabase universally (if configured)
      await insertInquiryToSupabase(newInquiry);

      const submissions = JSON.parse(localStorage.getItem('floatingdrapes_contacts') || '[]');
      submissions.push(newInquiry);
      localStorage.setItem('floatingdrapes_contacts', JSON.stringify(submissions));

      setIsSuccess(true);
      
      // Clear fields
      setFormData({
        name: '',
        phone: '',
        email: '',
        projectType: 'Luxury Curtains & Linens',
        location: '',
        message: '',
      });
    } catch (err) {
      console.error('Failed to dispatch contact notification:', err);
      // Fallback gracefully to keep client-side functioning if server is down or unconfigured
      const fallbackInquiry = {
        id: 'c-' + Date.now(),
        ...formData,
        timestamp: new Date().toISOString()
      };
      insertInquiryToSupabase(fallbackInquiry).catch(console.error);

      const submissions = JSON.parse(localStorage.getItem('floatingdrapes_contacts') || '[]');
      submissions.push(fallbackInquiry);
      localStorage.setItem('floatingdrapes_contacts', JSON.stringify(submissions));
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const projectTypes = [
    'Luxury Curtains & Linens',
    'Fine Textured Wallpapers',
    'Architectural Room Styling',
    'Full Estate Renovation',
    'Commercial Lounge Styling'
  ];

  return (
    <div className="bg-luxury-bg text-white py-12 lg:py-20" id="contact-form-wrapper">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* LEFT COLUMN: EDITORIAL BRIEF & OFFICE INFOS (5 columns) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div>
              <div className="flex items-center space-x-2 text-gold mb-4">
                <Sparkles className="h-4 w-4" />
                <span className="font-sans text-[10px] font-bold tracking-[0.4em] uppercase">CONNECT WITH US</span>
              </div>
              
              <h2 className="font-serif text-3xl font-light text-white sm:text-4xl">
                Let's Curate <br />
                <span className="italic text-gold">Something Extraordinary.</span>
              </h2>
              
              <div className="h-[2px] w-12 bg-gold mt-6 mb-8" />
              
              <p className="font-sans text-xs font-light text-muted-text leading-relaxed max-w-md">
                Our advisors travel globally to style premier residences. Reach out to coordinate an in-home sample review or custom virtual rendering of your windows.
              </p>
            </div>

            {/* Direct Information Blocks */}
            <div className="space-y-6 pt-6 border-t border-gold/15">
              
              {/* Phone info */}
              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/5">
                  <Phone className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <span className="block text-[9px] font-bold tracking-widest text-gold uppercase">DIRECT CONCIERGE</span>
                  <a href="tel:+918884009398" className="font-serif text-sm text-white hover:text-gold transition-colors">+91 88840 09398</a>
                  <p className="text-[10px] text-muted-text mt-0.5">Mon - Sun: 10am - 8pm IST</p>
                </div>
              </div>

              {/* Email info */}
              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/5">
                  <Mail className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <span className="block text-[9px] font-bold tracking-widest text-gold uppercase">DIGITAL ADVISORY</span>
                  <a href="mailto:floatingdrapes@gmail.com" className="font-serif text-sm text-white hover:text-gold transition-colors">floatingdrapes@gmail.com</a>
                  <p className="text-[10px] text-muted-text mt-0.5">Response within 2 hours</p>
                </div>
              </div>

              {/* Location info */}
              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/5">
                  <MapPin className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <span className="block text-[9px] font-bold tracking-widest text-gold uppercase">FLAGSHIP STUDIO</span>
                  <span className="font-serif text-sm text-white">712, Niladhri Main Road, Begur Hobli, Chikkathoguru, Bengaluru, Karnataka 560100</span>
                  <p className="text-[10px] text-muted-text mt-0.5">Scheduled appointments only</p>
                </div>
              </div>

            </div>

            {/* Security trust badge */}
            <div className="bg-white/[0.02] border border-gold/10 p-4 text-[10px] text-muted-text font-light flex items-center space-x-2">
              <span className="text-gold">🛡</span>
              <span>We prioritize client confidentiality. Your data is never shared.</span>
            </div>
          </div>

          {/* RIGHT COLUMN: LUXURY INTERACTIVE CONTACT FORM (7 columns) */}
          <div className="lg:col-span-7 bg-luxury-sec border border-gold/15 p-6 sm:p-10 relative">
            
            {/* Corner Bracket decorations */}
            <div className="absolute top-3 right-3 h-4 w-4 border-t border-r border-gold/20" />
            <div className="absolute bottom-3 left-3 h-4 w-4 border-b border-l border-gold/20" />

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-12"
                id="contact-success-screen"
              >
                <div className="h-14 w-14 rounded-full bg-gold/10 border border-gold flex items-center justify-center text-gold mb-6 animate-bounce">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <span className="font-sans text-[10px] tracking-[0.3em] text-gold uppercase mb-2">PROPOSAL RECEIVED</span>
                <h3 className="font-serif text-2xl text-white mb-4">Aesthetic Brief Registered</h3>
                <p className="font-sans text-xs text-muted-text max-w-md leading-relaxed mb-8">
                  Thank you, {formData.name || 'valued customer'}. Our master cataloging team is reviewing your project details. We will reach out via phone and email shortly to confirm your booking.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="bg-gold hover:bg-gold-soft text-luxury-bg px-8 py-3.5 text-xs font-bold tracking-widest uppercase transition-colors"
                >
                  SEND ANOTHER INQUIRY
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Row 1: Name and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] font-bold tracking-[0.2em] text-gold uppercase mb-2">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full bg-white/5 border border-gold/15 px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-gold transition-colors rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold tracking-[0.2em] text-gold uppercase mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-white/5 border border-gold/15 px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-gold transition-colors rounded-none"
                    />
                  </div>
                </div>

                {/* Row 2: Email and Project Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] font-bold tracking-[0.2em] text-gold uppercase mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. eleanor@vancedesign.com"
                      className="w-full bg-white/5 border border-gold/15 px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-gold transition-colors rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold tracking-[0.2em] text-gold uppercase mb-2">Project Classification</label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full bg-luxury-sec border border-gold/15 px-3 py-3 text-xs text-white focus:outline-none focus:border-gold transition-colors rounded-none"
                    >
                      {projectTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: Physical Location */}
                <div>
                  <label className="block text-[9px] font-bold tracking-[0.2em] text-gold uppercase mb-2">Project Location (City, Area)</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Begur Hobli, Bengaluru"
                    className="w-full bg-white/5 border border-gold/15 px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-gold transition-colors rounded-none"
                  />
                </div>

                {/* Row 4: Custom aesthetic message brief */}
                <div>
                  <label className="block text-[9px] font-bold tracking-[0.2em] text-gold uppercase mb-2">Architectural Brief / Message</label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your room proportions, light angles, and color preferences..."
                    className="w-full bg-white/5 border border-gold/15 px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-gold transition-colors rounded-none"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative w-full bg-gold hover:bg-gold-soft text-luxury-bg py-4 text-xs font-bold tracking-[0.25em] uppercase transition-all duration-300 flex items-center justify-center space-x-2 rounded-none disabled:opacity-50"
                    id="submit-contact-btn"
                  >
                    {isSubmitting ? (
                      <span>TRANSMITTING BRIEF...</span>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>SUBMIT ENQUIRY BRIEF</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
