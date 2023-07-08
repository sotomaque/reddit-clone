'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC } from 'react';

interface CloseModalProps {}

const CloseModal: FC<CloseModalProps> = ({}) => {
  const router = useRouter();

  const onClick = () => {
    router.replace('/');
  };

  return (
    <Button
      variant="ghost"
      className="h-6 w-6 p-0 rounded-md"
      onClick={onClick}
    >
      <X aria-label="close modal" className="h-4 w-4" />
    </Button>
  );
};

export default CloseModal;
