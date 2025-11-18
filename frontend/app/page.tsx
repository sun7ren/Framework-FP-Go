import HomeHeader from "../components/homeHeader";

const section_styles = "flex justify-center items-center h-screen";

export default function Home() {
  return (
    <>
      <HomeHeader />
      <section id="home" className={`${section_styles} bg-[#FAF7F2]`}>
        <h1 className="text-4xl">Home Section</h1>
      </section>
      <section id="aboutUs" className={`${section_styles}  bg-[#DDD1BE]`}>
        <h1 className="text-4xl">About Us Section</h1>
      </section>
      <section id="contact" className={`${section_styles} bg-[#B2A48C]`}>
        <h1 className="text-4xl">Our Contacts Section</h1>
      </section>
    </>
  );
}
