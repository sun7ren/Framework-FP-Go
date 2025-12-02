import Image from "next/image";
import Link from "next/link";

const nav_links = "flex items-center justify-center text-[#2B840B] gap-2 hover:text-[#5E9006] text-xl h-10 sm:h-12 px-4 font-bold";
const button_styles = "rounded-xl border border-2 border-solid transition-colors flex items-center justify-center gap-2 font-bold text-lg sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-30";

export default function homeHeader() {
  return (
        <header className="w-full flex items-center bg-[#FAF7F2] w-full justify-between px-6 py-4">
            <div className="flex flex-row  items-center justify-between w-full">
                <Image src={"/logo/NormalLogo.png"} alt="Logo" width={100} height={38} priority className="ml-15" />
                    <div className="flex gap-4 sm:gap-6 mr-4 sm:mr-6 items-center">
                        <Link href="/" className={nav_links}>
                            Home
                        </Link>
                        <Link href="/#aboutUs" className={nav_links}>
                            About Us
                        </Link>
                        <Link href="/#contact" className={nav_links}>
                            Contact
                        </Link>
                    </div>
                    <div className="flex gap-4 mr-15">
                        <Link href="/authentication/login" className={`${button_styles} bg-[#2B840B] border-[#1E6F01] text-white hover:bg-[#5D9008] hover:text-white`}>
                            Login
                        </Link>
                        <Link href="/authentication/register" className={`${button_styles} bg-white border-[#2B840B] text-[#2B840B] hover:bg-white hover:text-[#5D9008]`}>
                            Register
                        </Link>
                    </div>
                </div>
        </header>    
  );
}

