"use client";

import HomeHeader from "../../../components/homeHeader";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const input_styles = "border border-black border-2 rounded-lg px-5 py-5 focus:outline-none focus:ring-2 focus:ring-[#5D9008] text-lg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <>
      <HomeHeader />
      <div className="mt-10 flex flex-row items-center px-4">
        <div className="w-1/2 flex justify-center items-center">
          <Image
            src="/login-regis.png"
            alt="Image Login-Register"
            width={500}
            height={500}
            className="mx-auto mt-20"
          />
        </div>

        <div className="w-1/2 flex flex-col align-center items-center mt-5">
          <h1 className="text-5xl font-bold mb-3 text-center text-[#1E6F01]">
            Login to 
          </h1>
          <h1 className="text-5xl font-bold mb-4 text-center text-[#1E6F01]">
            start <span className="text-[#ED9417] italic font-bold">logging</span> 
          </h1>

          <form
            className="flex flex-col gap-10 px-20 mt-10 w-full max-w-2xl"
          >
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${input_styles} bg-white`}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${input_styles} bg-white`}
                required
            />

            {error && <p className="text-red-500 text-center">{error}</p>}
            <button
                type="submit"
                className={`${input_styles} bg-[#2B840B] border-[#1E6F01] font-bold text-white hover:bg-[#5D9008] hover:text-white cursor-pointer`}
            >
                Login
            </button>
          </form>
          <p className="text-xl mt-10 text-[#775B2B] font-bold">Don't have an account yet? 
            <Link href="/authentication/register" className="text-[#2B840B]"> Register here</Link>
          </p>

        </div>
      </div>
    </>
  );
}
