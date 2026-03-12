'use client';
import Link from 'next/link';
import NavLinks from '@/app/ui/home/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import { PowerIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/app/supabase-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function SideNav() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.auth.signOut();
      router.push('/login');
      if (error) {
        throw error
      }

    } catch (err) {
      toast.error('Error signing out');
    }

  };

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <div
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
      >
        <div className="w-32 text-white md:w-40">
          <AcmeLogo />
        </div>
      </div>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        <form onSubmit={handleSubmit}>
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}
