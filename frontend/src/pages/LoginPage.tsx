import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, LogIn, KeyRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { AuthTemplate } from '../components/templates/AuthTemplate';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { FormField } from '../components/molecules/FormField';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(data);
      addToast('Login berhasil', 'success');
      navigate('/attendance');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Email atau password salah.';
      addToast(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (email: string, pass: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
  };

  return (
    <AuthTemplate
      title="Masuk ke Akun Anda"
      subtitle="Silakan masukkan kredensial untuk presensi WFH"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Alamat Email" error={errors.email?.message} required>
          <div className="relative">
            <Input
              type="email"
              placeholder="nama@company.com"
              {...register('email')}
              className="pl-10"
              disabled={isLoading}
            />
            <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </FormField>

        <FormField label="Kata Sandi" error={errors.password?.message} required>
          <div className="relative">
            <Input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className="pl-10"
              disabled={isLoading}
            />
            <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </FormField>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          <LogIn className="w-4 h-4 mr-2" />
          Masuk ke Portal
        </Button>
      </form>

      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-2">
          <KeyRound className="w-3.5 h-3.5 text-blue-600" />
          <span>Akun Demo:</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickFill('admin@company.com', 'AdminWFH#2026')}
            className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-left transition-colors cursor-pointer"
          >
            <span className="font-medium block">HR Admin</span>
            <span className="text-[11px] text-slate-500 block truncate">admin@company.com</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('budi@company.com', 'BudiWFH#2026')}
            className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-left transition-colors cursor-pointer"
          >
            <span className="font-medium block">Karyawan</span>
            <span className="text-[11px] text-slate-500 block truncate">budi@company.com</span>
          </button>
        </div>
      </div>
    </AuthTemplate>
  );
};
