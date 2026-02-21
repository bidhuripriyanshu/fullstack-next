
export const dynamic = 'force-dynamic'
import style from "./home.module.scss"
import Image from 'next/image';
const Home = () => {
  // const randomNumber = Math.random()
  // if(randomNumber>0.5){
  //     throw new Error("Error occoured")
  // }
  // console.log(randomNumber)
  return (    
    <>
      <div>
        <h1 className={style.title}>Home Page</h1>
        <p>Welcome to our website!</p>
         <Image
        src="/app/profile.png"
        width={500}
        height={500}
        alt="Picture of the author"
        quality={70}
      />
      </div>
    </>
  );
};

export default Home;