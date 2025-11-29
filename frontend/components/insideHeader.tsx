"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"; 

const nav_links = "flex items-center justify-center text-[#FFFDF9] gap-2 text-xl h-10 sm:h-12 px-4 font-semibold";
const button_styles = "rounded-xl border border-2 border-solid transition-colors flex items-center justify-center gap-2 font-bsemibold text-lg sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-30";

export default function homeHeader() {
    const router = useRouter(); 

    const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");

    router.push("/authentication/login");
    };

  return (
        <header className="w-full flex items-center bg-[#248700] w-full justify-between px-6 py-4">
            <div className="flex flex-row  items-center justify-between w-full">
                <Image src={"/logo/UserLogo.png"} alt="Logo" width={100} height={38} priority className="ml-15" />
                    <div className="flex gap-4 sm:gap-6 mr-4 sm:mr-6 items-center">
                        <Link href="/dashboard-user/profile" className={nav_links}>
                            My Profile
                        </Link>
                        <Link href="/dashboard-user/intakeLogs" className={nav_links}>
                            Intake Logs
                        </Link>
                        <Link href="/dashboard-user/statistics" className={nav_links}>
                            Statistics
                        </Link>
                    </div>
                    <div className="flex gap-4 mr-15">
                        <button onClick={handleLogout} className={`${button_styles} bg-[#FFF6E8] border-[#B2A48C] text-[#665944] hover:bg-[#B2A48C] hover:text-white`}>
                            Logout
                        </button>
                    </div>
                </div>
        </header>    
  );
}

