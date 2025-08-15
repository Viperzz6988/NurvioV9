import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export type AuthMode = 'login' | 'signup';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: AuthMode;
}

const emailSchema = z.string().email();
const passwordSchema = z.string().min(6);
const nameSchema = z.string().min(2);

const AuthModal: React.FC<AuthModalProps> = ({ open, onOpenChange, mode }) => {
  const { t } = useLanguage();
  const { login, signup } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = mode === 'login'
    ? z.object({
        email: emailSchema,
        password: passwordSchema,
      })
    : z.object({
        name: nameSchema,
        email: emailSchema,
        password: passwordSchema,
      });

  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);
    try {
      if (mode === 'login') {
        await login({ email: (data as any).email, password: (data as any).password });
      } else {
        await signup({ name: (data as any).name, email: (data as any).email, password: (data as any).password });
      }
      onOpenChange(false);
      reset();
    } catch (err: any) {
      const code = err?.code || err?.message;
      // Map known error codes to i18n keys
      const key = code && typeof code === 'string' ? (code as any) : 'common.error';
      setSubmitError(t(key));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl animate-scale-in">
        <DialogHeader>
          <DialogTitle>
            {mode === 'login' ? t('auth.login') : t('auth.signup')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login' ? t('auth.loginSubtitle') : t('auth.signupSubtitle')}
          </DialogDescription>
          <p className="text-xs text-muted-foreground mt-1">{t('auth.info.dbRequired')}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="name">{t('auth.name')}</Label>
              <Input id="name" {...register('name' as any)} placeholder={t('auth.placeholder.name')} />
              {errors.hasOwnProperty('name') && (
                <p className="text-sm text-destructive">{t('auth.validation.name')}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input id="email" type="email" {...register('email' as any)} placeholder={t('auth.placeholder.email')} />
            {errors.hasOwnProperty('email') && (
              <p className="text-sm text-destructive">{t('auth.validation.email')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input id="password" type="password" {...register('password' as any)} placeholder={t('auth.placeholder.password')} />
            {errors.hasOwnProperty('password') && (
              <p className="text-sm text-destructive">{t('auth.validation.password')}</p>
            )}
          </div>

          {submitError && <div className="text-sm text-destructive">{submitError}</div>}

          <Button type="submit" className="w-full py-3 bg-gradient-primary">
            {isSubmitting ? t('common.loading') : (mode === 'login' ? t('auth.submitLogin') : t('auth.submitSignup'))}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;