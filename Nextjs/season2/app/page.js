import Link from "next/link";

export default function Home() {
  return (
    <>
     <h1>welcome to my home</h1>
     <Link href ="/about">About</Link>
     <br></br>
     <Link href ="/blogs">Blogs</Link> <br></br>

     <Link href = "/service">Services</Link>
     </>
     
  );
}
