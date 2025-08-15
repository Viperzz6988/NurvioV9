import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type SessionStartMode = 'choice' | 'login' | 'signup';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SessionStartModal: React.FC<Props> = ({ open, onOpenChange }) => {
  const { login, signup, loginAsGuest } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = React.useState<SessionStartMode>('choice');

  // Reset mode when closed
  useEffect(() => {
    if (!open) setMode('choice');
  }, [open]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });
  const signupForm = useForm<z.infer<typeof signupSchema>>({ resolver: zodResolver(signupSchema) });

  const submitLogin = async (values: z.infer<typeof loginSchema>) => {
    await login(values);
    onOpenChange(false);
  };

  const submitSignup = async (values: z.infer<typeof signupSchema>) => {
    await signup(values);
    onOpenChange(false);
  };

  const handleGuest = async () => {
    await loginAsGuest();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl animate-in fade-in zoom-in-95 duration-200">
        <DialogHeader>
          <DialogTitle>{t('auth.welcome')}</DialogTitle>
          <DialogDescription>{t('auth.chooseMethod')}</DialogDescription>
        </DialogHeader>

        {mode === 'choice' && (
          <div className="grid gap-3">
            <Button className="bg-gradient-primary py-3" onClick={() => setMode('login')}>{t('auth.login')}</Button>
            <Button variant="outline" className="py-3" onClick={() => setMode('signup')}>{t('auth.signup')}</Button>
            <Button variant="ghost" className="py-3" onClick={handleGuest}>{t('auth.continueAsGuest')}</Button>
          </div>
        )}

        {mode === 'login' && (
          <form className="space-y-4" onSubmit={loginForm.handleSubmit(submitLogin)}>
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input id="email" type="email" {...loginForm.register('email')} placeholder={t('auth.placeholder.email')} />
              {loginForm.formState.errors.email && (
                <p className="text-sm text-destructive">{t('auth.validation.email')}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input id="password" type="password" {...loginForm.register('password')} placeholder={t('auth.placeholder.password')} />
              {loginForm.formState.errors.password && (
                <p className="text-sm text-destructive">{t('auth.validation.password')}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-gradient-primary">{t('auth.submitLogin')}</Button>
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setMode('choice')}>{t('common.back')}</Button>
            </div>
          </form>
        )}

        {mode === 'signup' && (
          <form className="space-y-4" onSubmit={signupForm.handleSubmit(submitSignup)}>
            <div className="space-y-2">
              <Label htmlFor="name">{t('auth.name')}</Label>
              <Input id="name" {...signupForm.register('name')} placeholder={t('auth.placeholder.name')} />
              {signupForm.formState.errors.name && (
                <p className="text-sm text-destructive">{t('auth.validation.name')}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input id="email" type="email" {...signupForm.register('email')} placeholder={t('auth.placeholder.email')} />
              {signupForm.formState.errors.email && (
                <p className="text-sm text-destructive">{t('auth.validation.email')}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input id="password" type="password" {...signupForm.register('password')} placeholder={t('auth.placeholder.password')} />
              {signupForm.formState.errors.password && (
                <p className="text-sm text-destructive">{t('auth.validation.password')}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-gradient-primary">{t('auth.submitSignup')}</Button>
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setMode('choice')}>{t('common.back')}</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SessionStartModal;