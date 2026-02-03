import Link from "next/link"
export default function Service(){
     return (
        <>
         <h1>Service page</h1>
         <Link href="/">Home</Link>
         <h1>Here are list of services provided our appliaction</h1>
         <Link href ="/service/web-dev"> web-dev service</Link> 
         <br></br>
         <Link href ="/service/seo">seo service</Link>
         <br></br>
         <Link href ="/service/ai-ml"> ai-ml service</Link>
        </>
     )
}