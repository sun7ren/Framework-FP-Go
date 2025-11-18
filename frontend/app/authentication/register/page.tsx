"use client";

import HomeHeader from "../../../components/homeHeader";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChangeEvent } from "react";

const input_styles = "border border-black border-2 rounded-lg px-5 py-5 focus:outline-none focus:ring-2 focus:ring-[#5D9008] text-lg";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState<string>("User");

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
      setRole(e.target.value);
  };

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

        <div className="w-1/2 flex flex-col align-center items-center">
          <h1 className="text-5xl font-bold mb-4 mt-8 text-center text-[#1E6F01]">
            Register <span className="text-[#ED9417] italic font-bold">Now</span> 
          </h1>

          <form
            className="flex flex-col gap-10 px-20 mt-10 w-full max-w-2xl"
          >
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={input_styles}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={input_styles}
                required
            />
            <select
                value={role}
                onChange={handleRoleChange} 
                className={`${input_styles} pr-10`} 
                required
            >
                <option value="User">Register as User</option>
                <option value="Nutritionist">Register as Nutritionist</option>
            </select>

            {error && <p className="text-red-500 text-center">{error}</p>}
            <button
                type="submit"
                className={`${input_styles} bg-[#2B840B] border-[#1E6F01] font-bold text-white hover:bg-[#5D9008] hover:text-white cursor-pointer`}
            >
                Register
            </button>
          </form>
          <p className="text-xl mt-10 text-[#775B2B] font-bold">Already have an account?
            <Link href="/authentication/login" className="text-[#2B840B]"> Login here</Link>
          </p>

        </div>
      </div>
    </>
  );
}
