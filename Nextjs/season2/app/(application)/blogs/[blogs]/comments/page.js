export default async function Comments({params}){
      const paraObj = await params;
      const {blogID} = paraObj;

      console.log(paraObj);
      return(
        <>
         <div>
             All Comments on <b>{blogID}</b>
         </div>
        </>
      )

}