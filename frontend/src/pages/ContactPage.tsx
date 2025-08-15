import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, User, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ContactPage = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const newErrors: { name?: string; email?: string; message?: string } = {};
    if (!formData.name.trim()) newErrors.name = t('auth.validation.name');
    if (!formData.email.trim() || !emailRegex.test(formData.email)) newErrors.email = t('auth.validation.email');
    if (!formData.message.trim()) newErrors.message = t('contact.message');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1200);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">
            {t('contact.title')}
          </h1>
          <p className="text-muted-foreground">{t('contact.description')}</p>
        </div>

        {/* Visible email */}
        <Card className="glass-card mb-8">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Mail className="text-white" size={20} />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t('contact.emailAddress')}</div>
              <a href="mailto:contact@nurvio-hub.de" className="text-lg font-semibold text-primary hover:underline">
                contact@nurvio-hub.de
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Contact form */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare size={22} />
              {t('contact.title')}
            </CardTitle>
            <CardDescription>{t('contact.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="text-center py-12 animate-fade-in">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-2xl font-bold text-green-500 mb-2">{t('contact.success')}</h3>
                <p className="text-muted-foreground">{t('contact.responseSoon')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User size={16} />
                    {t('contact.name')}
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('contact.placeholder.name')}
                    required
                    className={`glass-card ${errors.name ? 'border-destructive' : ''}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail size={16} />
                    {t('contact.email')}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('contact.placeholder.email')}
                    required
                    className={`glass-card ${errors.email ? 'border-destructive' : ''}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    {t('contact.message')}
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('contact.placeholder.message')}
                    rows={6}
                    required
                    className={`glass-card resize-none ${errors.message ? 'border-destructive' : ''}`}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 ${isSubmitting ? 'bg-muted animate-pulse' : 'bg-gradient-primary hover:shadow-hover hover:scale-105'}`}
                >
                  <Send className="mr-2" size={20} />
                  {isSubmitting ? t('contact.sending') : t('contact.send')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactPage;