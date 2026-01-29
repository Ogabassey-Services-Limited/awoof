'use client';

import React from 'react'
import Logo from './logo'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

function Header() {
    const { isAuthenticated, user, logout } = useAuth();
    const navItems = {
        home: { phrase: 'Home', href: '/' },
        howItWorks: { phrase: ' How It Works', href: '/how-it-works' },
        deals: { phrase: 'Deals', href: '/deals' },
        faq: { phrase: 'FAQ', href: '/faq' },
    }

    return (
        <header>
            <nav className="flex items-center justify-between py-4 px-8 ">
                <Logo />
                <ul className="flex space-x-6">
                    {Object.values(navItems).map((item) => (
                        <li key={item.href}>
                            <Button size="lg" className='rounded-4xl bg-[#FFFFFF33] hover:bg-[#FFFFFF66] px-6'>
                                <Link href={item.href} className='text-white font-semibold text-[20px]'>{item.phrase}</Link>
                            </Button>
                        </li>
                    ))}
                </ul>
                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <Link href={user?.role === 'vendor' ? '/vendor/dashboard' : '/marketplace'}>
                                <Button size={"lg"} variant="outline" className='rounded-4xl px-7'>
                                    <span className='text-[#1D4ED8] text-[20px] font-bold'>{user?.role === 'vendor' ? 'Dashboard' : 'Marketplace'}</span>
                                </Button>
                            </Link>
                            <Button
                                size={"lg"}
                                variant="ghost"
                                className='rounded-4xl px-7'
                                onClick={logout}
                            >
                                <span className='text-white text-[20px] font-bold'>Logout</span>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/auth/student/login">
                                <Button size={"lg"} variant="outline" className='rounded-4xl px-7'>
                                    <span className='text-white text-[20px] font-bold'>Login</span>
                                </Button>
                            </Link>
                            <Button size={"lg"} className='rounded-4xl bg-white hover:bg-[#FFFFFF77] px-7'>
                                <Link href="/auth/vendor/register" className='text-[#1D4ED8] text-[20px] font-bold '>Partner with us</Link>
                            </Button>
                        </>
                    )}
                </div>
            </nav>
        </header>
    )
}

export default Header