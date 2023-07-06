import { SignIn } from '@/app/(auth)/sign-in/components/SignIn';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="absolute inset-0">
      <div className="mt-20 h-4 max-w-2xl mx-auto flex flex-col items-center justify-center gap-20">
        <Link
          href="/"
          className={
            (cn(
              buttonVariants({
                variant: 'ghost',
              })
            ),
            'text-black')
          }
        >
          Home
        </Link>

        <SignIn />
      </div>
    </div>
  );
}
