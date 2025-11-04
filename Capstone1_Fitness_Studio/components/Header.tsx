'use client'
import Nav from "./Nav"
import MobileNav from "./MobileNav"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { MdMenu } from "react-icons/md"
import { usePathname } from "next/navigation"
import CartIcon from "./shopping/CartIcon"

// Định nghĩa kiểu User (đúng với BE trả về)
interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  dob: string;
  gender: string;
  membership: string | null;
  role: string;
  timetable: any[];
  createdAt: string;
  updatedAt: string;
}

const Header = ({ hideScrollNav = false }: { hideScrollNav?: boolean }) => {
  const [openNav, setOpenNav] = useState(false);
  const [headerActive, setHeaderActive] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const pathname = usePathname();

  // Load user từ localStorage khi mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("Stored user (on mount):", storedUser);
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as User;
        setUser(parsed);
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }

    const handleScroll = () => {
      setHeaderActive(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Mỗi lần navigate (pathname thay đổi) → log lại user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("Stored user (on route change):", storedUser);
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as User;
        setUser(parsed);
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    } else {
      setUser(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/"; // Reload về trang chủ
  };

  return (
    <header
      className={`${headerActive ? 'h-[100px]' : ' h-[124px]'}
      fixed max-w-[1920px] top-0 w-full bg-primary-200 transition-all z-50`}>
      <div className="container mx-auto h-full flex items-center justify-between">

        {/* logo */}
        <Link href='/'>
          <Image src={'/assets/img/logo.png'} alt="logo" width={117} height={55} />
        </Link>

        {/* mobile nav */}
        <MobileNav
          containerStyles={`${headerActive ? 'top-[90px]' : 'top-[124px]'}
          ${openNav ? ' max-h-max pt-8 pb-10 border-white/10'
              : ' max-h-0 pt-0 pb-0 overflow-hidden border-white/0'}
          flex flex-col text-center gap-8 fixed
          bg-primary-200 w-full left-0 text-base uppercase font-medium text-white transition-all lg:hidden `} />

        {/* desktop nav - only show if hideScrollNav is false */}
        {!hideScrollNav && (
          <Nav containerStyles='flex gap-4 text-white text-base uppercase font-medium transition-all duration-300 hidden xl:flex ' />
        )}

        {/* right side */}
        <div className="flex items-center gap-4">
          {/* Cart Icon - visible for all users */}
          <CartIcon />
          
          {/* Shopping Button - visible for all users */}
          <Link href="/shopping">
            <button className="hover:text-accent transition-all duration-300 text-base uppercase font-medium text-white flex items-center gap-2">
              <span className="hidden sm:inline">Shopping</span>
            </button>
          </Link>

          {/* If user is not logged in */}
          {!user ? (
            <div className='text-white flex items-center gap-4'>
              <Link href="/login">
                <button className="hover:text-accent transition-all duration-300 text-base uppercase font-medium">
                  Login
                </button>
              </Link>
              <Link href="/register">
                <button className="hover:text-accent transition-all duration-300 text-base uppercase font-medium">
                  Register
                </button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-white">
              {/* Avatar + Hello */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white text-primary-200 flex items-center justify-center font-bold">
                  {user.firstname?.charAt(0)}
                </div>
                <span>Hello {user.firstname} {user.lastname}</span>
              </div>

              {user && (
                <Link
                  href={
                    user.role === "admin"
                      ? "/admindashboard"
                      : user.role === "pt"
                        ? "/dashboard/trainer"
                        : "/dashboard"
                  }
                >
                  <button className="hover:text-accent transition-all duration-300 text-base uppercase font-medium">
                    Dashboard
                  </button>
                </Link>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="hover:text-accent transition-all duration-300 text-base uppercase font-medium"
              >
                Logout
              </button>
            </div>
          )}

          {/* toggle mobile nav */}
          <button onClick={() => setOpenNav(!openNav)} className="text-white xl:hidden">
            <MdMenu className="text-4xl" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
