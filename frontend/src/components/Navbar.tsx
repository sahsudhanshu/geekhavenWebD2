import { useState, Fragment, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Transition, Dialog, MenuItem, MenuButton, MenuItems, TransitionChild, DialogTitle, DialogPanel } from '@headlessui/react';
import { Search, ShoppingCart, Heart, Bookmark, User, Menu as MenuIcon, X, PlusCircle } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/authContext';
import { ThemeButton } from './ThemeButton';
import { Logo } from './Logo';

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    clsx(
        'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-sky-400 transition-colors duration-200',
        { 'text-indigo-600 dark:text-sky-400 font-semibold': isActive }
    );

const Navbar = () => {
    const { token, userDetails } = useAuth() as any;
    const [isAuth, setIsAuth] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const cartItemCount = 3;

    useEffect(() => {
        if (token) {
            setIsAuth(true)
        } else {
            setIsAuth(false)
        }
    }, [token])

    const handleSearch = () => {
        if (searchQuery.trim() === '') return;
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        if (isMobileMenuOpen) {
            setMobileMenuOpen(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const UserProfileDropdown = () => (
        <Menu as="div" className="relative">
            <MenuButton className="flex items-center justify-center rounded-full h-10 w-10 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
                <User className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </MenuButton>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 dark:divide-slate-700 rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-1 py-1">
                        <MenuItem>
                            {({ focus }) => (
                                <NavLink
                                    to="/profile"
                                    className={`${focus ? 'bg-indigo-500 dark:bg-sky-500 text-white' : 'text-gray-900 dark:text-gray-200'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                >
                                    My Profile
                                </NavLink>
                            )}
                        </MenuItem>
                    </div>
                    <div className="px-1 py-1">
                        <MenuItem>
                            {({ focus }) => (
                                <button
                                    onClick={() => setIsAuth(false)}
                                    className={`${focus ? 'bg-indigo-500 dark:bg-sky-500 text-white' : 'text-gray-900 dark:text-gray-200'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                >
                                    Logout
                                </button>
                            )}
                        </MenuItem>
                    </div>
                </MenuItems>
            </Transition>
        </Menu>
    );

    const AuthLinks = () => (
        <>
            <Link
                to="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-sky-400 px-4 py-2"
            >
                Login
            </Link>
            <Link
                to="/register"
                className="ml-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                    background: 'var(--seed-accent)',
                    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.06)'
                }}
            >
                Sign Up
            </Link>
        </>
    );

    const DesktopNav = () => (
        <div className="hidden lg:flex items-center justify-between h-full">
            <div className="flex items-center space-x-8">
                <Logo />
                <nav className="flex items-center space-x-6 text-sm font-medium">
                    <NavLink to="/about" className={navLinkClasses}>About</NavLink>
                </nav>
            </div>
            <div className="flex-1 max-w-lg">
                <div className="relative flex w-full items-center">
                    <input
                        type="search"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="w-full rounded-l-full border border-r-0 border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 py-2 pl-4 pr-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:z-10 focus:border-indigo-500 dark:focus:border-sky-500 focus:ring-0"
                    />
                    <button
                        onClick={handleSearch}
                        aria-label="Submit search"
                        className="inline-flex h-[38px] items-center justify-center rounded-r-full border border-transparent px-4 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                        style={{ background: 'var(--seed-accent)' }}
                    >
                        <Search className="h-5 w-5" />
                    </button>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => {
                        const isSeller = userDetails?.role === 'seller' || userDetails?.role === 'admin';
                        if (!token) navigate('/login', { state: { from: '/seller/upgrade' } });
                        else if (!isSeller) navigate('/seller/upgrade');
                        else navigate('/seller/dashboard');
                    }}
                    className="hidden md:inline-flex items-center gap-2 rounded-full btn-accent px-5 py-2 text-sm font-semibold shadow-sm hover:brightness-110 focus:outline-none"
                >
                    <PlusCircle className="h-5 w-5" /> Sell
                </button>
                {isAuth ? (
                    <div className="flex items-center space-x-2">
                        <Link to="/favorites" className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700" title="Liked Products">
                            <Heart className="h-6 w-6" />
                        </Link>
                        <Link to="/bookmarks" className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-sky-400 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700" title="Bookmarked Products">
                            <Bookmark className="h-6 w-6" />
                        </Link>
                        <Link to="/cart" className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-sky-400 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                            <ShoppingCart className="h-6 w-6" />
                            {cartItemCount > 0 && <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">{cartItemCount}</span>}
                        </Link>
                        <UserProfileDropdown />
                    </div>
                ) : <AuthLinks />}
                <ThemeButton />
            </div>
        </div>
    );

    const MobileNav = () => (
        <div className="lg:hidden flex items-center justify-between h-full">
            <Logo />
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-gray-700 dark:text-gray-300">
                <MenuIcon className="h-6 w-6" />
            </button>
        </div>
    );

    const MobileMenu = () => (
        <Transition show={isMobileMenuOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50 lg:hidden" onClose={setMobileMenuOpen}>
                <TransitionChild as={Fragment} enter="ease-in-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in-out duration-300" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </TransitionChild>
                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <TransitionChild as={Fragment} enter="transform transition ease-in-out duration-300" enterFrom="translate-x-full" enterTo="translate-x-0" leave="transform transition ease-in-out duration-300" leaveFrom="translate-x-0" leaveTo="translate-x-full">
                                <DialogPanel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-slate-900 py-6 shadow-xl">
                                        <div className="px-4 sm:px-6 flex justify-between items-center">
                                            <DialogTitle className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">Menu</DialogTitle>
                                            <button type="button" className="rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" onClick={() => setMobileMenuOpen(false)}>
                                                <X className="h-6 w-6" />
                                            </button>
                                        </div>
                                        <div className="relative mt-6 flex-1 px-4 sm:px-6">
                                            <div className="relative flex w-full items-center mb-6">
                                                <input type="search" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyPress} className="w-full rounded-l-full border border-r-0 border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 py-2 pl-4 pr-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:z-10 focus:border-indigo-500 dark:focus:border-sky-500 focus:ring-0" />
                                                <button onClick={handleSearch} aria-label="Submit search" className="inline-flex h-[38px] items-center justify-center rounded-r-full border border-transparent px-4 text-white transition-colors" style={{ background: 'var(--seed-accent)' }}>
                                                    <Search className="h-5 w-5" />
                                                </button>
                                            </div>
                                            <nav className="flex flex-col space-y-2 text-lg">
                                                {[
                                                    { to: "/marketplace", label: "Marketplace" },
                                                    { to: "/favorites", label: "Favorites" },
                                                    { to: "/bookmarks", label: "Bookmarks" },
                                                    { to: "/cart", label: "Shopping Cart" },
                                                    { to: "/about", label: "About" },
                                                ].map(item => (
                                                    <NavLink key={item.to} to={item.to} className={navLinkClasses} onClick={() => setMobileMenuOpen(false)}>{item.label}</NavLink>
                                                ))}
                                            </nav>
                                            <div className="mt-6 border-t border-gray-200 dark:border-slate-700 pt-6">
                                                {isAuth ? (
                                                    <div className="space-y-4">
                                                        <NavLink to="/profile" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-slate-800" onClick={() => setMobileMenuOpen(false)}>
                                                            <User className="h-5 w-5" /> My Profile
                                                        </NavLink>
                                                        <button onClick={() => { setIsAuth(false); setMobileMenuOpen(false); }} className="w-full text-left flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-slate-800">
                                                            Logout
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col space-y-3">
                                                        <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-md border border-gray-300 dark:border-slate-600 px-4 py-2 text-center font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800">Login</Link>
                                                        <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-4 py-2 text-center font-semibold text-white shadow-sm" style={{ background: 'var(--seed-accent)' }}>Sign Up</Link>
                                                    </div>
                                                )}
                                                <button onClick={() => {
                                                    const isSeller = userDetails?.role === 'seller' || userDetails?.role === 'admin';
                                                    if (!token) navigate('/login', { state: { from: '/seller/upgrade' } });
                                                    else if (!isSeller) navigate('/seller/upgrade');
                                                    else navigate('/seller/dashboard');
                                                    setMobileMenuOpen(false);
                                                }} className="mt-6 flex w-full items-center justify-center gap-2 rounded-md btn-accent px-4 py-3 text-sm font-semibold text-white shadow-sm">
                                                    <PlusCircle className="h-5 w-5" /> Sell an Item
                                                </button>
                                                <div className="mt-6 flex justify-center">
                                                    <ThemeButton />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );

    return (
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur-md dark:shadow-slate-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16">
                <DesktopNav />
                <MobileNav />
            </div>
            <MobileMenu />
        </header>
    );
};
export default Navbar