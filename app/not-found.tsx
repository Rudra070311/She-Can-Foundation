import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Image src="/s.jpg" alt="She Can Foundation Logo" width={128} height={128} className="mb-8 rounded-full" />
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl text-gray-600">Page Not Found</p>
    </div>
  );
}