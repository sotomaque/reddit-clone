'use client';

import type { FC } from 'react';
import { useForm } from 'react-hook-form';

import {
  UsernameValidator,
  type UsernameRequest,
} from '@/lib/validators/username';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@prisma/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface UsernameFormProps {
  user: Pick<User, 'id' | 'username'>;
}

export const UsernameForm: FC<UsernameFormProps> = ({ user }) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<UsernameRequest>({
    resolver: zodResolver(UsernameValidator),
    defaultValues: {
      name: user?.username || '',
    },
  });
  const router = useRouter();
  const { mutate: updateUsername, isLoading } = useMutation({
    mutationFn: async ({ name }: UsernameRequest) => {
      const payload: UsernameRequest = {
        name,
      };

      const { data } = await axios.patch('/api/username', payload);
      return data;
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          return toast({
            title: 'Username already exists.',
            description: 'Please try another username.',
            variant: 'destructive',
          });
        }
      }

      toast({
        title: 'Something went wrong.',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    },
    onMutate: () => {
      toast({
        title: 'Changing your username...',
        description: 'Please wait while we change your username.',
      });
      router.refresh();
    },
  });

  return (
    <form
      onSubmit={handleSubmit((e) => {
        updateUsername(e);
      })}
    >
      <Card>
        <CardHeader>
          <CardTitle>Your username</CardTitle>
          <CardDescription>Please enter a username.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="relative grid gap-1">
            <div className="absolute top-0 left-0 w-8 h-10 grid place-items-center">
              <span className="text-sm text-zinc-400">u/</span>
            </div>

            <Label className="sr-only" htmlFor="name">
              Name
            </Label>
            <Input
              id="name"
              className="w-[400px] pl-6"
              size={32}
              {...register('name')}
            />

            {errors?.name && (
              <p className="px-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={isLoading} isLoading={isLoading}>
            Change name
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};
