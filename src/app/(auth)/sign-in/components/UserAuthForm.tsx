'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FC, useState } from 'react';
import { signIn } from 'next-auth/react';
import { Icons } from '@/components/Icons';
import { useToast } from '@/hooks/use-toast';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const UserAuthForm: FC<UserAuthFormProps> = ({ className, ...props }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signIn('google');
    } catch (error) {
      toast({
        title: 'There was a problem',
        description: "We couldn't sign you in. Please try again later.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex justify-center', className)} {...props}>
      <Button
        onClick={loginWithGoogle}
        isLoading={isLoading}
        size="sm"
        className="w-full"
      >
        {isLoading ? null : <Icons.google className="h-6 w-6 pr-2" />}
        Google
      </Button>
    </div>
  );
};

export default UserAuthForm;
