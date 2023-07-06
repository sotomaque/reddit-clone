import { Icons } from '@/components/Icons';
import Link from 'next/link';
import UserAuthForm from './UserAuthForm';

export const SignIn = () => {
  return (
    <div className="container mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <Icons.logo className="h-6 w-6 mx-auto" />
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm max-w-xs mx-auto">
          By continuing, you agree to our User Agreemenet and Privacy Policy.
        </p>

        {/* Form */}
        <UserAuthForm />

        {/* Link */}
        <p className="px-8 text-center text-sm text-zinc-700">
          Need an account?{' '}
          <Link
            href="/sign-up"
            className="hover:text-zinc-800 text-sm underline underline-offset-4"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};
