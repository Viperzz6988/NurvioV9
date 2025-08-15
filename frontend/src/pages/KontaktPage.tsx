import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, Phone, MapPin, Send, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const KontaktPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Nachricht gesendet! 📧",
        description: "Vielen Dank für deine Nachricht. Wir melden uns bald bei dir!"
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'E-Mail',
      value: 'hello@nurvio-hub.com',
      description: 'Schreib uns eine E-Mail'
    },
    {
      icon: Clock,
      title: 'Antwortzeit',
      value: '24-48 Stunden',
      description: 'Übliche Antwortzeit'
    },
    {
      icon: Users,
      title: 'Support',
      value: 'Community Forum',
      description: 'Hilfe von der Community'
    }
  ];

  const faqItems = [
    {
      question: 'Sind die Spiele kostenlos?',
      answer: 'Ja, alle Spiele und Tools auf Nurvio Hub sind vollständig kostenlos nutzbar.'
    },
    {
      question: 'Funktioniert alles auf mobilen Geräten?',
      answer: 'Absolut! Alle unsere Anwendungen sind responsive und funktionieren perfekt auf Smartphones und Tablets.'
    },
    {
      question: 'Kann ich Spiele vorschlagen?',
      answer: 'Gerne! Schicke uns deine Ideen über das Kontaktformular. Wir prüfen alle Vorschläge.'
    },
    {
      question: 'Gibt es eine mobile App?',
      answer: 'Aktuell nicht, aber unsere Web-App funktioniert wie eine native App auf deinem Gerät.'
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Kontakt
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hast du Fragen, Anregungen oder Feedback? Wir freuen uns auf deine Nachricht!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare size={24} />
                  <span>Nachricht senden</span>
                </CardTitle>
                <CardDescription>
                  Fülle das Formular aus und wir melden uns so schnell wie möglich bei dir.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Dein Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-Mail *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="deine@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Betreff *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="Worum geht es?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Nachricht *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Schreib uns deine Nachricht..."
                      rows={6}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-primary hover:shadow-hover"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <MessageSquare className="mr-2 animate-pulse" size={20} />
                        Wird gesendet...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2" size={20} />
                        Nachricht senden
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info & FAQ */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Kontakt Information</CardTitle>
                <CardDescription>
                  So erreichst du uns am besten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((info, index) => (
                  <div key={info.title} className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">{info.title}</div>
                      <div className="text-primary font-medium">{info.value}</div>
                      <div className="text-sm text-muted-foreground">{info.description}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Help */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Schnelle Hilfe</CardTitle>
                <CardDescription>
                  Häufig gestellte Fragen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqItems.map((item, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4">
                    <div className="font-medium text-sm mb-1">{item.question}</div>
                    <div className="text-xs text-muted-foreground">{item.answer}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Community</CardTitle>
                <CardDescription>
                  Folge uns für Updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground">
                  <p className="mb-4">
                    Wir sind noch am Aufbau unserer Social Media Präsenz. 
                    Bald findest du uns auf verschiedenen Plattformen!
                  </p>
                  <div className="text-sm">
                    📧 Newsletter coming soon<br />
                    🐦 Twitter updates planned<br />
                    💬 Discord community in planning
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare size={20} />
                <span>Feedback</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Dein Feedback hilft uns dabei, Nurvio Hub zu verbessern. 
                Egal ob Lob, Kritik oder Verbesserungsvorschläge - wir hören zu!
              </p>
              <Button variant="outline" className="w-full">
                Feedback geben
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users size={20} />
                <span>Bug Report</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Hast du einen Fehler entdeckt? Hilf uns dabei, 
                Nurvio Hub noch besser zu machen, indem du Bugs meldest.
              </p>
              <Button variant="outline" className="w-full">
                Bug melden
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KontaktPage;