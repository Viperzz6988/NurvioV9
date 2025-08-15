import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Dice3, Gamepad2, Sparkles, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const HomePage = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: Gamepad2,
      title: t('home.games'),
      description: t('games.description'),
      href: '/spiele/lobby',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Dice3,
      title: t('home.random'),
      description: t('random.wheel.description'),
      href: '/zufall/muenzwurf',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Cloud,
      title: t('home.weather'),
      description: t('weather.description'),
      href: '/wetter',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <div className="relative">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          poster="/background-poster.jpg"
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>
        
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <div className="flex justify-center mb-8">
              <div className="glass-card inline-flex items-center space-x-2 px-6 py-3">
                <Sparkles className="text-primary" size={20} />
                <span className="text-sm font-medium">Nurvio Hub</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              {t('home.welcome')}
            </h1>
            
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-foreground">
              {t('home.subtitle')}
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              {t('home.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                asChild 
                size="lg" 
                className="btn-glass bg-gradient-primary hover:shadow-hover text-lg px-8 py-4"
              >
                <Link to="/spiele/lobby">
                  {t('home.explore')}
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="btn-glass text-lg px-8 py-4"
              >
                <Link to="/kontakt">
                  {t('contact.title')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('home.explore')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className="glass-card hover-lift group cursor-pointer transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${feature.gradient} p-4 mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon size={32} className="text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                  {feature.href !== '#' && (
                    <div className="mt-4 text-center">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={feature.href}>
                          {t('home.explore')}
                          <ArrowRight size={16} className="ml-1" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;