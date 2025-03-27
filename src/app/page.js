
import Head from 'next/head';
import Wrapper from "@/components/Wrapper";
export default function Home() {
  return (<>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="shortcut icon" href="/favicon.ico" />
      
    </Head>
    <main className="">
      <Wrapper />
    </main>
  </>);
}
