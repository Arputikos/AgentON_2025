import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="w-[30%] p-4 space-y-4">
      <h1 className="font-bold pb-10">Welcome to the debate room</h1>
      <Input placeholder="Enter debate topic or problem to solve"></Input>
      <Button className="w-full">
        <Link href="">Start debate</Link>
      </Button>
      </div>
    </div>
  );
}
