import HomeHeader from "../components/homeHeader";
import Image from "next/image";

const section_styles = "flex justify-center items-center w-full min-h-screen py-52";
const rectangle_styles = "bg-[#FFFCF7] bg-opacity-80 p-10 rounded-xl w-full text-center shadow-2xl";
const list_styles = "list-disc space-y-4 mb-8 text-2xl font-bold text-left text-[#ED9417]";

const backgroundImages = {
  home: "bg-[url('/home-bg/greenBg.png')] bg-cover bg-center", 
  aboutUs: "bg-[url('/home-bg/middleBg.png')] bg-cover bg-center",
  contact: "bg-[url('/home-bg/endBg.png')] bg-cover bg-center",
};

const bowlImage = {
  bowl1: "/home-bowl/bowl1.png",
  bowl2: "/home-bowl/bowl2.png",
};


export default function Home() {
  return (
    <>
      <HomeHeader />

      <div className="h-120 flex-row bg-[#FAF7F2] w-full flex items-center justify-between px-6 py-4">
        <div className="flex flex-col justify-center mx-20 h-full">
          <h1 className="text-8xl font-bold text-left text-[#1E6F01]">CaloriSync</h1>
          <h2 className="mt-2 text-5xl text-left text-[#5E9006] font-bold mb-3">Turning Bites Into Insight</h2>
          <p className="text-2xl font-bold">Through us, you can track your daily intake</p>
          <p className="text-2xl font-bold">and get feedbacks towards</p>
          <p className="text-2xl font-bold">your nutritional intake.</p>
        </div>
        <div className="relative mr-60">
          <Image 
            src={bowlImage.bowl1} 
            alt="Bowl Image" 
            width={300}
            height={300}
            className="object-contain"
            priority 
          />
          <Image 
            src={bowlImage.bowl2} 
            alt="Bowl Image" 
            width={200}
            height={200}
            className="object-contain mr-100 -mt-25 absolute top-20"
            priority 
          />
        </div>
      </div>
  
      <section 
        id="home" 
        className={`${section_styles} ${backgroundImages.home} flex flex-col`}
      >
        <h1 className="font-bold text-white text-6xl mb-6">Have you <span className="italic font-bold">Ever...</span></h1>
        <div className="flex justify-center items-center w-full px-4 max-w-5xl">
          <div className="flex gap-10 items-center flex-col">
            <img src="/question.png" alt="Question Mark" className="w-28 h-45 mr-25 relative" />
            <img src="/question.png" alt="Question Mark" className="w-28 h-45 mr-25 mt-10 relative rotate-30" />
          </div>
         <div className={`h-80 flex flex-col`}>
            <p className={`${rectangle_styles} ${list_styles}`}>Have you ever 
              <span className="text-[#1F6805]"> felt confused about 
              your daily food intake?</span>
            </p>
            <p className={`${rectangle_styles} ${list_styles}`}>Have you ever 
              <span className="text-[#1F6805]"> tried to eat healthier but 
              still felt unsure whether you were eating too much or too little?</span>
            </p>
            <p className={`${rectangle_styles} ${list_styles} mb-20`}>Have you ever 
              <span className="text-[#1F6805]"> wished someone could just tell you if you’re on the right track, 
              without making nutrition feel complicated?
              </span></p>
          </div>
        </div>
      </section>
      
      <section 
        id="aboutUs" 
        className={`${section_styles} ${backgroundImages.aboutUs} sticky top-0 h-screen`}
      >
        <div className="flex justify-center items-center w-full max-w-5xl px-4">
          <div className={`${rectangle_styles} h-120 flex flex-col rotate-[-2deg]`}>
            <h1 className="text-6xl font-bold text-[#665944] mb-5 text-left">About Us</h1>
            <p className="mt-4 text-2xl mb-5 mr-25 font-bold text-left">
              <span className="text-[#ED9417]">CaloriSync</span> helps you understand whether your daily food intake matches your personal BMR, 
              giving you a simple way to stay aware of your eating habits. </p>
            <p className="mt-2 text-2xl mr-15 font-bold text-left">
              <span className="text-[#ED9417]">Users</span> can log their meals and instantly see if they are within, below, or 
              above their recommended intake. <span className="text-[#ED9417]">Nutritionists</span> can review these logs and leave personalized comments, 
              offering guidance that’s easy to follow and tailored to your daily choices.</p>
          </div>
        </div>
        <img src="/utensils.png" alt="About Us Decor" 
        width={400}
        height={700}
        className="absolute right-20 mt-25" />
      </section>
 
      <section 
        id="contact" 
        className={`${section_styles} ${backgroundImages.contact} sticky top-0 h-screen`}
      >
        <div className="flex justify-center items-center w-full max-w-5xl px-4">
          <div className={`${rectangle_styles}  h-160 flex flex-col rotate-[2deg]`}>
            <h1 className="text-6xl font-bold text-[#775B2B] mb-5">Our Contact</h1>
            <div className="flex justify-between mx-20 mt-10">
              <div className="flex flex-col items-center">
                <img src="/home-bowl/bowl1.png" alt="Email Icon" className="w-60 h-60 mb-8 rounded-25" />
                <h1 className="px-12 py-2 rounded-lg bg-[#665944] text-white text-2xl mb-6 font-bold">Arini Nur Azizah</h1>
                <h2 className="text-[#ED9417] text-xl mb-1 font-bold">NRP. <span className="text-[#665944]">5025231079</span></h2>
                <h3 className="text-[#665944] text-lg font-bold">Github: @sun7ren</h3>
              </div>
              <div className="flex flex-col items-center">
                <img src="/home-bowl/bowl2.png" alt="Email Icon" className="w-60 h-60 mb-8 rounded-25" />
                <h1 className="px-12 py-2 rounded-lg bg-[#665944] text-white text-2xl mb-6 font-bold">Fazle Robby Pratama</h1>
                <h2 className="text-[#ED9417] text-xl mb-1 font-bold">NRP. <span className="text-[#665944]">5025231011</span></h2>
                <h3 className="text-[#665944] text-lg font-bold">Github: @obisagituya</h3>
              </div>
            </div>
          </div>
        </div>

      </section>

    </>
  );
}
