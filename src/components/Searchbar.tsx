'use client';

import { FC, useCallback, useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { Prisma, Subreddit } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import debounce from 'lodash.debounce';

interface SearchbarProps {}

export const Searchbar: FC<SearchbarProps> = ({}) => {
  const [input, setInput] = useState('');
  const {
    data: queryResults,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryFn: async () => {
      if (!input.trim()) {
        return [];
      }

      const { data } = await axios.get(`/api/search?q=${input}`);
      return data as Subreddit[] & {
        _count: Prisma.SubredditCountOutputType;
      };
    },
    queryKey: ['search'],
    enabled: false,
  });
  const router = useRouter();

  const request = debounce(async () => {
    refetch();
  }, 300);

  const debounceRequest = useCallback(() => {
    request();
  }, [request]);

  const onSearchSelection = (result: string) => {
    router.push(`/r/${result}`);
    router.refresh();
  };

  return (
    <Command className="relative rounded-lg border max-w-lg z-50 overflow-visible">
      <CommandInput
        className="outline-none border-none focus:border-none focus:outline-none ring-0"
        placeholder="Search communities..."
        value={input}
        onValueChange={(text) => {
          setInput(text);
          debounceRequest();
        }}
      />
      {input.length > 0 && (
        <CommandList className="absolute top-full inset-x-0 shadow rounded-b-md bg-white">
          {isFetched && <CommandEmpty>No results found</CommandEmpty>}
          {(queryResults?.length ?? 0) > 0 && (
            <CommandGroup heading="Communities">
              {queryResults?.map((subreddit) => (
                <CommandItem
                  onSelect={(e) => {
                    onSearchSelection(e);
                  }}
                  key={subreddit.id}
                  value={subreddit.name}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <a href={`/r/${subreddit.name}`}>{subreddit.name}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      )}
    </Command>
  );
};
