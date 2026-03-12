"use client";

import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase-client';
import { toast } from 'sonner';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';

type FormErrors = {
  email?: string
  password?: string
}

export default function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<FormErrors>({})
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/home');
      }
    };
    checkUser();
  }, [router]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    if (!email.trim()) newErrors.email = 'Email is required.'
    if (!password) newErrors.password = 'Password is required.'
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });

        if (error) {
          setError(error.message)
        } else {
          setIsSignUp(false)
          toast.success('Sign up successful, check your email for the confirmation link')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          setError(error.message)
        } else {
          router.push('/home');
        }
      }
    } catch (err) {
      toast.error('Unexpected error occurred. Please try again.')
    }
  };

  const handleToggle = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setErrors({})
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          {isSignUp ? 'Sign Up' : 'Please log in to continue.'}
        </h1>

        <FieldGroup className="mt-4">
          <Field data-invalid={!!errors.email || undefined}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                className="pl-10"
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
            {errors.email && <FieldError className="text-red-500">{errors.email}</FieldError>}
          </Field>

          <Field data-invalid={!!errors.password || undefined}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
                className="pl-10"
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            </div>
            {errors.password && <FieldError className="text-red-500">{errors.password}</FieldError>}
          </Field>
        </FieldGroup>

        <Button className="mt-4 w-full">
          {isSignUp ? 'Sign up' : 'Log in'} <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>

        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}

        <p
          className="text-center cursor-pointer text-blue-500 hover:text-blue-700 mt-5"
          onClick={handleToggle}
        >
          {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </p>
      </div>
    </form>
  );
}