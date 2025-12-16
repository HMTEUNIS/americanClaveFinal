import Link from 'next/link';
import Image from 'next/image';

export default function Navigation() {
  const navItems = [
    { label: 'Kip', href: '/kip' },
    { label: 'Music', href: '/music' },
    { label: 'Players', href: '/players' },
    { label: 'News', href: '/news' },
    { label: 'Words', href: '/words' },
    { label: 'Purchase', href: '/purchase' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="w-full bg-black">
      <div className="container mx-auto px-4 py-6">
     

        {/* Logo - slightly left of center */}
        <div className="mb-4 flex justify-start">
          <div className="ml-0 md:ml-8">
            <Link href="/home" className="inline-block">
              <Image
                src="/discogsclave.jpg"
                alt="American Clavé"
                width={500}
                height={140}
                className="h-auto w-auto"
                priority
              />
            </Link>
          </div>
        </div>

        {/* Horizontal line */}
        <div className="w-full h-px bg-[#C0C0C0] mb-4"></div>

        {/* Navigation links - aligned to the right */}
        <div className="flex justify-end">
          <ul className="flex flex-wrap items-center gap-6 md:gap-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[#C0C0C0] hover:text-[#C0C0C0]/80 transition-colors text-lg md:text-xl font-medium"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

