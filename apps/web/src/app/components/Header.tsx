import React from 'react'
import Logo from './logo'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function Header() {
    const navItems = {
        home: { phrase: 'Home', href: '/' },
        howItWorks: { phrase:' How It Works', href: '/how-it-works' },
        deals: { phrase: 'Deals', href: '/deals' },
        faq: { phrase: 'FAQ', href: '/faq' },
    }

  return (
    <header>
        <nav className="flex items-center justify-between py-4 px-8 ">
            <Logo/>
            <ul className="flex space-x-6">
                {Object.values(navItems).map((item) => (
                    <li key={item.href}>
                        <Button size="lg" className='rounded-4xl bg-[#FFFFFF33] hover:bg-[#FFFFFF66] px-6'>
                            <Link href={item.href} className='text-white font-semibold text-[20px]'>{item.phrase}</Link>
                        </Button>
                    </li>
                ))}
            </ul>
            <div>
                <Button size={"lg"} className='rounded-4xl bg-white hover:bg-[#FFFFFF77] px-7'>
                    <Link href="/" className='text-[#1D4ED8] text-[20px] font-bold '>Partner with us</Link>
                </Button>
            </div>
        </nav>
    </header>
  )
}

export default Header