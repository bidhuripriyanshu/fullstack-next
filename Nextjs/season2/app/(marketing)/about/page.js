import Link from "next/link";

export const metadata ={
    title:"About",
}
export default function About(){
   return( <>
      <h1>About page</h1>
      <Link href ="/">Home</Link>
     </>
   )
}