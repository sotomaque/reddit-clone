import Link from 'next/link';
import { toast } from './use-toast';
import { buttonVariants } from '@/components/ui/button';

export const useCustomToast = () => {
  const loginToast = () => {
    const { dismiss } = toast({
      title: 'Login Requried.',
      description: 'You must be logged in to do that.',
      variant: 'destructive',
      action: (
        <Link
          onClick={() => dismiss()}
          href={'/sign-in'}
          className={buttonVariants({
            variant: 'outline',
            className: 'text-black',
          })}
        >
          Login
        </Link>
      ),
    });
  };

  return {
    loginToast,
  };
};
